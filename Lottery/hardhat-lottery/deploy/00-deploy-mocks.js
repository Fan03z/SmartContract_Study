const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

// 参考: https://docs.chain.link/vrf/v2/subscription/supported-networks
// 定义部署VRFCoordinatorV2Mock合约传入参数
// 基本费用 为 Premium ,即发起的每个请求消耗的gas价格,此处为0.25LINK
const BASE_FEE = ethers.utils.parseEther("0.25");
// gas价格链接 实际上为一个计算值基于链上的gas价格,用于让ChainLink发起随机数请求时支付可能的gas价格波动
const GAS_PRICE_LINK = 1e9;

module.exports = async function (hre) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChains.includes(network.name)) {
    log("检测为本地测试链,部署模拟中...");

    // 部署contracts/test内模拟协调器合约vrfCoordinator合约
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      // 到包中"@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol"路径下,可以查看模拟合约源码
      // 找到constructor构造函数,看其需要传入的参数,即为部署对象中 args 需要传入的内容
      // 此处需传入两参数,一为基本费用,二为gas价格链接,都为uint96
      args: args,
      log: true,
    });
    log("模拟部署完成!");
    log("----------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
