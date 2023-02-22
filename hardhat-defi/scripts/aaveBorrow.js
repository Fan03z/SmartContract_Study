// 导入getWeth()
const { getWeth } = require("../scripts/getWeth");

async function main() {
  // AAVE平台的接待协议只支持 ERC20 协议的代币
  // 而 ETH 不是ERC20协议的代币,要先转化为 WETH 代币才能进入AAVE平台成为抵押资产
  // 在getWeth.js上实现
  await getWeth();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
