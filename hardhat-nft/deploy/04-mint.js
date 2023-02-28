const { network, ethers } = require("hardhat");

module.exports = async (hre) => {
  const { getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Basic NFT
  const basicNft = await ethers.getContract("BasicNft", deployer);
  const basicMintTx = await basicNft.mintNft();
  await basicMintTx.wait(1);
  console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`);

  // Dynamic Svg NFT
  const highValue = ethers.utils.parseEther("1000");
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
  const dynamicSvgMintTx = await dynamicSvgNft.mintNft(highValue);
  await dynamicSvgMintTx.wait(1);
  console.log(
    `Dynamic Svg NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`
  );

  // Random IPFS NFT
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await randomIpfsNft.getMintFee();
  const randomIpfsMintTx = await randomIpfsNft.requestNft({
    value: mintFee.toString(),
  });
  const randomIpfsMintTxReceipt = await randomIpfsMintTx.wait(1);
  // 涉及请求随机数,设置Promise监听请求返回
  await new Promise(async (resolve, reject) => {
    // 设置超时限制
    setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000);
    // 对NftMinted事件设置一次性监听
    randomIpfsNft.once("NftMinted", async () => {
      console.log(
        `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`
      );
      resolve();
    });
    if (chainId == 31337) {
      const requestId =
        randomIpfsMintTxReceipt.events[1].args.requestId.toString();
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.address
      );
    }
  });
};

module.exports.tags = ["all", "mint"];
