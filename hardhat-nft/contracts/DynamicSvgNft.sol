// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 将svg转换为base64编码的地址: https://www.base64encode.org/
// 要通过base64编码查看svg图像,输入网址:   data:image/svg+xml;base64,   + 对应base64编码

// 通过@openzeppelin/contracts包导入ERC721标准合约
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// 导入base64-sol包内的base64.sol
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    // 下方部分步骤与BasicNft.sol同
    uint256 private s_tokenCounter;
    // 定义图像URI
    string private i_lowImageURI;
    string private i_highImageURI;
    // 定义svg在base64编码下的URI头部
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";

    // 传入svg图像的base64编码的图像url或uri做参数
    constructor(
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic Svg Nft", "DSN") {
        s_tokenCounter = 0;
    }

    // 实现将svg代码转换为图像URI(包含了转换得到的base64编码)
    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        // 🤡 配合contracts/sublesson理解 abi.encode() 和 abi.encodePacked()
        string memory svgBase64Encodeed = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encodeed));
    }

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        return s_tokenCounter;
    }
}
