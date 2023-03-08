const { ethers, upgrades } = require("hardhat");

async function main() {
  const gnosisSafe = "FILL_ME_IN";

  console.log("Transferring ownership of ProxyAdmin...");
  // 只有管理员才能更新升级合约
  // transferProxyAdminOwnership(address newOwner)转移ProxyAdmin的管理权
  await upgrades.admin.transferProxyAdminOwnership(gnosisSafe);
  console.log("Transferred ownership of ProxyAdmin to:", gnosisSafe);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
