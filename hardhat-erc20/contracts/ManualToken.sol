// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 手动简单地构建一个符合ERC20标准的代币

contract ManualToken {
    // 定义代币基本信息
    string public name;
    string public symbol;
    // 设置计算到代币小数点后的位数,都定义为18位,别随便做修改
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // 记录地址对应代币
    mapping(address => uint256) public balanceOf;
    // 记录对应地址允许使用的代币数量
    mapping(address => mapping(address => uint256)) public allowance;

    // 定义事件Approval用来监听,提供提示通知返回给用户
    // approve方法成功执行时,必须触发Approval事件
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // 定义burn事件,在burn方法成功执行时,必须触发Burn事件
    event Burn(address indexed _owner, uint256 _value);

    constructor(
        uint256 initialSupply,
        string memory tokenName,
        string memory tokenSymbol
    ) {
        // 计算总代币数量
        totalSupply = initialSupply * 10 ** uint256(decimals);
        // 将所有代币赋予给此合约调起者
        balanceOf[msg.sender] = totalSupply;
        name = tokenName;
        symbol = tokenSymbol;
    }

    // 实现代币转移功能
    function transfer(address from, address to, uint256 amount) public {
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }

    // 定义代币转移方法,允许第三方介入帮助代币转移
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // 检查账户是否有足够可使用代币
        require(_value <= allowance[_from][msg.sender]);
        allowance[_from][msg.sender] -= _value;
        transfer(_from, _to, _value);
        return true;
    }

    // 授权 _spender 可以从我们账户最多转移代币的数量为 _value，可以多次转移，总量不能超过 _value
    // 这个函数可以再次被调用，以覆盖授权额度 _value
    // 可以有效阻止向量攻击
    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        // 触发Approval事件
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // function approveAndCall() {}

    // 定义burn方法,不可逆地销毁链上代币
    function burn(uint256 _value) public returns (bool success) {
        // 检查方法调用是否有足够销毁的代币
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        // 触发Burn事件
        emit Burn(msg.sender, _value);
        return true;
    }
}
