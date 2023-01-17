// 一般人们新建tasks文件夹来放置自己创建的任务
// 而不放在config文件中,这样方便管理

// 从config文件中导入task功能
const { task } = require("hardhat/config");

// 定义task
// 参考hardhat文档 https://hardhat.org/hardhat-runner/docs/advanced/create-task#creating-a-task
/*
task("任务名称", "任务描述")
  // addParam()为任务传入任务参数,即setAction()内的taskArgs
  .addParam("account", "The account's address")
  // setAction()写入function,定义任务执行内容
  .setAction(async (taskArgs) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);

    console.log(ethers.utils.formatEther(balance), "ETH");
  });
  */

task("block-number", "打印当前区块高度").setAction(async (taskArgs, hre) => {
  // taskArgs为addParam()传入的参数,此处没有
  // hre为hardhat运行时环境内容的对象,可以访问hardhat包内的内容,包括调用ethers内的方法等
  const blockNumber = await hre.ethers.provider.getBlockNumber();
  console.log(`当前区块高度: ${blockNumber}`);
});
// !注意:定义完任务后还要将其添加进config文件中
// 添加完后可在 yarn hardhat 命令后看到任务指示
// 执行任务: yarn hardhat 任务名 --network 测试网
