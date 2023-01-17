// 此合约目的在 从user手上获得资金汇款、撤回资金、并以美元单位表示最低汇款金额;

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./PriceConverter.sol";

// 自定义错误
error NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    // constant关键字标记常量 (会节省gas)
    uint256 public constant MINIMUM_USD = 50 * 1e18;

    // 追踪funders,将其地址保存
    address[] public funders;
    // 连同金额一起保存
    mapping(address => uint256) public addressToAmountFunded;

    // immutable关键字标记不可变变量 (会节省gas)
    address public immutable i_owner;

    // 构造函数
    constructor(){
        i_owner = msg.sender;
    }

    // payable关键字使得函数调用时可以访问并修改 value ,进而访问钱包实现汇款
    function fund() public payable{
        // 设置汇款发送的最低金额
        require(msg.value.getConversionRate() >= MINIMUM_USD, "Didn't send enough.");
        // 此处masg.value会被作为函数getConversionRate()的第一个参数
        // 1e18 表示10的18次方,而 1e18 Wei = 1 Ether
        // 注意如果未满足require的前置条件,则function中先前的操作都将被撤销(revert),并发出后半句错误消息
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
        // 保存funder地址和金额
    }

    function withdraw() public onlyOwner{
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // 重置数组
        // 括号内数字表示重置后的数组内含元素个数
        funders = new address[](0);

        // 三种方法将钱转回去:
        // 首选 3.call
        // 参考https://solidity-by-example.org/sending-ether/

        // 1.transfer
        payable(msg.sender).transfer(address(this).balance);
        // msg.sender属于address; 而 payable(msg.sender) 属于 payable address;
        // this 指代当前合约
        // 注意: transfer操作最多消耗2300gas,超过就会报错并取消操作

        // 2.send
        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess,"Send failed");
        // 注意:send操作也是最多消耗2300gas,但超过不会报错和取消操作,只会返回一个bool反应超没超过

        // 3.call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
        // call不会有gas上限
        // 调用call会返回两个参数,第一个是bool表示是否调用成功,第二个是bytes数组的 ("") 中调用函数的返回数据returndata
    }

    // modifier修饰词
    // 可以将常用的共用的部分提出来,后续只需要在要调用的函数上加上modifier的名称即可
    // _; 表示函数上其他代码内容
    // 常用于一些执行判断
    modifier onlyOwner {
        // 限定撤回函数的发送人
        // require(msg.sender == i_owner, "Sender is not owner");
        if(msg.sender != i_owner){
            revert NotOwner();
        }
        // 相比于require,后者能省更多的gas,因为不需要储存并发出字符串
        _;
    }

    // 如果外部有人向合约转账,但并非通过合约内的fund函数,该如何查询?
    // 有两个特殊函数
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

}