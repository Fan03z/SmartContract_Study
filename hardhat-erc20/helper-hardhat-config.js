const networkConfig = {
  5: {
    name: "goerli",
    // 汇率价格查询: https://docs.chain.link/docs/reference-contracts
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  31337: {
    name: "localhost",
  },
};

// 定义初始代币发行量
const INITIAL_SUPPLY = "1000000000000000000000000";

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY,
};
