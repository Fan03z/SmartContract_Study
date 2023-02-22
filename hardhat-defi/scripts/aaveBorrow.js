// 导入getWeth()
const { getWeth, AMOUNT } = require("../scripts/getWeth");
const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  // AAVE平台的接待协议只支持 ERC20 协议的代币
  // 而 ETH 不是ERC20协议的代币,要先转化为 WETH 代币才能进入AAVE平台成为抵押资产
  // 在getWeth.js上实现
  await getWeth();
  const { deployer } = await getNamedAccounts();

  // 获得借贷池地址
  const lendingPool = await getLendingPool(deployer);
  console.log(`LendingPool address ${lendingPool.address}`);

  // 存储代币进借贷池:

  // etherscan mainnet WETH合约地址 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 (同getWeth.js)
  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  // 授权账户上一定数量weth代币花费
  // 批准lendingPool地址从我们账户地址中提取weth,即允许账户向借贷池转入代币
  await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);

  console.log("Depositing...");

  // 调用lendingPool借贷池合约中的deposit(),存储一定代币进借贷池
  // 在AAVE开发者文档 https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool 中查看deposit()具体用法如下:
  // function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
  // 注: 最后一个参数推荐码已经停用了,直接传入0即可
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);

  console.log("Deposited!");
}

// 实现得到借贷池方法
// AAVE市场合约查询网址: https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
// 借贷池地址提供合约的地址: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
async function getLendingPool(account) {
  // 通过ILendingPoolAddressesProvider.sol的abi和借贷池地址提供合约地址获得合约
  const lendingPoolAddressProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );
  // ILendingPoolAddressesProvider合约内置getLendingPool(),以供查询借贷池地址
  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
  // 同理,通过ILendingPool合约abi和合约地址及连接人得到合约
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

// 定义授权花费代币的方法
async function approveErc20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    erc20Address,
    account
  );
  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("Approved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
