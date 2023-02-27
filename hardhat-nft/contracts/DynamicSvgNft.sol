// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 将svg转换为base64编码的地址: https://www.base64encode.org/
// 要通过base64编码查看svg图像,输入网址:   data:image/svg+xml;base64,   + 对应base64编码
// 要通过base64编码查看JSON文件,输入网址:   data:application/json;base64,   + 对应base64编码

// 通过@openzeppelin/contracts包导入ERC721标准合约
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// 导入base64-sol包内的base64.sol
import "base64-sol/base64.sol";
// 导入@chainlink/contracts包内的AggregatorV3Interface.sol,来查询汇率价格
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// 定义对应ID的令牌已存在提示错误
error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {
    // 下方部分步骤与BasicNft.sol同
    uint256 private s_tokenCounter;
    // 定义图像URI
    string private i_lowImageURI;
    string private i_highImageURI;
    // 定义svg在base64编码下的URI头部
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    // 定义AggregatorV3Interface对象
    AggregatorV3Interface internal immutable i_priceFeed;
    // 定义不同铸造者给出的NFT变化的价格
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    // 定义铸造NFT事件
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    // 传入svg图像的base64编码的图像url或uri做参数
    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic Svg Nft", "DSN") {
        s_tokenCounter = 0;
        // 将开心和皱眉两个svg图像转换为URI
        i_lowImageURI = svgToImageURI(lowSvg);
        i_highImageURI = svgToImageURI(highSvg);
        // 赋值
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
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

    function mintNft(int256 highValue) public {
        // 记录不同令牌Id设置的NFT转换的价格
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        // 触发CreatedNFT()事件
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    // 得到通过base64编码查看JSON文件的网址前缀
    // // 覆盖ERC721.sol上的_baseURI()
    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    // 得到令牌URI
    // 覆盖ERC721.sol上的tokenURI()
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        // ERC721提供_exists(),查询对应ID的令牌是否存在,已存在则提示错误
        if (!_exists(tokenId)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }

        // 定义导入图像URI:
        // 解构AggregatorV3Interface对象,获得最新汇率价格信息
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        // 通过当前汇率价格信息变化,控制NFT发生变化
        string memory imageURI = i_lowImageURI;
        // 当价格高于或等于铸造时设定价格时,NFT转换为开心,否则为皱眉
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageURI;
        }

        // 转换为字符串返回
        return
            string(
                // 加上base64编码JSON形式的网址前缀
                abi.encodePacked(
                    _baseURI(),
                    // 转换为字节类型,并进行base64编码
                    Base64.encode(
                        bytes(
                            // 连接并编码URI内容
                            // ERC721提供name(),查询令牌名称
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    // get()
    function getLowSVG() public view returns (string memory) {
        return i_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return i_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
