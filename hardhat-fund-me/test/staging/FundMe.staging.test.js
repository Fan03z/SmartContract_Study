// staging文件夹内存放 暂存测试 文件
// 是挂上实际测试网上的测试,为集成测试,为挂上主网前的最后测试

const { deployments, ethers, getNamedAccounts } = require("hardhat");
// 导入实际开发测试链名
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

// 用三元运算符,判断是否为实际测试链,不是则跳过,确认是才跑集成测试
developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe;
      let deployer;
      let sendValue = ethers.utils.parseEther("1");

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("允许打钱和撤回资金", async function () {
        // 调用fund()和withdraw()
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        // 记录撤回后合约账户余额
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        // 断言最后合约账户余额为0
        assert.equal(endingBalance.toString(), "0");
      });
    });
