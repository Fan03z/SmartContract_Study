// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 手动简单地构建一个符合ERC20标准的代币

// 定义外部接口interface,方便与其他合约进行对话,并向其他合约提供信息
// interfaces 和抽象合约比较类似,但是他们不能实现任何功能。通过定义好的 interface 我们可以在不清楚目标合约具体实现方式的情况下,调用目标的合约
// **注意:
// 1.接口中不能定义 state 变量(包括 constants)
// 2.不能继承其他合约或接口,但是可以被继承
// 3.不能有构造函数(constructor)
// 3.不能实例化一个 interface
// 4.不能实现接口中的方法
// 5.接口中的方法不能定义为私有或者内部方法,所有的方法必须定义为外部方法(external)
interface tokenRecipient {
    function receiveApproval(
        address _from,
        uint256 _value,
        address _token,
        bytes calldata _extraData
    ) external;
}

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

    // 监听公共事件,通知用户
    // _transfer方法成功执行时,必须触发Transfer事件
    event Transfer(address indexed from, address indexed to, uint value);

    // 定义事件Approval用来监听,提供提示通知返回给用户
    // approve方法成功执行时,必须触发Approval事件
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // 定义burn事件,在burn方法成功执行时,必须触发Burn事件
    event Burn(address indexed owner, uint256 value);

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

    // 实现代币转移功能,定位为内部函数,只允许在合约内调用
    function _transfer(address _from, address _to, uint256 _value) internal {
        // 确认代币接收地址不为无效地址0x0,从而防止代币转移到无效地址造成代币销毁
        // 代币销毁另有定义burn()
        require(_to != address(0x0));
        // 确认代币转移到接收地址后,接收地址的代币总额不会溢出
        require(balanceOf[_to] + _value >= balanceOf[_to]);
        // 保存总值以供测试assert断言判断
        uint256 previousBalances = balanceOf[_from] + balanceOf[_to];
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // 触发Transfer事件
        emit Transfer(_from, _to, _value);
        // assert断言判断,条件应该永远成立,一旦出错,即停止代币转移
        assert(previousBalances == balanceOf[_from] + balanceOf[_to]);
    }

    // 集成_transfer()的外部接口,供调用,实现向_to地址转移代币
    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
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
        _transfer(_from, _to, _value);
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

    // 为地址授权可转移代币数量,并通知
    function approveAndCall(
        address _spender,
        uint256 _value,
        bytes memory _extraData
    ) public returns (bool success) {
        tokenRecipient spender = tokenRecipient(_spender);
        // 调用approve()授权,并通过外部接口传出通知
        if (approve(_spender, _value)) {
            // _extraData为传到授权花费地址的其他数据
            spender.receiveApproval(
                msg.sender,
                _value,
                address(this),
                _extraData
            );
        }
        return true;
    }

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

    // 从其他地址对代币进行不可逆销毁
    function burnFrom(
        address _from,
        uint256 _value
    ) public returns (bool success) {
        // 确认销毁代币的账户上存在足够代币
        require(balanceOf[_from] >= _value);
        // 确认销毁代币数量小于或等于授权可使用的数量
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        allowance[_from][msg.sender] -= _value;
        // 更新总代币数量
        totalSupply -= _value;
        // 触发Burn事件
        emit Burn(_from, _value);
        return true;
    }
}
