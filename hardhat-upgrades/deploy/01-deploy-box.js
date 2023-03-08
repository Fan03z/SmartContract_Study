const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("-------------------------------");

  const box = await deploy("Box", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations,
    // 为代理合约添加信息
    proxy: {
      // 设置代理合约的实现插件OpenZeppelinTransparentProxy
      proxyContract: "OpenZeppelinTransparentProxy",
      // 设置代理的管理合同
      viaAdminContract: {
        name: "BoxProxyAdmin",
        artifact: "BoxProxyAdmin",
      },
    },
  });

  log("-------------------------------");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(box.address, []);
  }
};
