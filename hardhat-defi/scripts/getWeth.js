const { getNamedAccounts, ethers } = require("hardhat");

const AMOUNT = ethers.utils.parseEther("0.02");

async function getWeth() {
  const { deployer } = await getNamedAccounts();

  // Georli测试网Wrapped Ether (WETH)合约查询: https://goerli.etherscan.io/token/0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6#writeContract
  // 调用etherscan上Wrapped Ether (WETH)合约中的deposit()实现ETH到WETH的转换

  // 在contracts/interface文件夹内合约实现外部接口,提供信息与外部合约对话,从而实现调用外部合约方法
  // 要调用其他合约的方法要满足两个条件: abi 、 合约地址
  // 1.编译接口合约得到调用合约方法的abi
  // 2.etherscan mainnet WETH上查询合约地址为 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
  //   mainnet测试网Wrapped Ether (WETH)合约查询:https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

  // 得到WETH接口合约,并连接上deployer账户
  const iWeth = await ethers.getContractAt(
    "IWeth",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    deployer
  );
  // 调用deposit(),实现ETH到WETH转换
  const tx = await iWeth.deposit({ value: AMOUNT });
  await tx.wait(1);

  // 更新deployer账户的WETH余额,并打印
  const wethBalance = await iWeth.balanceOf(deployer);
  console.log(`Got ${wethBalance.toString()} WETH`);
}

module.exports = { getWeth, AMOUNT };
