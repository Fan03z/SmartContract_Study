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
      let raffleEntrance;
      // 定义当前所在链的Id
      const chainId = network.config.chainId;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        raffleEntrance = await raffle.getEntranceFee();
      });

      // 测试Raffle中的constructor()构造函数
      describe("constructor", function () {
        // 理想情况下,一般一个it()测试里只出现一次断言assert()
        it("Test1.正确的初始化raffle活动", async function () {
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();
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
          await raffle.enterRaffle({ value: raffleEntrance });
          // 获得最近一位参与玩家名单
          const playerFromContract = await raffle.getPlayer(0);
          assert.equal(playerFromContract, deployer);
        });
      });
    });
