// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

contract MyToken {
    string public name; // 토큰이름 ex) 비트코인, 이더리움, 밈코인...
    string public symbol; // ex) 이더리움: eth...
    uint8 public decimals; // 소수점 자리수 1이면 0.1까지

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _mint(1 * 10 ** decimals, msg.sender);
    }

    // transaction
    // from, to, data, value, gas ...

    // 토큰 발행
    function _mint(uint256 amount, address owner) internal {
        totalSupply += amount;
        balanceOf[owner] += amount;
    }
}
