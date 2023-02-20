// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 手动简单地构建一个符合ERC20标准的代币

contract ManualToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
}
