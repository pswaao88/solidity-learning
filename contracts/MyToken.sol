// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

contract MyToken {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed spender, uint256 amount);

    string public name; // 토큰이름 ex) 비트코인, 이더리움, 밈코인...
    string public symbol; // ex) 이더리움: eth...
    uint8 public decimals; // 소수점 자리수 1이면 0.1까지

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    // owner =>
    mapping(address => mapping(address => uint256)) allowance;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _amount
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _mint(_amount * 10 ** decimals, msg.sender);
    }

    // transaction
    // from, to, data, value, gas ...

    function approve(address spender, uint256 amount) external {
        allowance[msg.sender][spender] = amount;
        emit Approval(spender, amount);
    }

    function transferFrom(address from, address to, uint256 amount) external {
        address spender = msg.sender;
        require(allowance[from][spender] >= amount, "insufficient allowance");
        allowance[from][spender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function mint(uint256 amount, address owner) external {
        _mint(amount, owner);
    }

    // 토큰 발행
    function _mint(uint256 amount, address owner) internal {
        totalSupply += amount;
        balanceOf[owner] += amount;

        emit Transfer(address(0), owner, amount);
    }

    function transfer(uint256 amount, address to) external {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
    }
}
