// 合约在本地部署时,用这个来模拟AggregatorV3Interface对象

// SPDX-License-Identifier: MIT
// 此处solidity版本注意对上import合约文件的版本
pragma solidity ^0.6.0;

// @chainlink/contracts内存在有本地模拟AggregatorV3Interface对象的test合约,直接从包内导入即可
// 这样等效于直接复制粘贴 @chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol 合约文件内容到这个合约
import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";
// 编译后查看artifacts文件夹即可确认是否编译以及编译后的细节
