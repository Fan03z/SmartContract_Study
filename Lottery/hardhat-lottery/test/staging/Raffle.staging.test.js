const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Staging Tests", function () {
      // 定义合约和部署账户
      let raffle, deployer;
      // 定义参与活动费
      let raffleEntranceFee;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("fulfillRandomWords", function () {
        it("通过实时的Chainlink keepers和Chainlink VRF得到一个随机赢家", async function () {
          console.log("设置测试中...");
          // 记录一开始的时间戳
          const startingTimeStamp = await raffle.getLatestTimeStamp();
          // 获得参与活动账户
          const accounts = await ethers.getSigners();

          console.log("设置监听器...");
          // 设置promise和事件监听;
          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("已触发WinnerPicked事件");
              try {
                // 查询活动状态和赢家状态
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                // 只有一人参与,是部署账户也是参与活动账,记录合约向其汇款后的账户余额
                const winnerEndingBalance = await accounts[0].getBalance();
                const endingTimeStamp = await raffle.getLatestTimeStamp();

                // 确认活动重置后状态
                // 应该没有参与活动账户
                await expect(raffle.getPlayer(0)).to.be.reverted;
                // 赢家等于唯一的一个参与者
                assert.equal(recentWinner.toString(), accounts[0].address);
                // 活动重新开放
                assert.equal(raffleState, 0);
                // 资金守恒
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                );
                // 时间流逝
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (error) {
                console.log(error);
                reject(error);
              }
            });
            console.log("参与活动中...");
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee });
            await tx.wait(1);
            console.log("等待确认中...");
            // 记录合约向其汇款前的账户余额
            const winnerStartingBalance = await accounts[0].getBalance();
          });
        });
      });
    });
