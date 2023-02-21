// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 利用openzeppelin插件,快速创建代币,要比手动创建方便
// 参考查询: https://docs.openzeppelin.com/contracts/4.x/
// 添加安装openzeppelin包: yarn add --dev @openzeppelin/contracts
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// 继承自ERC20.sol
contract OurToken is ERC20 {
    // 查询文档或源码,可知其构造函数所需传入参数
    constructor(uint256 initialSupply) ERC20("FanToken", "FT") {
        // 提供—mint方法,快速创建代币,需要传入创建用户和初始供应数量
        _mint(msg.sender, initialSupply);
    }
}
