// 提出提案
// @ts-ignore
import { ethers, network } from "hardhat";
// 导入参数
import {
  NEW_STORE_VALUE,
  FUNC,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  proposalsFile,
} from "../helper-hardhat-config";
import { developmentChains } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import * as fs from "fs";

export async function propose(
  args: any[],
  functionToCall: string,
  proposalDescription: string
) {
  const governor = await ethers.getContract("GovernorContract");
  const box = await ethers.getContract("Box");
  // 通过encodeFunctionData()来编码函数调用
  const encodeFunctionCall = box.interface.encodeFunctionData(
    functionToCall,
    args
  );

  console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`);
  console.log(`Proposal Description:\n  ${proposalDescription}`);

  // 提出提案
  const proposetx = await governor.propose(
    [box.address],
    [0],
    [encodeFunctionCall],
    proposalDescription
  );
  const propsoalReceipt = await proposetx.wait(1);

  // 如果是在开发链环境,则需要移动区块,以便加快开始投票
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }

  // 通过提案交易收据,获得提案ID
  const proposalId = (await propsoalReceipt).events[0].args.proposalId;

  console.log(`Proposed with proposal ID:\n  ${proposalId}`);

  const proposalState = await governor.state(proposalId);
  const proposalSnapShot = await governor.proposalSnapshot(proposalId);
  const proposalDeadline = await governor.proposalDeadline(proposalId);
  // 存储提案ID进proposals.JSON
  storeProposalId(proposalId);

  // 提案状态是枚举数据类型,在 IGovernor 合约中定义,如下:
  // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
  console.log(`Current Proposal State: ${proposalState}`);
  // 提案投票开始记录的区块号
  console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
  // 提案投票结束的区块号
  console.log(`Current Proposal Deadline: ${proposalDeadline}`);
}

// 实现存储提案ID,并写入proposals.JSON的函数
function storeProposalId(proposalId: any) {
  const chainId = network.config.chainId!.toString();
  let proposals: any;

  if (fs.existsSync(proposalsFile)) {
    proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  } else {
    proposals = {};
    proposals[chainId] = [];
  }
  proposals[chainId].push(proposalId.toString());
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8");
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
