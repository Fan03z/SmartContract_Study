// 编写部署脚本,使得在部署时从后端获得合约abi、合约地址等信息,并反馈到前端去
// 更新前端项目的constants文件夹

const { ethers, network } = require("hardhat");
const fs = require("fs");

// 定义前端更新文件地址
const FRONT_END_ADDRESSES_FILE =
  "../nextjs-lottery/constants/contractAddresses.json";
const FRONT_END_ABI_FILE = "../nextjs-lottery/constants/abi.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("更新前端数据中...");
    updateContractAddresses();
    updateAbi();
    console.log("更新完成");
  }
};

// 更新合约地址
async function updateContractAddresses() {
  const raffle = await ethers.getContract("Raffle");
  // 得到config文件中当前部署网的chainId
  const chainId = network.config.chainId.toString();
  // 从前端获得合约地址文件内容
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_FILE),
    "utf8"
  );
  // 查看该chainId信息是否存在于原文件中
  if (chainId in currentAddresses) {
    // 如果对于chainId部署后的合约地址存在的话,则添加到文件对应的chainId信息下
    if (!currentAddresses[chainId].includes(raffle.address)) {
      currentAddresses[chainId].push(raffle.address);
    }
  } else {
    // 若不存在chainId则将合约地址直接加入新数组
    currentAddresses[chainId] = [raffle.address];
  }

  // 将更新过后的合约地址信息写回前端文件
  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses));
}

// 更新合约Abi
async function updateAbi() {
  const raffle = await ethers.getContract("Raffle");
  // 直接从合约中得到abi,并写入
  fs.writeFileSync(
    FRONT_END_ABI_FILE,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  );
}

module.exports.tags = ["all", "frontend"];
