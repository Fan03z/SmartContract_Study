const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async function (hre) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  // 定义协调器合约地址
  let vrfCoordinatorV2Address;
  // 如果在本地开发测试网上,则调用VRFCoordinatorV2Mock模拟合约
  if (developmentChains.includes(network.name)) {
    // 获得部署的VRFCoordinatorV2Mock合约
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    // 将协调器合约地址赋值为模拟后的合约地址
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
  }

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
};
