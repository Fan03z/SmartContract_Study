// 在本地对合约代码进行测试,确保其运行做了我们希望完成的事
// yarn hardhat test  (进行测试)
// yarn hardhat test --grep 名称中独有的字符串  (对名称含所给字符串的特定项进行测试)

const { ethers } = require("hardhat");
// 通过chai包导入 assert , expect
const { assert, expect } = require("chai");

// Mocha js测试库
// describe("名称",function)
describe("SimpleStoeage", function () {
  // 用let声明而不用const,是为了能在beforeEach()中对其赋值 和 在it()中能对其进行交互
  let SimpleStorage, SimpleStorageFactory;

  // beforeEach()表示在每个it()前都执行一遍,即每次测试前都要做什么
  beforeEach(async function () {
    // 在beforeEach()中部署合约,确保每一份it()测试都能在一份全新的合约中进行
    SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    SimpleStorage = await SimpleStorageFactory.deploy();
  });

  // 可以有多份it()测试
  // it("测试内容",async function(){})
  it("test1.favoriteNumber开始为0", async function () {
    const currentValue = await SimpleStorage.retrieve();
    const expectedValue = "0";

    // 引入关键字 assert , expect
    // 通过 chai包 引入这两关键字,chai包集成在hardhat包内了,无需另外安装
    // assert和expect内有很多方法可供调用

    // 下面二者等价
    // assert
    assert.equal(currentValue.toString(), expectedValue);
    // expect
    expect(currentValue.toString()).to.equal(expectedValue);
  });

  // it.only() 当前仅测试这些项,可以存在多个only项
  // 若only()和--grep指向不同,则哪个都不测了
  it.only("test2.调用store()后favoriteNumber更新", async function () {
    const expectedValue = "2";
    const transactionResponse = await SimpleStorage.store(expectedValue);
    await transactionResponse.wait(1);

    const currentValue = await SimpleStorage.retrieve();
    assert.equal(currentValue.toString(), expectedValue);
  });
});
