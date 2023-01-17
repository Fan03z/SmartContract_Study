// unit文件夹内存放 单元测试 文件
// 单元测试尽量在本地跑

// 由于deployments和getNamedAccounts()就是从hardhat部署的hre环境对象中解构出来的,因此也可以直接从hardhat上导入
const { deployments, ethers, getNamedAccounts } = require("hardhat");
// 导入实际开发测试链名
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

// 用三元运算符,判断是否为本地测试链,不是则跳过,确认是才跑单元测试
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      // 定义合约名和部署账户,供后续赋值和引用
      let fundMe;
      let mockV3Aggregator;
      let deployer;
      // 事先定义测试的发送value,默认单位为Gwei,1*10e18Gwei = 1ETH
      // let sendValue = "1*10e18";
      // 利用ethers.utils.parseEther(),直接获得1ETH的等价value
      // 或者ethers.utils.parseUnits(),不过要多加入一个参数,定义单位:
      // let sendValue = ethers.utils.parseUnits("1", ether);
      let sendValue = ethers.utils.parseEther("1");

      // 每次测试前都部署一遍合约
      beforeEach(async function () {
        // 与deploy.js部署脚本文件内一样,获得合约的部署账户
        // const { deployer } = await getNamedAccounts();
        // 因为deployer在外部声明了,就语法上换一下:
        deployer = (await getNamedAccounts()).deployer;
        // 除了deployer这样外,另一种获取部署合约账户的方法:
        // const accounts = await ethers.getSigners();
        // 如果是部署在本地hardhat测试网这些上的话,会返回个包含多个账户的数组,则可能要另外从数组中提个出来:
        // const accountsZero = accounts[0];

        // 部署deploy文件夹中带有 all 标签的合约 (一般在每个部署合约标签上都加上all)
        await deployments.fixture(["all"]);

        // hardhat-deploy中提供了getContract(),可以获得最近一次部署的所有合约信息
        // 获得部署的FundMe合约,并连接上部署账户,指定后面都是用该账户调用FundMe合约函数的
        fundMe = await ethers.getContract("FundMe", deployer);
        // 同理
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      // 测试FundMe中的constructor()构造函数
      describe("constructor", function () {
        it("Test1.AggregatorV3Interface对象正确设置", async function () {
          // 获得fundMe中AggregatorV3Interface对象 getPriceFeed(s_priceFeed)
          const response = await fundMe.getPriceFeed();
          // 判断模拟的和实际的AggregatorV3Interface对象地址是否相同
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      // 测试fund()
      describe("fund", function () {
        it("Test2.若未发送足够的钱,则发送失效", async function () {
          // 此处直接调用fundMe的fund(),未定义多少钱,理论上是会发送失败报错的
          // 此处也正是测试这个功能,即钱少会不会发送失败报错
          // 用expect()预判错误,期望事情失败,并用 revertedWith() 预判失败原因,或者用 reverted 直接预判失败
          await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough.");
        });

        it("Test3.更新s_addressToAmountFunded[]", async function () {
          // 调用fund(),向合约内发送足够的钱
          await fundMe.fund({ value: sendValue });
          // 根据发送钱的账户,查询s_addressToAmountFunded[]内记录的值
          const response = await fundMe.getAddressToAmountFunded(deployer);
          // 断言s_addressToAmountFunded[]内记录的值 = sendValue
          assert.equal(response.toString(), sendValue.toString());
        });

        it("Test4.更新s_funders[]", async function () {
          await fundMe.fund({ value: sendValue });
          // 由于为全新的合约,故调用fund()后,deployer应该为下标为0的第一个s_funders
          // 查询s_funders[0]的值
          const funder = await fundMe.getFunder(0);
          // 断言s_funders[0] = deployer
          assert.equal(funder, deployer);
        });
      });

      // 测试withdraw()
      describe("withdraw", function () {
        // 测试每次撤回资助时,先利用账户发送钱来
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });

        it("Test5.成功撤回资助", async function () {
          // 记录撤回前的合约账户和外部账户余额
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // 运行withdraw()
          const transactionResponse = await fundMe.withdraw();
          // 等待区块确认撤回,得到交易收据
          const transactionReceipt = await transactionResponse.wait(1);

          // 断点调试可以查看到transactionReceipt对象的具体内容
          // 从交易收据中解构得到gas的使用量和当时gas价格的信息对象
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          // 计算gas成本
          // 由于gasUsed和effectiveGasPrice二者都是BigNumber数据类型,二者相乘使用 mul()
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // 记录撤回后的合约账户和外部账户余额
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // 断言撤回后的合约账户余额为0
          assert.equal(endingFundMeBalance, 0);
          // 总金额不变,包括计算上gas费用
          // 注意调用fundMe.provider.getBalance()后得到的是 BigNumber 数据类型
          // 处理BigNumber数据类型间的加法用 add() 方便些
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("Test6.撤回多个资助", async function () {
          // 获得本地多个账户
          const accounts = await ethers.getSigners();

          // 每个账户都遍历一遍fund()
          for (let i = 0; i < 6; i++) {
            // 更换连接合约的账户
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          // 同单个测试,即Test5
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // 确保s_funders都被清除还原
          await expect(fundMe.getFunder(0)).to.be.reverted;
          // 确保s_addressToAmountFunded[]中每项地址都被还原为0
          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Test7.只允许owner撤回资助", async function () {
          // 获得本地多个账户
          const accounts = await ethers.getSigners();
          // 定义下标为1或者其他不为0的账户为攻击者,因为资助是由0号账户发起的
          const attacker = accounts[1];
          // 更换连接合约的账户为攻击者
          const attackerConnectedContract = await fundMe.connect(attacker);
          // 预判攻击者连接合约时调用withdraw()会失败报错,并且revertedWithCustomError()预判为自定义错误
          // revertedWithCustomError(错误所在合约 , 自定义的错误)
          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
      });

      // 有空it()的话,测试会报错
      // it();
    });
