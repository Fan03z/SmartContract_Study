// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract FallbackExample {
    uint256 public result;

    // receive() 本身就意味着一种特殊的函数,因此不需要再加上function关键字
    // 当 以太币直接发送到合约 的时候就会调用receive()函数
    receive() external payable {
        result = 1;
    }

    // fallback() 与receive()类似,也意味着一种特殊的函数,不需要再加上function关键字
    // 而当 以太币直接发送到合约，但 receive() 不存在或 msg.data 不为空 的时候就会调用fallback()函数
    // 可以理解为一种退路
    fallback() external payable {
        result = 2;
    }
}

    // 官方解释: https://solidity-by-example.org/fallback/
    // Ether发送至合约:
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()