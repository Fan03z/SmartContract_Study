const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

// 定义模拟订阅Id发送请求需要的link值,30ETH价值很足够了
const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");

module.exports = async function (hre) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // 定义 协调器合约地址 和 订阅Id
  let vrfCoordinatorV2Address, subscriptionId;

  // 判断如果在本地开发测试网上,则调用VRFCoordinatorV2Mock模拟合约
  if (developmentChains.includes(network.name)) {
    // 获得部署的VRFCoordinatorV2Mock合约
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    // 将协调器合约地址赋值为模拟后的合约地址
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    // 通过调用模拟合约中的createSubscription(),创建模拟的订阅
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    // 到模拟合约中查看源码可知,createSubscription()中存在触发事件,而事件触发后会带着返回两个参数,
    // 第一个参数是订阅Id,第二个参数是msg.sender,即订阅请求发起账户
    // 从触发事件中得到订阅Id
    subscriptionId = transactionReceipt.events[0].args.subId;
    // 模拟发送订阅请求时,需要传入订阅Id和link扣款,不需要真的提供和消耗link价值,只需要传入定义好的一定价值即可
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    // 否则直接用实际测试网的协调器合约地址
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  // 定义Raffle构造函数传入参数
  const entranceFee = networkConfig[chainId]["entranceFee"];
  const gasLane = networkConfig[chainId]["gasLane"];
  // subscriptionId 在上面已经定义好
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const interval = networkConfig[chainId]["interval"];
  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    interval,
  ];

  // 部署Raffle合约
  // args为包含Raffle合约构造函数所需传入的参数的数组
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("确认发布核实中...");
    await verify(raffle.address, args);
  }
  log("----------------------------");
};

module.exports.tags = ["all", "raffle"];
