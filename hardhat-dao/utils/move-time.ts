import { network } from "hardhat";

export async function moveTime(amount: number) {
  console.log("Moving blocks...");
  // 通过evm_increaseTime()来移动时间
  await network.provider.send("evm_increaseTime", [amount]);

  console.log(`Moved forward in time ${amount} seconds`);
}
