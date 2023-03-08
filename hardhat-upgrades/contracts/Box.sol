// SPDX-License-Identifier: MIT

// 实现合约(Implementation Contract) / 逻辑合约(Logic Contract)

pragma solidity ^0.8.7;

contract Box {
    uint256 private value;

    // Emitted when the stored value changes
    event ValueChanged(uint256 newValue);

    // Stores a new value in the contract
    function store(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }

    // Reads the last stored value
    function retrieve() public view returns (uint256) {
        return value;
    }

    // Returns the version of the Box contract
    function version() public pure returns (uint256) {
        return 1;
    }
}
