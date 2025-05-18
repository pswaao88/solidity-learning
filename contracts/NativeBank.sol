// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract NativeBank {
    mapping(address => uint256) public balanceOf;

    function withdraw() external {
        uint256 balance = balanceOf[msg.sender];
        require(balance > 0, "insufficient balance");
        // call을 통해서 receive or fallback 함수 호출
        // 즉 은행에서 해당 메소드를 실행한 주체에게 토큰 전송
        // 은행에서 인출을 한다.
        // 이더리움 네트워크가 전체 잔고를 자동으로 업데이트
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "failed to send native token");

        balanceOf[msg.sender] = 0;
    }

    receive() external payable {
        balanceOf[msg.sender] += msg.value;
    }
}
