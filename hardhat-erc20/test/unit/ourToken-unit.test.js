const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("OurToken Unit Test", function () {
      // 设置科学记数法变量,方便后续使用
      const multiplier = 10 ** 18;
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
          const name = (await ourToken.name()).toString();
          assert.equal(name, "FanToken");
          const symbol = (await ourToken.symbol()).toString();
          assert.equal(symbol, "FT");
        });
      });

      // 测试transfer()
      describe("transfer", function () {
        it("Test4.成功将代币转移到另一地址", async function () {
          const tokensToSend = ethers.utils.parseEther("10");
          await ourToken.transfer(user1, tokensToSend);
          expect(await ourToken.balanceOf(user1)).to.equal(tokensToSend);
        });
        it("Test5.调用trandfer()时,触发transfer事件", async function () {
          expect(
            await ourToken.transfer(user1, (10 * multiplier).toString())
          ).to.emit(ourToken, "Transfer");
        });
      });

      // 测试allowance授权系列功能
      describe("allowances", function () {
        const amount = (20 * multiplier).toString();
        beforeEach(async function () {
          playerToken = await ethers.getContract("OurToken", user1);
        });
        it("Test6.授权其他地址转移代币", async function () {
          const tokensToSpend = ethers.utils.parseEther("5");
          await ourToken.approve(user1, tokensToSpend);
          await playerToken.transferFrom(deployer, user1, tokensToSpend);
          expect(await playerToken.balanceOf(user1)).to.equal(tokensToSpend);
        });
        it("Test7.未被授权的用户不允许发起代币转移", async function () {
          await expect(
            playerToken.transferFrom(deployer, user1, amount)
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
        it("Test8.调起approve()时,触发Approval事件", async function () {
          await expect(ourToken.approve(user1, amount)).to.emit(
            ourToken,
            "Approval"
          );
        });
        it("Test9.授权的代币数量准确", async function () {
          await ourToken.approve(user1, amount);
          const allowance = await ourToken.allowance(deployer, user1);
          assert.equal(allowance.toString(), amount);
        });
        it("Test10.不允许转移超额的授权代币", async function () {
          await ourToken.approve(user1, amount);
          await expect(
            playerToken.transferFrom(
              deployer,
              user1,
              (40 * multiplier).toString()
            )
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
      });
    });
