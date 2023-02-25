const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// 定义pinata对象数据
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

// 实现上传到pinata的IPFS节点上存储图像
async function storeImages(imagesFilePath) {
  // 获得图像文件的完整路径
  const fullImagesPath = path.resolve(imagesFilePath);
  // 读取图像目录下的所有文件
  const files = fs.readdirSync(fullImagesPath);

  // 整理图像文件
  let responses = [];

  console.log("上传到Pinata中...");

  for (fileIndex in files) {
    console.log(`正在处理${fileIndex}...`);

    // 创建文件可读流,方便图像数据流出
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    try {
      // 参考pinata docs: https://docs.pinata.cloud/pinata-api/pinning/pin-file-or-directory
      // pinata上提供pinFileToIPFS(),将文件数据流上传到pinata的IPFS节点上
      const response = await pinata.pinFileToIPFS(readableStreamForFile);
      // 传上去的图像记录进整理数组里
      responses.push(response);
    } catch (error) {
      console.error(error);
    }
  }
  return { responses, files };
}

// 实现上传令牌URI的元数据到pinata上存储
async function storeTokenUriMetadata(metadata) {
  try {
    // 参考pinata docs: https://docs.pinata.cloud/pinata-api/pinning/pin-json
    // pinata上提供pinJSONToIPFS(),将元数据上传到pinata的IPFS节点上
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { storeImages, storeTokenUriMetadata };
