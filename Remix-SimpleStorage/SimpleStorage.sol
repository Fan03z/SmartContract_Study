// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
// 设置solidity版本
// 可以使用 ^0.8.7 表示使用0.8.7以上的版本
// 或者 >=0.8.7 <0.8.12 表示大于等于0.8.7 小于0.8.12版本

contract SimpleStorage {
    // bool,uint,int,address,bytes 数据类型,声明如下
    // bool hasFavoriteNumber = true;
    // uint256 favoriteNumber = 5;
    // string favoriteNumberInText = "five";
    // int256 favoriteInt = -5;
    // address myAddress = 0xcE4070579f41BE266c4c2CD5736521d8245dbEc7;
    // bytes32 favoriteBytes = "cat";

    // 不进行赋值的 uint256 数据类型会被自动赋初始值 0 ;
    uint256 public favoriteNumber;
    // 未声明public等关键字的将自动视为 internal
    People public person = People({
        favoriteNumber: 2,
        name: "piter"
    });

    // mapping -数据类型
    mapping(string => uint256) public nameToFavoriteNumber;

    // 结构体 一数据类型
    struct People {
        uint256 favoriteNumber;
        string name;
    }

    //  数组(Array) 一数据结构
    // 如果在[]内没有数字的话,意味着这是个动态数组;
    // 如果是[3],意味着该数组内元素被限定为3个
    uint256[3] public favoriteNumberList;
    // 此时数组被声明出来,但元素为空
    People[] public people;

    function store(uint256 _favoriteNumber) public  virtual{
        favoriteNumber = _favoriteNumber;
        // 但如果在涉及交易的函数内调用带 view 关键字函数，则也要消耗额外的gas
        retrieve();
    }

    // 带有 view 关键字意味着无法对合约内容做出更改,仅可查看内容,故不消耗额外的gas
    function retrieve() public view returns(uint256){
        return favoriteNumber;
    }

    // 带有 pure 关键字的纯函数也不关系交易,关系算法运算,不消耗gas
    function add() public pure returns(uint256){
        return(1 + 1);
    }

    // 定义函数:向People数组中添加元素
    function addPerson(string memory _name,uint256 _favoriteNumber) public {
        // 此处变量_favoriteNumber不用加上关键字memory是因为: solidity能识别出uint256类型在此处只是作为临时变量使用
        // 而string类型要加上memory是因为: string类型在solidity中背后是作为 Array类型 来进行处理的, *形参中数据array、struct、mapping等都要加上memory来声明处理方式*
        People memory newPerson = People({
            favoriteNumber: _favoriteNumber,
            name: _name
        });
        people.push(newPerson);
        // 下面一句与上面同理:
        // people.push(People(_favoriteNumber,_name);

        // 同时向mapping中添加元素
        nameToFavoriteNumber[_name] = _favoriteNumber;
    }
    // EVM会在六个区域使用和存储信息
    // 1.Stack
    // 2.Memory
    // 3.Storage
    // 4.Calldata
    // 5.Code
    // 6.Logs
    // calldata和memory在调用期间产生,但不会对其进行保留;
    // 而storage会将变量进行保留,而常规的未声明关键字的会自动视为storage类型
    // calldata是不能被修改的临时变量; memory是可以被修改的临时变量; storage是可以被修改的永久变量
    
}