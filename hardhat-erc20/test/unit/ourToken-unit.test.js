const { assert } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("OurToken Unit Test", function () {
      // 设置科学记数法变量,方便后续使用
      const multilier = 10 ** 18;
      let ourToken, deployer, user1;

      beforeEach(async function () {
        const accounts = await getNamedAccounts();
        deployer = accounts.deployer;
        user1 = accounts.user1;

        await deployments.fixture("all");
        ourToken = await ethers.getContract("OurToken", deployer);
      });

      it("Test1.成功部署", async function () {
        assert(ourToken.address);
      });

      // 测试constructor构造函数
      describe("constructor", function () {
        it("Test2.得到正确数量的初始代币", async function () {
          const totalSupply = await ourToken.totalSupply();
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });
        it("Test3.正确地初始化代币的名称和标志", async function () {
          const name = await ourToken.name;
          assert.equal(name.toString(), "FanToken");
          const symbol = await ourToken.symbol;
          assert.equal(symbol.toString(), "FT");
        });
      });

      // 测试transfer()
      describe("transfer", function () {
        it("Test4.成功将代币转移到另一地址", async function () {});
        it("Test5.调用trandfer()时,触发transfer事件", async function () {});
      });
    });
