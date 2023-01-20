// 通过helper-hardhat-config.js文件,实现需求:
// 如果 采用 network A 情况,则合约部署内的部分变量调整为 A对象下的变量;
// 如果 采用 network B 情况,则合约部署内的部分变量调整为 B对象下的变量; ...
// 从而实现部署代码模块化,即部署代码不变,而合约部署能根据测试网不同而调整部分变量

const networkConfig = {
  31337: {
    name: "localhost",
  },

  // 查询汇率信息API的合约地址可到 https://docs.chain.link/docs/reference-contracts 查询
  5: {
    name: "goerli",
    // 查询汇率信息API的合约地址
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};

// 定义哪条为开发测试链
const developmentChains = ["hardhat", "localhost"];
// 定义为模拟合约MockV3Aggregator.sol传入的参数
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

// 设置导出
module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER };
