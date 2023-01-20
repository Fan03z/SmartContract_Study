// 编写脚本,撤回打入的资金

const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);

  console.log("资助中...");

  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);

  console.log("已撤回");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process, exit(1);
  });
