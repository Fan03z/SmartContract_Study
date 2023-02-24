// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 通过@openzeppelin/contracts包导入ERC721标准合约
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721 {
    // 定义令牌计数器
    uint256 private s_tokenCounter;

    // 查看ERC721标准合约源码可知要传入 名称 和 标志 到构造函数
    constructor() ERC721("Dogie", "DOG") {
        // 初始化令牌计数器
        s_tokenCounter = 0;
    }

    // 铸造NFT
    function mintNFT() public returns (uint256) {
        // 调用ERC721.sol上的_safeMint()铸造NFT
        // 将铸造的令牌给予msg.sender,还要传入令牌ID
        _safeMint(msg.sender, s_tokenCounter);
        // 更新令牌计数器
        s_tokenCounter++;
        return s_tokenCounter;
    }

    // get()
    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
