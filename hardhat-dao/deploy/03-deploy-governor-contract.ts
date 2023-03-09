import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  networkConfig,
  developmentChains,
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
} from "../helper-hardhat-config";
// @ts-ignore
import { ethers } from "hardhat";

const deployGovernorContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  // 导入get()
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  // 通过get()获取已部署的合约
  const governanceToken = await get("GovernanceToken");
  const timeLock = await get("TimeLock");
  const args = [
    governanceToken.address,
    timeLock.address,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
  ];

  log("----------------------------------------------------");
  log("Deploying GovernorContract and waiting for confirmations...");

  const governorContract = await deploy("GovernorContract", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  log(`GovernorContract at ${governorContract.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(governorContract.address, args);
  }
};

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governor"];
