// 加密密钥 并保存在本地

const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  // 添加密钥到钱包
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

  // 通过ethers中Wallet的 encrypt() 加密函数对密钥进行加密
  // encrypt()接受两个参数,第一个是密钥,第二个是密钥加密密码
  const encryptJsonKey = await wallet.encrypt(
    process.env.PRIVATE_KEY,
    process.env.PRIVATE_KEY_PASSWORD
  );

  // 将加密后的密钥保存到指定文件中
  fs.writeFileSync("./encryptedKey.json", encryptJsonKey);

  // 加密完后的原密钥和加密密钥密码就可以从.env中删除了
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
  });
