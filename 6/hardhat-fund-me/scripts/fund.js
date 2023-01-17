// 编写脚本,为FundMe合约打入资金
// 通过 yarn hardhat run scripts/fund.js 运行

const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);

  console.log("通过脚本资助合约中...");

  const transactionResponse = await fundMe.fund({
    // 为合约打入0.1ETH
    value: ethers.utils.parseEther("0.1"),
  });
  // 等待区块确认交易
  await transactionResponse.wait(1);

  console.log("资助成功!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
