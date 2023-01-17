require("@nomicfoundation/hardhat-toolbox");

// 导入dotenv
require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");

// 从tasks文件夹中添加任务
require("./tasks/block-number");

require("hardhat-gas-reporter");

// solidity-coverage进行安全检测
// yarn hardhat coverage
// 运行后会在终端打印测试结果表,并生成coverage.json文件和coverage文件夹
// 结果会提示未调用和未测试的代码行等
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */

const LOCAL_GANACHE_RPC_URL = process.env.LOCAL_GANACHE_RPC_URL;
const LOCAL_GANACHE_PRIVATE_KEY = process.env.LOCAL_GANACHE_PRIVATE_KEY;

const GOERLI_TEST_RPC_URL = process.env.GOERLI_TEST_RPC_URL;
const MetaMask_TEST_PRIVATE_KEY = process.env.MetaMask_TEST_PRIVATE_KEY;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
  solidity: "0.8.7",

  // 在没有声明部署网络时,默认部署在 hardhat Network 上
  // yarn hardhat node 查看hardhat测试网的节点
  defaultNetwork: "hardhat",
  // 想要调用其他声明在neworks上的区块链网络时,输入 yarn hardhat run deploy.js路径 --network network名
  // 例如: yarn hardhat run scripts/deploy.js --network ganache
  networks: {
    ganache: {
      url: LOCAL_GANACHE_RPC_URL,
      accounts: [LOCAL_GANACHE_PRIVATE_KEY],
      chainId: 1337,
    },
    goerli: {
      url: GOERLI_TEST_RPC_URL,
      accounts: [MetaMask_TEST_PRIVATE_KEY],
      chainId: 5,
    },
    // hardhat node测试网与hardhat network会有些不同,实际上是在本地主机上跑的
    // 因此要定义一个localhost的network
    // 在localhost上部署完合约或操作完后,可在node一端看到区块细则
    localhost: {
      // url在yarn hardhat node运行结果中可查看
      url: "http://127.0.0.1:8545/",
      // localhost不需要提供accounts
      // 与hardhat的chainId一致, 31337
      chainId: 31337,
    },
  },

  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
    },
  },

  // !!! 要开全局加增强 !!!
  // 允许hardhat-gas-reporter包获取合约 gas 信息
  // 通过gasReporter,可看到test中gas的消耗量等信息
  gasReporter: {
    // 允许输出gas信息
    enabled: true,
    // 将gas信息输出到指定文件
    outputFile: "gas-report.txt",
    // 由于输出到文件时,颜色可能会错乱,故不要添加颜色
    noColors: true,
    // 指定币种换算,用于gas计算成本
    // CNY USD
    currency: "CNY",
    // 为获取当前汇率信息,接入CoinMarketCapAPI
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
};
