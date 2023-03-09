import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  networkConfig,
  developmentChains,
  ADDRESS_ZERO,
} from "../helper-hardhat-config";
// @ts-ignore
import { ethers } from "hardhat";

const setupContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  const governanceToken = await ethers.getContract("GovernanceToken", deployer);
  const timeLock = await ethers.getContract("TimeLock", deployer);
  const governor = await ethers.getContract("GovernorContract", deployer);

  log("----------------------------------------------------");
  log("Setting up contracts for roles...");

  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

  // 授予GovernorContract合约提出提案的角色
  const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
  await proposerTx.wait(1);
  // 授予所有地址执行提案的角色
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
  await executorTx.wait(1);
  // 撤销部署者的管理员角色,这样谁都无法控制TimeLock合约,保证了去中心化
  const revokeTx = await timeLock.revokeRole(adminRole, deployer);
  await revokeTx.wait(1);
};

export default setupContracts;
setupContracts.tags = ["all", "setup"];
