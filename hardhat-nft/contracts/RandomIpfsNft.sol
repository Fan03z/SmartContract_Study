// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 导入随机数消费者合约VRFConsumerBaseV2.sol和接口,并继承
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
// 通过@openzeppelin/contracts包导入ERC721拓展合约
// 其包含了ERC721标准合约的内容,并作出拓展,例如 _setTokenURI()
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// @openzeppelin/contracts包带有Ownable合约,里面定义了修饰符onlyOwner,即只有艺术家才能调用
import "@openzeppelin/contracts/access/Ownable.sol";

// 定义当随机数超出定出品种范围时抛出的错误
error RandomIpfsNft__RangeOutOfBounds();
// 定义铸造费用不够的错误
error RandomIpfsNft__NeedMoreETHSent();
// 定义退款失败提示错误
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // 当铸造NFT时,要触发ChainLink VRF call,并得到个随机数
    // 使用随机数,可以得到一个随机的NFT
    // 在此设置三个NFT,使用随机数可能获得其中不同的NFT,并设置三个NFT的概率不同:
    // Pug稀有、shiba一般、st常见
    // 用户花费一定价格铸造NFT
    // 铸造合约的拥有者,即艺术家,可以退款给用户

    // 定义DogNFT品种
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // ChainLink变量:
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    // 定义传入requestRandomWords()中的参数
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // NFT变量:
    // 令牌计数器
    uint256 public s_tokenCounter;
    // 最高概率
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    // 创建令牌URI对应的字符串集,供未来上传到IPFS
    string[] internal s_dogTokenUris;
    // 铸造费用
    uint256 internal i_mintFee;

    // VRF Helpers
    // 创建映射,使得发出随机数请求后随机数对应NFT给到的是用户,而不是ChainLink节点
    mapping(uint256 => address) public s_requestIdToSender;

    // 定义事件
    // NFT铸造请求事件
    event NftRequested(uint256 indexed requestId, address requester);
    // NFT铸造事件
    event NftMinted(Breed dogBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Randim IPFS NFT", "RIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenUris = dogTokenUris;
        i_mintFee = mintFee;
    }

    // 请求一个随机数来获得NFT
    function requestNft() public payable returns (uint256 requestId) {
        // 检查账户余额是否足够铸造
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NeedMoreETHSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        // 记录下用户对应的随机数
        s_requestIdToSender[requestId] = msg.sender;
        // 触发NftRequested事件
        emit NftRequested(requestId, msg.sender);
    }

    // 根据随机数铸造NFT
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        // 获得owner和令牌ID
        address dogOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;

        // 控制随机数落在0-99
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        // 更新令牌计数器
        s_tokenCounter++;
        _safeMint(dogOwner, newTokenId);
        // 根据Dog品种索引检索s_dogTokenUris[],从而设置对应的URI
        _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);
        // 触发NftMinted事件
        emit NftMinted(dogBreed, dogOwner);
    }

    // 定义退款方法,但只有艺术家账户,即部署合约者才能调用
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    // 根据随机数获得狗品种
    function getBreedFromModdedRng(
        uint256 moddedRng
    ) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint[3] memory chanceArray = getChanceArray();
        for (uint i = 0; i < chanceArray.length; i++) {
            if (
                moddedRng >= cumulativeSum &&
                moddedRng < cumulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    // 返回不同NFT获得的概率
    function getChanceArray() public pure returns (uint256[3] memory) {
        //Pug 10% , shiba 30%, st 60%
        return [10, 30, MAX_CHANCE_VALUE];
    }

    // get()
    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUris(
        uint256 index
    ) public view returns (string memory) {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
