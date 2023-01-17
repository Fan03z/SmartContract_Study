/*
// 第一种语法: 
asnyc function deployFunc(hre) {
  const getNamedAccounts = hre.getNamedAccounts();
  const deployments = hre.deployments();
}
// 设置默认导出函数为deployFunc()
module.exports.default = deployFunc;
*/

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
// 下面等同于上句:
// const helperConfig = require("../helper-hardhat-config");
// const networkConfig = helperConfig.networkConfig
const { network } = require("hardhat");

// 从utils文件夹下文件导入验证代码发布的方法verify()
const { verify } = require("../utils/verify");

// 第二种语法:
// hre为hardhat运行时环境内容的对象,可以访问hardhat包内的内容 (配合参考Lsson5/HARDHAT-SIMPLE-STORAGE/tasks)
// 使用语法糖,下者又等于: module.exports = async ({ getNamedAccounts, deployments }) => {}
module.exports = async (hre) => {
  // ES6解构用法,对hre对象内的内容命名和赋值
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  // 插件 hardhat-deploy 允许命名你的账户
  // 要先在hardhat.config中定义namedAccounts
  // 通过getNamedAccounts()定义 deployer 是用于部署合约的账户
  const { deployer } = await getNamedAccounts();

  // 从hardhat。config.js上获取测试网的chainId
  const chainId = network.config.chainId;

  // helper-hardhat-config.js配合chainId实现根据chainId调整查询汇率信息API的合约地址
  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  // 为了兼容test内合约,改为下者:
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    // get()也可以在上面的deployments内解构得到
    // 如果是在开发测试链上,通过指向test/MockV3Aggregator.sol合约,将AggregatorV3Interface对象改为模拟中的MockV3Aggregator对象
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    // 并定义ETH兑货币的汇率API的合约地址
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    // 假如不在开发测试链上,则按之前的来
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // 定义部署的合约的参数列表
  const args = [ethUsdPriceFeedAddress];

  // 插件 hardhat-deploy 提供deploy()方法,从deployments中解构得到
  // deploy(合约名称 , 包含部署信息的对象) ,如下:
  const fundMe = await deploy("FundMe", {
    // 部署合约账户
    from: deployer,
    // 向合约构造函数传入的参数
    args: args,
    // 日志上打印交易信息,包括交易地址、gas等
    log: true,
    // 定义等待区块确认数
    waitConfirmations: network.config.blockConfirmation || 1,
  });

  // 判断如果不是部署在开发测试链上的话,就将合约代码开源发布在Etherscan上
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
  log("----------------------------");
};

module.exports.tags = ["all", "fundme"];
