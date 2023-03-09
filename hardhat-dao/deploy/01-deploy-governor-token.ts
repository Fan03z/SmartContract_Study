// 为ts导入类型
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
// 有时会有一些ts的错误，可以使用@ts-ignore来忽略
// @ts-ignore
import { ethers } from "hardhat";

const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying Governor Token...");

  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  log(`GovernanceToken at ${governanceToken.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(governanceToken.address, []);
  }

  log(`Delegating to ${deployer}`);

  await delegate(governanceToken.address, deployer);

  log("Delegated!");
};

// 委托投票方法
const delegate = async (
  // 治理代币令牌地址
  governanceTokenAddress: string,
  // 委托人账户地址
  delegatedAccount: string
) => {
  const governanceToken = await ethers.getContractAt(
    "GovernanceToken",
    governanceTokenAddress
  );
  // 调用GovernanceToken合约的delegate()
  const tx = await governanceToken.delegate(delegatedAccount);
  await tx.wait(1);

  console.log(
    `Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`
  );
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "governor"];
