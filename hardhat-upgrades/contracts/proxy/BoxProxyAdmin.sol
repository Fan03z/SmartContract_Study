// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 导入ProxyAdmin合约
// 合约源码: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/proxy/transparent/ProxyAdmin.sol
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract BoxProxyAdmin is ProxyAdmin {
    constructor(address /* owner */) ProxyAdmin() {}
}
