// 在后端的js文件中,由于node.js或者yarn,导入包时就使用: require()
// 但在前端的js中,不能使用require()导入包了,而是使用: import
// !!!注意: html上连接js时要将type改下,即加上 type="module" ,才能import导入模块
// 下载ethers库,并从中导入ethers
import { ethers } from "./ethers-5.6.esm.min.js";
// 导入合约abi
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fund");
const withdrawButton = document.getElementById("withdrawButton");
const balanceButton = document.getElementById("balanceButton");

connectButton.onclick = connect;
connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
withdrawButton.addEventListener("click", withdraw);
balanceButton.addEventListener("click", getBalance);

// 定义网站连接账户函数
async function connect() {
  // window.ethereum是MetaMask插件提供的一个对象接口
  // 判断是否有MetaMask钱包插件
  if (typeof window.ethereum !== undefined) {
    try {
      // 调出MetaMask钱包,等待确认与所在网站连接
      await window.ethereum.request({ method: "eth_requestAccounts" });
      // 完成连接后,按钮提示已连接
      connectButton.innerHTML = "已连接";
    } catch (error) {
      // 若出错,控制台打印报错信息
      console.error(error.message);
    }
  } else {
    // 若无MetaMask钱包插件,弹窗提示未下载
    alert("请先下载MetaMask插件");
  }
}

// 定义账户向合约转钱函数
async function fund() {
  // 从输入框获得注资金额
  const ethAmount = document.getElementById("ethAmount").value;

  console.log(`注资${ethAmount}ETH中...`);

  if (typeof window.ethereum !== undefined) {
    // 通过window.ethereum这个MetaMask的http端口,调用ethers.providers上的Web3Provider得到账户信息
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // 得到签名身份 (此时MetaMask上连接的账户将作为签名者)
    const signer = provider.getSigner();
    // 通过合约地址和合约abi定义合约对象,并将签名账户连接合约
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      // 调用合约内的fund函数,创建交易
      const transactionResponse = await contract.fund({
        // 注资与ethAmount等价的ETH
        value: ethers.utils.parseEther(ethAmount),
      });
      // 等待交易被打包进区块
      // 此处 await 要等待 listenForTransactionMine() 返回的promise解决后才会往下执行
      await listenForTransactionMine(transactionResponse, provider);

      console.log("完成!");
    } catch (error) {
      console.error(error.message);
    }
  } else {
    alert("请先连接");
  }
}

// 实现函数,从合约撤回资金
// 与fund()基本一致
async function withdraw() {
  if (typeof window.ethereum !== undefined) {
    console.log("资金撤回中...");

    // 获得钱包信息、转账签名者、合约
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.error(error.message);
    }
  } else {
    alert("请先连接");
  }
}

// 实现函数,查询当前合约账户余额
async function getBalance() {
  if (typeof window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // 通过getBalance( address )方法查询当前资金
    // 查询合约当前资金余额
    const balance = await provider.getBalance(contractAddress);
    // 由于getBalance()返回BigNumber对象类型,因此要ethers.utils.formatEther()转化类型
    console.log(`合约余额:${ethers.utils.formatEther(balance)}`);
  } else {
    alert("请先连接");
  }
}

// 实现函数,监听交易被打包进区块,完成交易
function listenForTransactionMine(transactionResponse, provider) {
  console.log(`正在打包,交易哈希:${transactionResponse.hash}...`);

  // 为了等待 provider.once() 执行完,再接着执行下面的,将其作为Promise返回
  // 否则会出现区块数未被确认,而在控制台中已经打印出"完成!"
  // 但此处 async + await 不能解决此问题
  return new Promise((resolve, reject) => {
    try {
      // ethers内提供了 provider.once() 方法,该方法满足监听事件条件后只会被调用一次
      // provider.once( eventName , listener)
      // 其中eventName为发生事件,例如此处: 函数被调用发起交易完成前得到的hash,意味着交易将要完成
      // 而listener则是监听函数,决定监听事件发生后要执行的
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(`交易完成,确认区块数:${transactionReceipt.confirmations}`);
        // provider.once()执行完,promise解决
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
