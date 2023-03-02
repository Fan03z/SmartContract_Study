const { run } = require("hardhat");

// !!!因为受到国内DNS域名污染和国内防火墙GFW影响,verify要开全局和增强才能正常使用 (故此块暂时注释起来)
// 定义verify函数,用于确认发布合约代码
// 传入第一个参数contractAddress为部署的合约地址,第二个参数为所部署合约的参数列表
const verify = async (contractAddress, args) => {
  console.log("确认合约中...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log("确认发布!");
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("确认发布!");
    } else {
      console.log(e);
    }
  }
};

// 模块导出verify()
module.exports = { verify };
