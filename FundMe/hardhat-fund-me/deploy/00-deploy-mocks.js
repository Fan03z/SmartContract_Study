// 用于在hardhat或者ganache这种本地环境测试合约部署
// 在contracts文件夹下新建test文件夹,并在里面放置在本地部署合约时添加模拟的sol文件

const { network } = require("hardhat");
// 导入定义好的测试链developmentChains,供下面做判断
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  // const chainId = network.config.chainId;

  // 判断是否为测试链,是的话再执行模拟
  // 或者是 if(chainId == "31337") 判断 (31337为helper-hardhat-config中定义的localhost)
  if (developmentChains.includes(network.name)) {
    // log()为打印日志,也由deployments中解构得到
    log("检测为本地测试网,部署模拟...");
    // 部署模拟合约MockV3Aggregator.sol
    await deploy("MockV3Aggregator", {
      // 明确执行模拟合约
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      // 为模拟合约MockV3Aggregator.sol的构造函数传入参数
      // 查看源码,可知构造函数需传入的参数是什么
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("模拟已部署!");
    log("----------------------------");
  }
};

// 为部署模块打上标签
// 打上 "mocks" 标签
module.exports.tags = ["all", "mocks"];
// yarn hardhat deploy --tags 标签名
// 则只运行带有此标签的部署合约
// 通过这样可以针对性的测试和部署特定的合约
