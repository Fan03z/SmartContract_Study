// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./SimpleStorage.sol";

// 合约间继承语法
contract ExtraStorage is SimpleStorage{
    // 对父合约的函数进行更改覆盖:
    // 1.父合约的对应函数必须为虚函数,即在父合约对应函数上加上关键字 virtual ;
    // 2.子合约的对应函数也必须加上覆盖关键字 override ;
    function store(uint256 _favoriteNumber) public override {
        favoriteNumber = _favoriteNumber + 5;
    }
}