// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
    // minDelay : 提案通过后距离执行的事件延迟间隔
    // proposers : 可以提出提案的账户地址列表
    // executors : 可以执行提案的账户地址列表
    // admin: 账户地址，可以修改提案者和执行者列表
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
