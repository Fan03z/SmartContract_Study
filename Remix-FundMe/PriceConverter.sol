// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// 要使用价格数据,应引用 AggregatorV3Interface,它定义了 Data Feeds 实现的外部功能
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    
    function getPrice() internal view returns(uint256) {
        // ABI
        // Address 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e (Goerli测试网中ETH兑美元汇率的合约地址)
        // 创建AggregatorV3Interface对象
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        // AggregatorV3Interface对象具体代码看:
        // https://github.com/smartcontractkit/chainlink/blob/master/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol
        (,int price,,,) = priceFeed.latestRoundData();
        // AggregatorV3Interface.latestRoundData()会返回许多变量,用,隔开无用的即可
        // 返回的价格数字会忽略小数点,通常为8位小数,也可调用AggregatorV3Interface.decimals()来查看小数点个数;
        return uint256(price * 1e10); //进行类型转换，且 18 - 8 = 10
    }

    function getVersion() internal view returns(uint256) {
        AggregatorV3Interface priceFeed =AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        return priceFeed.version();
    }

    function getConversionRate(uint256 ethAmount) internal view returns(uint256) {
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}