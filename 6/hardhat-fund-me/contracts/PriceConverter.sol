// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 与直接在Remix上写不一样,此处要引入@chainlink/contracts
// 要先向 npm/yarn 添加 @chainlink/contracts
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // 此处包含汇率信息的对象已经作为参数导入getPrice(),故此处不在麻烦每次更换链时还得手动输入对应合约地址去查询
        /*
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            // (Goerli测试网中ETH兑美元汇率的合约地址)
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
        */
        // 直接从参数中解构得到汇率价格信息
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    // // 将包含汇率信息对象作为第二个参数传入,计算对应区块代币数量
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
