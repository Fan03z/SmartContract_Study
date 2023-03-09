// @ts-ignore
import { ethers, network } from "hardhat";
import {
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  MIN_DELAY,
  developmentChains,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import { moveTime } from "../utils/move-time";

export async function queueAndExecute() {
  const args = [NEW_STORE_VALUE];
  const box = await ethers.getContract("Box");
  const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args);
  // 通过keccak256()计算提案的描述哈希值,用法:
  // function keccak256(abi.encodePacked(x));
  // 其中 keccak256是函数名称，abi.encodePacked(x) 表示要哈希的参数，通常用ABI-encoded（编码）的值作为唯一参数，并返回一个 32 bytes 的对应哈希。
  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)
  );

  const governor = await ethers.getContract("GovernorContract");

  console.log("Queueing...");

  // 通过GovernorContract合约的 queue 方法将提案加入到执行队列中
  const queueTx = await governor.queue(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await queueTx.wait(1);

  // 加速时间,跳过执行等待
  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
  }

  console.log("Executing...");

  // 通过GovernorContract合约的 execute 方法执行提案
  const executeTx = await governor.execute(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await executeTx.wait(1);

  // 检查提案更新是否已经执行
  console.log(`Box value: ${await box.retrieve()}`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
