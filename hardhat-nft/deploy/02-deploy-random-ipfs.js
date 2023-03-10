const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
// 导入storeImages()和storeTokenUriMetadata()
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/uploadToPinata");

// 图像本地路径
const imagesLocation = "./images/randomNft";

// 创建元数据模版,从而按照模版内容上传图像元数据到pinata上
const metadataTemlate = {
  name: "",
  description: "",
  // iamgeh值为图像对应的IpfsUrl地址
  image: "",
  // NFT的特征属性(可选的描述)
  attributes: {
    trait_type: "Dogie",
    value: 100,
  },
};

// 模拟的费用,注意费用要够,比如0.01ETH就不行
const VRF_MOCKS_MINTFEE_AMOUNT = ethers.utils.parseEther("1");

module.exports = async function (hre) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // 整理令牌
  // let tokenUris;
  // 得到tokenUris之后就可以直接定义了
  let tokenUris = [
    "ipfs://QmX3KstJD9MjLZLAkF3uNA68K1anxxBT2CbRTwkhPM2zce",
    "ipfs://QmR3Y9SquvAqQpJiQPfGmrqA4WWAxQt9BTeFc3Y45hXrtE",
    "ipfs://QmdYKgxDEsVYi99TfoMjTCywK6CJHYVoUtgd1HjmT2pdt4",
  ];
  // 获得NFT图像的IPFS哈希值
  // 存储方式:
  // 1.通过本地的IPFS节点,
  // 2.通过pinata,让至少另一个节点获得, (便宜,但只是存在于ipfs节点上)
  // 3.通过转为svg形式和nft.storage挂到链上存储 () (贵,但是可以存储到链上)
  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris();
  }

  // 部署VRFCoordinatorV2,基本同Lottery项目上的部署步骤
  let vrfCoordinatorV2Address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
    // 要为模拟提供费用,不然测试会出现报错:
    // VM Exception while processing transaction: reverted with custom error 'InsufficientBalance()'
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_MOCKS_MINTFEE_AMOUNT
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  log("----------------------");

  // 传入部署RandomIpfsNft.sol中的参数
  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId].gasLane,
    networkConfig[chainId].callbackGasLimit,
    tokenUris,
    networkConfig[chainId].mintFee,
  ];

  // 部署RandomIpfsNft.sol
  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("----------------------");

  // 在本地测试网上,为合约VRFCoordinatorV2Mock手动添加订阅消费者
  // 否则本地测试时可能在expect错误上过不去
  // 从而在Test5上出现错误: VM Exception while processing transaction: reverted with custom error 'InvalidConsumer()'
  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock");
    await vrfCoordinatorV2.addConsumer(subscriptionId, randomIpfsNft.address);
  }

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("确认中...");
    await verify(randomIpfsNft.address, args);
  }
};

// 处理令牌URI并返回获得处理后的令牌URI
async function handleTokenUris() {
  // 在得到tokenUris之后就可以注释掉了,直接在上面定义就好了
  // tokenUris = [];

  // 调用storeImages(),其中方法返回的responses里有每一个上传文件的哈希值,获得上传返回数据
  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  // 将返回数据编写进元数据,并上传
  for (let imageUploadResponsesIndex in imageUploadResponses) {
    // 编写元数据
    let tokenUrisMetadata = { ...metadataTemlate };
    tokenUrisMetadata.name = files[imageUploadResponsesIndex].replace(
      ".png",
      ""
    );
    tokenUrisMetadata.description = `An adorable ${tokenUrisMetadata.name} dog`;
    // 根据传回的文件哈希值写入imageUrl
    tokenUrisMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponsesIndex].IpfsHash}`;
    // 上传元数据,即上传元数据JSON形式到pinataIPFS上存储
    const metadataUploadResponse = await storeTokenUriMetadata(
      tokenUrisMetadata
    );
    // 令牌Uri写进tokenUris整理数组
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  // 打印记录
  console.log("令牌URIs上传完成,如下:");
  console.log(tokenUris);
  return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
