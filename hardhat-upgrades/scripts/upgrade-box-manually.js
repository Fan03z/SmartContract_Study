const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { network, deployments, deployer } = require("hardhat");
const { verify } = require("../helper-functions");

async function main() {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("----------------------------------------------------");

  const boxV2 = await deploy("BoxV2", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(boxV2.address, []);
  }

  // 手动更新合约(更换合约实现)
  // Not "the hardhat-deploy way"
  const boxProxyAdmin = await ethers.getContract("BoxProxyAdmin");
  // 获得代理合约
  const transparentProxy = await ethers.getContract("Box_Proxy");
  // 通过BoxProxyAdmin合约的upgrade()更新实现合约
  const upgradeTx = await boxProxyAdmin.upgrade(
    transparentProxy.address,
    boxV2.address
  );
  await upgradeTx.wait(1);
  // 获得代理合约的实现合约,接入代理合约地址,并调用version()方法
  const proxyBox = await ethers.getContractAt(
    "BoxV2",
    transparentProxy.address
  );
  const version = await proxyBox.version();
  console.log(version.toString());
  log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
