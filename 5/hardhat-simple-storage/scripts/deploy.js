// hardhat内集成了ethers,在package.json文件可查
const { Contract } = require("ethers");
const { ethers, run, network } = require("hardhat");

async function main() {
  // 通过hardhat-ethers,可以读取到./contracts下的合约
  // 而Lesson5中由ethers的话,要通过传入合约的abi文件和二进制描述文件,获取ContractFactory
  // 对比Lesson5中的获取ContractFactory,此处更方便,效果更好
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");

  console.log("Deploying,wait...");

  // 默认部署在hardhat Network上时,hardhat会提供私钥和区块链url,而无需声明
  const simpleStorage = await SimpleStorageFactory.deploy();

  // console.log("合约地址:");
  // console.log(simpleStorage.address);

  /*
  // !!!因为受到国内DNS域名污染和国内防火墙GFW影响,verify要开全局和增强才能正常使用 (故此块暂时注释起来)
  // 验证是否为Goerli测试网,如果是就发布合约代码到etherscan平台,供别人查看和确认合约合理
  // 不同平台的verify功能的api不同,可以到其文档中查看,或者到hardhat文档中查看
  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    console.log("等待区块确认...");
    await simpleStorage.deployTransaction.wait(2);
    await verify(simpleStorage.address, []);
  }
  */

  const currentValue = await simpleStorage.retrieve();
  console.log(`${currentValue}`);

  const transactionResponse = await simpleStorage.store(7);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(updatedValue.toString());

  // yarn hardhat console --network 测试网
  // 可以进入测试网控制台,并进行代码编写和测试等
}

/*
// !!!因为受到国内DNS域名污染和国内防火墙GFW影响,verify要开全局和增强才能正常使用 (故此块暂时注释起来)
// 定义verify函数,用于确认发布合约代码
const verify = async (contractAddress, args) => {
  console.log("确认合约中...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("确认发布!");
    } else {
      console.log(e);
    }
  }
};
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
