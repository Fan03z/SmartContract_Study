import * as fs from "fs";
import {
  proposalsFile,
  VOTING_PERIOD,
  developmentChains,
} from "../helper-hardhat-config";
// @ts-ignore
import { network, ethers } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";

async function main() {
  // 从proposals.json中获得提案ID
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  const proposalId = proposals[network.config.chainId!].at(-1);
  // 选择支持票
  const voteWay = 1;
  const reason = "xinzong na sa sa gi";
  await vote(proposalId, voteWay, reason);
}

// 实现投票逻辑
// 此轮中 0 = 反对(Against), 1 = 支持(For), 2 = 弃权(Abstain)
export async function vote(
  proposalId: string,
  voteWay: number,
  reason: string
) {
  console.log("Voting...");

  const governor = await ethers.getContract("GovernorContract");
  // 可以通过GovernorContract合约的 castVoteWithReason / castVote 方法投票
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
  const voteTxReceipt = await voteTx.wait(1);

  console.log(voteTxReceipt.events[0].args.reason);

  const proposalState = await governor.state(proposalId);

  console.log(`Current Proposal State: ${proposalState}`);

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
