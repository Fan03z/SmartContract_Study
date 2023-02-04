const { ethers } = require("hardhat");

const networkConfig = {
  5: {
    name: "goerli",
    // 定义Raffle合约构造函数所需参数
    // 协调器合约地址vrfCoordinatorV2 和 gas价格哈希链接gasLane(即KeyHash)查询参考: https://docs.chain.link/vrf/v2/subscription/supported-networks
    // VRF Coordinator 项
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    entranceFee: ethers.utils.parseEther("0.0001"),
    // 150 gwei Key Hash 项,一般的链会有不同的价格上限链接选择,但在goerli上暂时只有一种选择
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    // 订阅Id获取及查询: https://vrf.chain.link/
    // Link获得: https://docs.chain.link/resources/link-token-contracts/
    // upKeeper查询和添加地址: https://automation.chain.link/
    subscriptionId: "9356",
    callbackGasLimit: "500000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    // vrfCoordinatorV2 本地协调器合约地址通过模拟获得
    entranceFee: ethers.utils.parseEther("0.01"),
    // 本地测试网不会在意gas价格上限链接,但此处还是给一个同goerli网的作为参数传进去
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    // subscriptionId 本地的模拟订阅即可
    callbackGasLimit: "500000",
    interval: "30",
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
