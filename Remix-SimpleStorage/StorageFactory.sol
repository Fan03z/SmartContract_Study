// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 可以在合约外再写上合约模版
// contract SimpleStorage {
//     uint256 public favoriteNumber;
//     function store(uint256 _favoriteNumber) public {
//         favoriteNumber = _favoriteNumber;
//     }
// }

// 但更常见的是直接从其他路径导入合约
import "./SimpleStorage.sol";

contract StorageFactory {
    SimpleStorage[] public simpleStorageArray;

    function createSimpleStorageContract() public {
        // 创建合约时要提供模版
        // 根据对应合约创建出一个对象
        SimpleStorage simpleStorage = new SimpleStorage();
        // 并将该对象加入simpleStorageArray数组
        simpleStorageArray.push(simpleStorage);
    }
    
    // 实现合约间的互动
    function sfStore(uint256 _simpleStorageIndex, uint256 _simpleStorageNumber) public {
        // Address
        // ABI  --可交互对象
        SimpleStorage simpleStorage = simpleStorageArray[_simpleStorageIndex];
        simpleStorage.store(_simpleStorageNumber);
    }
    function sfSet(uint256 _simpleStorageIndex) public view returns(uint256){
        SimpleStorage simpleStorage = simpleStorageArray[_simpleStorageIndex];
        return simpleStorage.retrieve();
    }

}