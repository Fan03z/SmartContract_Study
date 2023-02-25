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

module.exports = async function (hre) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // 整理令牌
  let tokenUris;
  // 获得NFT图像的IPFS哈希值
  // 存储方式:
  // 1.通过本地的IPFS节点,
  // 2.通过pinata,让至少另一个节点获得,
  // 3.通过nft.storage挂到filcoin的链上存储
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
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  log("----------------------");

  // 传入部署RandomIpfsNft.sol中的参数
  // const args = [
  //   vrfCoordinatorV2Address,
  //   subscriptionId,
  //   networkConfig[chainId].gasLane,
  //   networkConfig[chainId].callbackGasLimit,
  //   // tokenUris
  //   networkConfig[chainId].mintFee,
  // ];
};

// 处理令牌URI并返回获得处理后的令牌URI
async function handleTokenUris() {
  tokenUris = [];
  // 调用storeImages(),其中方法返回的responses里有每一个上传文件的哈希值,获得上传返回数据
  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  // 将返回数据编写进元数据,并上传
  for (imageUploadResponsesIndex in imageUploadResponses) {
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
