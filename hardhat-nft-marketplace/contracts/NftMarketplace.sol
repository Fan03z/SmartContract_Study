// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 导入IERC721标准合约接口
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// 定义NFT定出售价必须大于0
error NftMarketplace__PriceMustBeAboveZero();
// 定义NFT未被授权流动进市场提示错误
error NftMarketplace__NotApprovedForMarketplace();
// 定义NFT已经被挂出出售一次提示错误
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);

contract NftMarketplace {
    // 定义Listing结构,记录卖家和出售价格
    struct Listing {
        uint256 price;
        address seller;
    }

    // 定义ItemListed事件,当出售列表更新时触发
    event ItemListed(
        address indexed seller,
        address indexed nftAddressm,
        uint256 indexed tokenId,
        uint256 price
    );

    // NFT Contract address => NFT TokenId => Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    // 定义notListed修饰,确认NFT未被挂出售卖,确保NFT只能被挂出界面售卖一次
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    constructor() {}

    // 实现listItem(),将NFT挂出来出售
    // 定义为外部函数,使此合约中其他函数不能调用此函数
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        // 用当前NFT,实例化IERC721对象
        IERC721 nft = IERC721(nftAddress);
        // 通过IERC721标准合约中的getApprove(),查看当前NFT是否被授权流动,否的话提示错误
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
        // 更新卖家记录映射结构
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        // 触发ItemListed()事件
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }
}
