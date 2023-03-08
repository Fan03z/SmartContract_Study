const { ethers, upgrades } = require("hardhat");

async function main() {
  const Box = await ethers.getContractFactory("Box");
  // getContractFactory() 和 getContract() 和 getContractAt() 区别: (答案来自chatGPT)
  /* 
   getContractFactory()：用于创建合约对象，它需要一个合约 ABI（Application Binary Interface，即智能合约的接口定义）和合约 bytecode（编译后的字节码）。该函数会返回一个合约对象工厂，可以使用该工厂创建多个对同一智能合约地址的合约对象实例。
   getContract()：该函数用于创建新的合约实例对象。使用该函数需要提供与 getContractFactory() 相同的参数：ABI 和 bytecode。该函数还需要指定要操作的智能合约地址，以及 web3 对象实例。
   getContractAt()：该函数用于获取与现有智能合约的交互对象。使用该函数需要提供两个参数：智能合约的 ABI 和智能合约地址。与 getContract() 不同，getContractAt() 并不需要提供 bytecode 或者 web3 对象实例。
   综上所述， getContractFactory() 和 getContract() 可以创建具有相同 ABI 的不同智能合约的不同实例，而 getContractAt() 则只能处理已经存在的智能合约。
   */
  console.log("Deploying Box, ProxyAdmin, and then Proxy...");
  const proxy = await upgrades.deployProxy(Box, [42], { initializer: "store" });
  console.log("Proxy of Box deployed to:", proxy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
