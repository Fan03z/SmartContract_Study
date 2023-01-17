// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 可以在hardhat项目的合约文件内导入console.log,就可以如js那样利用控制台打印进行调试
import "hardhat/console.sol";

import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    // 将library PriceConverter计算值作为uint256类型值导入
    using PriceConverter for uint256;

    // gas消耗里,最常的就是 存储变量(20000gas) 和 读取变量(800gas),这些都作用在 storage区
    // 为了计算gas,以便节约gas
    // 在 存储变量名 前加上 s_;
    // 在 不可变量(immutable)名 前加上 i_;
    //  常量(constant)名 用大写锁定表示;
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;

    // 新定义一个AggregatorV3Interface对象
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // 将所在测试网ETH兑货币的汇率API的合约地址作为参数传入构造函数
    // 如此来实现即使更换不同的测试网,也可以根据实际所在链来计算ETH与货币
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;

        // 与PriceConverte.sol中的 getPrice() 一样,得到包含对应货币转换相应区块代币的汇率信息的一个对象
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            // value为getConversionRate()对应的第一个参数
            // 而priceFeed汇率则对应第二个参数
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough."
        );
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public payable onlyOwner {
        // for循环每次循环都对s_funders[]进行读取,s_funders[]越长,gas消耗越大
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    // 对withdraw()进行优化,优化其gas消耗
    function cheaperWithdraw() public payable onlyOwner {
        // 对s_funders进行一次读取,一次性将其内容从 storage区 读取到 memory区
        address[] memory funders = s_funders;
        // 但可惜mapping数据类型不能存在于memory区
        // 后续循环对memory区内的数据进行读取和写入等操作,要比在storage区上操作便宜得多,更省gas
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    // 设置外部接口get函数,用于访问私有变量
    // 带 _ 下标的变量便开发时知晓,因此用getter函数包装,提供访问接口
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
