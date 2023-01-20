require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

// 导入hardhat-deploy
// hardhat-deploy插件添加了一种机制，可以将合约部署到任何网络，跟踪它们并复制相同的环境进行测试
// hardhat-deploy会提供 deploy 任务
// 需另外创建一个deploy文件,而后将部署代码写在此文件夹上
// 运行 yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
// 将@nomiclabs/hardhat-ethers包的版本用npm:hardhat-deploy-ethers ethers替换下来,可到package.json查看
require("hardhat-deploy");

const GOERLI_TEST_RPC_URL = process.env.GOERLI_TEST_RPC_URL;
const MetaMask_TEST_PRIVATE_KEY = process.env.MetaMask_TEST_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // 因为从@chainlink/contracts中调用MockV3Aggregator.sol的版本与其他非测试合约不同,
  // 为了保证contracts/test内的合约能进行编译,此处为solidity添加上多个编译版本
  // solidity: "0.8.7", (弃用)
  solidity: {
    compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
  },

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_TEST_RPC_URL,
      accounts: [MetaMask_TEST_PRIVATE_KEY],
      chainId: 5,
      // 定义等待区块确认数
      blockConfirmations: 6,
    },
  },

  // 定义部署合约账户,供getnamedAccounts()调用
  namedAccounts: {
    deployer: {
      // 默认将第一个帐户作为部署者
      default: 0,
    },
    player: {
      // 默认将第二个帐户作为玩家
      default: 1,
    },
  },

  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
      // 如果得到提示错误: TypeError: customChains is not iterable ,就取消这行注释
      // customChains: [],
    },
  },

  /*
  // !!!要全局加增强 (暂时注释了先)
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  */
};
