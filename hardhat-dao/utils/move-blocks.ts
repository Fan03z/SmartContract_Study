import { network } from "hardhat";

export async function moveBlocks(amount: number) {
  console.log("Moving blocks...");
  for (let index = 0; index < amount; index++) {
    // 通过evm_mine()来移动区块
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
  console.log(`Moved ${amount} blocks`);
}
