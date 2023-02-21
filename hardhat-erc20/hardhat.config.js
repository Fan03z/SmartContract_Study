require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const GOERLI_TEST_RPC_URL =
  process.env.GOERLI_TEST_RPC_URL ||
  "https://eth-goerli.alchemyapi.io/v2/your-api-key";
const MetaMask_TEST_PRIVATE_KEY = process.env.MetaMask_TEST_PRIVATE_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const REPORT_GAS = process.env.REPORT_GAS || false;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.4.24",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    goerli: {
      url: GOERLI_TEST_RPC_URL,
      accounts: [MetaMask_TEST_PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  contractSizer: {
    runOnCompile: false,
    only: ["OurToken"],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
    },
  },
  mocha: {
    timeout: 200000,
  },
};
