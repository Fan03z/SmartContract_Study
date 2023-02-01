const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      // 定义合约和部署账户
      let raffle, vrfCoordinatorV2Mock, deployer;
      // 定义参与活动费
      let raffleEntranceFee;
      // 定义当前所在链的Id
      const chainId = network.config.chainId;
      // 定义开奖事件间隔
      let interval;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
      });

      // 测试Raffle中的constructor()构造函数
      describe("constructor", function () {
        // 理想情况下,一般一个it()测试里只出现一次断言assert()
        it("Test1.正确的初始化raffle活动", async function () {
          const raffleState = await raffle.getRaffleState();
          assert.equal(raffleState.toString(), "0");
          assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
        });
      });

      // 测试enterRaffle()
      describe("enterRaffle", function () {
        it("Test2.支付参与金额不足会取消", async function () {
          // 这里有点迷,遇到自定义错误问题,可以revertedWith()和revertedWithCustomError()都试试
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            "Raffle__NotEnoughETHEntered"
          );
        });

        it("Test3.记录下参与活动玩家", async function () {
          // 调用enterRaffle(),参与活动
          await raffle.enterRaffle({ value: raffleEntranceFee });
          // 获得最近一位参与玩家名单
          const playerFromContract = await raffle.getPlayer(0);
          assert.equal(playerFromContract, deployer);
        });

        it("Test4.玩家加入时触发事件", async function () {
          // expect检验触发事件: expect(调用触发事件所在函数).to.emit(合约名,触发事件名);
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.emit(raffle, "RaffleEnter");
        });

        it("Test5.当活动清算期间不能参与", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          // 查询参考: https://hardhat.org/hardhat-network/docs/reference
          // hardhat为测试提供了 evm_increaseTime 方法,用来人为增加区块时间
          // 下面使区块增加了开奖时间间隔加1的时间,从而满足活动进入清算环节条件
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          // hardhat还为测试提供了 evm_mine 方法,用来人为进行区块打包
          await network.provider.send("evm_mine", []);
          // 上者的另一语法:
          // await network.provider.request({ method: "evm_mine", params: [] });
          await raffle.performUpkeep([]); // 进入清算环节
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWith("Raffle__NotOpen");
        });
      });

      // 测试checkUpkeep()
      describe("checkUpkeep", function () {
        it("Test6.没人参与时返回false", async function () {
          // 同测试5
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          // 静态调用(callStatic),通过模拟调用得到结果,而不是真的调用,不会引发交易
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          // 断言区块内没人参与时返回false
          assert(!upkeepNeeded);
        });

        it("Test7.活动状态为未开放时返回false", async function () {
          // 模拟进入清算状态
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep([]); // 传入"0x"一样的,都表示空数据
          // 查询状态
          const raffleState = await raffle.getRaffleState();
          // 同测试6
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert.equal(raffleState.toString(), "1");
          assert(!upkeepNeeded);
        });

        it("Test8.时间间隔未到时返回false", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() - 5,
          ]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(!upkeepNeeded);
        });

        it("Test9.条件都满足时返回true", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(upkeepNeeded);
        });
      });

      // 测试performUpkeep()
      describe("performUpkeep", function () {
        it("Test10.只有checkUpkeep()返回true时才会跑performUpkeep()", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const tx = await raffle.performUpkeep([]);
          assert(tx);
        });

        it("Test11.当checkUpkeep()返回false时恢复并报错", async function () {
          await expect(raffle.performUpkeep([])).to.be.revertedWith(
            "Raffle__UpkeepNotNeeded"
          );
        });

        it("Test12.更新活动状态、触发事件、调起vrfCoordinator", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const txResponse = await raffle.performUpkeep([]);
          const txReceipt = await txResponse.wait(1);
          // 在调用performUpkeep()返回的收据中,找到requestId
          // 注意: 此处事件的下标为1,为不是0,是因为0为requestRandomWords()内触发的事件 RandomWordsRequested
          // 1才是我们添加的触发事件 RequestedRaffleWinner
          const requestId = txReceipt.events[1].args.requestId;
          const raffleState = await raffle.getRaffleState();
          assert(requestId.toNumber() > 0);
          assert.equal(raffleState.toString(), "1");
        });
      });

      // 测试fulfillRandomWords()
      describe("fulfillRandomWords", function () {
        // 每次测试时都会让人参与并打包区块,进入清算
        beforeEach(async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
        });

        it("Test13.只会在performUpkeep()之后被调用", async function () {
          // 参考源码地址(合约VRFCoordinatorV2Mock.sol内的地址): "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol"
          // 调用vrfCoordinatorV2Mock中的虚函数fulfillRandomWords(),传入requestId和消费者地址
          // 如果传入参数对不上,则报出错误
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
          ).to.be.revertedWith("nonexistent request");
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
          ).to.be.revertedWith("nonexistent request");
          // 很难对大量不同的requestId进行测试,后面会针对此进行模糊测试
        });

        it("Test14.选出赢家、发送钱款、重置活动", async function () {
          // 设置参与者为三个
          const additionalEntrants = 3;
          // 设置参与者起始下标 (下标0的账户为合约的部署账户deployer)
          const startingAccountIndex = 1;
          // 获得账户
          const accounts = await ethers.getSigners();
          // 遍历,将参与者与活动合约一一连接上,并参与到活动
          for (
            let i = startingAccountIndex;
            i < startingAccountIndex + additionalEntrants;
            i++
          ) {
            const accountConnectedRaffle = raffle.connect(accounts[i]);
            await accountConnectedRaffle.enterRaffle({
              value: raffleEntranceFee,
            });
          }
          // 记录当前时间戳
          const startingTimeStamp = await raffle.getLatestTimeStamp();

          // 由于不知道实际随机数响应到交易完成的具体时间,可能等待
          // 故而用promise和添加事件监听来确保运行事件触发后的验证活动重置
          await new Promise(async (resolve, reject) => {
            // 在hardhat.config文件中设置了响应超时对象
            // 设置监听事件"WinnerPicked"
            raffle.once("WinnerPicked", async () => {
              console.log("已触发事件!");
              try {
                // 在触发事件后,活动相关参数应该已被重置
                const recentWinner = await raffle.getRecentWinner();
                // 打印赢家
                console.log(recentWinner);
                // 打印账户,确定具体赢家
                console.log(accounts[0].address);
                console.log(accounts[1].address);
                console.log(accounts[2].address);
                console.log(accounts[3].address);
                const raffleState = await raffle.getRaffleState();
                const endingTimeStamp = await raffle.getLatestTimeStamp();
                const numPlayers = await raffle.getNumberOfPlayers();
                // 已知账户1为赢家,记录合约向其汇款后的账户余额
                const winnerEndingBalance = await accounts[1].getBalance();
                assert.equal(numPlayers.toString(), "0");
                assert.equal(raffleState.toString(), "0");
                assert(endingTimeStamp > startingTimeStamp);
                // 资金守恒
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance
                    .add(
                      raffleEntranceFee
                        .mul(additionalEntrants)
                        .add(raffleEntranceFee)
                    )
                    .toString()
                );
              } catch (e) {
                reject(e);
              }
              resolve();
            });
            // 模拟合约进行,从而触发事件"WinnerPicked"
            // 具体细节同Test12
            const tx = await raffle.performUpkeep([]);
            const txReceipt = await tx.wait(1);
            // 已知账户1为赢家,记录合约向其汇款前的账户余额
            const winnerStartingBalance = await accounts[1].getBalance();
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              raffle.address
            );
          });
        });
      });
    });
