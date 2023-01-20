const networkConfig = {
  5: {
    name: "goerli",
    // 协调器合约地址vrfCoordinatorV2查询参考: https://docs.chain.link/vrf/v2/subscription/supported-networks
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
  },
};

const developmetChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmetChains,
};
