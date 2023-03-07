// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 导入IERC721标准合约接口
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// 导入@openzeppelin/contracts包中的ReentrancyGuard合约,通过互斥锁原理,抵御重入攻击
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// 定义NFT定出售价必须大于0
error NftMarketplace__PriceMustBeAboveZero();
// 定义NFT未被授权流动进市场提示错误
error NftMarketplace__NotApprovedForMarketplace();
// 定义NFT已经被挂出出售一次提示错误
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
// 定义当前操作账户不是当前操作NFT的拥有者提示错误
error NftMarketplace__NotOwner();
// 定义当前购买的NFT未被挂上市场而提示错误
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
// 定义当前购买NFT的费用不够提示错误
error NftMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
// 定义取款时账户没有钱提示错误
error NftMarketplace__NoProceeds();
// 定义取款失败提示错误
error NftMarketplace__TransferFailed();

contract NftMarketplace is ReentrancyGuard {
    // 定义Listing结构,记录卖家和出售价格
    struct Listing {
        uint256 price;
        address seller;
    }

    // 定义ItemListed事件,当出售列表更新时触发
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    // 定义ItemBought事件,当NFT被购买走时触发
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    // 定义ItemCanceled事件,当NFT取消挂上市场出售时触发
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    // 追踪当前卖家清单
    // NFT Contract address => NFT TokenId => Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    // 追踪已售钱款清单
    // Seller address => Amount earned
    mapping(address => uint256) private s_proceeds;

    // 定义notListed修饰词,确认NFT未被挂出售卖,确保NFT只能被挂出界面售卖一次
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        // 一旦发现NFT价格大于0,即说明已经挂上市场了
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    // 定义isOwner修饰词,判断当前操作的NFT是否属于当前用户
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        // 用当前NFT,实例化IERC721对象
        IERC721 nft = IERC721(nftAddress);
        // 通过IERC721标准合约中的ownerOf(),得到对应NFT令牌Id的所有者
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    // // 定义isListed修饰词,在购买前确认NFT已被挂上市场
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        // 一旦发现NFT价格小于等于0,即说明未挂上市场
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    // 实现listItem(),将NFT挂出来出售
    // 定义为外部函数,使此合约中其他函数不能调用此函数
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        // 用当前NFT,实例化IERC721对象
        IERC721 nft = IERC721(nftAddress);
        // 通过IERC721标准合约中的getApprove(),查看当前NFT是否被授权流动,否的话提示错误
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
        // 更新卖家记录映射
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        // 触发ItemListed()事件
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    // 实现buyItem(),购买NFT
    // ReentrancyGuard合约提供nonReentrant修饰词,为当前函数上互斥锁,防止重入攻击
    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable nonReentrant isListed(nftAddress, tokenId) {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(
                nftAddress,
                tokenId,
                listedItem.price
            );
        }
        // 更新已售钱款映射
        s_proceeds[listedItem.seller] += msg.value;
        // 更新卖家记录映射
        delete (s_listings[nftAddress][tokenId]);
        // 通过IERC721标准合约中的safeTransferFrom(),转移NFT财产
        IERC721(nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            tokenId
        );
        // 触发ItemBought()事件
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    // 实现cancelListing(),取消挂上市场出售
    function cancelListing(
        address nftAddress,
        uint256 tokenId
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        // 触发ItemCanceled()事件
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    // 实现updateListing(),更新NFT的出售信息(刷新价格等)
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        s_listings[nftAddress][tokenId].price = newPrice;
        // 触发ItemListed()事件
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    // 实现withdrawProceeds(),提取账户款
    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        // 当账户上没有钱时,提示错误
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        // 向账户打款
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    // getter()
    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
