// 导入getWeth()
const { getWeth, AMOUNT } = require("../scripts/getWeth");
const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  // AAVE的接待协议只支持 ERC20 协议的代币
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

  // 通过质押价值进行借贷:

  // 获得当前账户的借贷信息
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    deployer
  );

  // 获得DAI/ETH换算汇率
  const daiPrice = await getDaiPrice();
  // 计算出最大借贷价值,并将单位换算为稳定币DAI
  const amountDaiToBorrow =
    availableBorrowsETH * 0.95 * (1 / daiPrice.toNumber());

  console.log(`You can borrow ${amountDaiToBorrow} DAI`);

  // 换算为Wei单位
  const amountDaiToBorrowWei = ethers.utils.parseEther(
    amountDaiToBorrow.toString()
  );

  // mainnet上的DaiAddress合约地址: 0x6B175474E89094C44Da98b954EedeAC495271d0F
  const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer);

  // 打印验证当前信息
  await getBorrowUserData(lendingPool, deployer);

  // 还借贷款:
  await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer);

  // 打印验证当前信息
  await getBorrowUserData(lendingPool, deployer);
}

// 实现还借贷款功能
async function repay(amount, daiAddress, lendingPool, account) {
  // 授权借贷池从我们账户中取走借贷的代币
  await approveErc20(daiAddress, lendingPool.address, amount, account);
  // repay()具体用法看AAVE官方文档
  const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
  await repayTx.wait(1);

  console.log("Repaid!");
}

// 实现借贷功能
async function borrowDai(
  daiAddress,
  lendingPool,
  amountDaiToBorrowWei,
  account
) {
  // 调用lendingPool合约内的borrow()来借贷,具体用法可看官方文档
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountDaiToBorrowWei,
    1,
    0,
    account
  );
  await borrowTx.wait(1);
  console.log("You have borrowed!");
}

// 通过AggregatorV3Interface.sol价格计算,换算ETH为稳定币Dai计算价值
async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    // AggregatorV3Interface中对应的代币换算地址到chainlink文件上查看
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
    // 针对此合约不发起交易,可以不连接到部署账户
  );
  // AggregatorV3Interface合约中存在latestRoundData(),返回最新的数据 (可到合约源码查看具体返回数据)
  // 其中价格换算汇率对应的下标为1
  const price = (await daiEthPriceFeed.latestRoundData())[1];

  console.log(`The DAI/ETH price is ${price.toString()}`);

  return price;
}

// lendingPool合约内提供 getUserAccountData() ,可以查询到当前账户信息,包括抵押价值、可借贷价值等
async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);
  console.log(`价值 ${totalCollateralETH} ETH存储抵押`);
  console.log(`已借贷价值 ${totalDebtETH} ETH`);
  console.log(`可借贷价值 ${availableBorrowsETH} ETH`);
  return { availableBorrowsETH, totalDebtETH };
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
