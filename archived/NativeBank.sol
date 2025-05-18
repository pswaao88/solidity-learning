// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract NativeBank {
    mapping(address => uint256) public balanceOf;
    bool lock;

    modifier noreetrancy() {
        require(!lock, "is now working on");
        lock = true;
        _;
        lock = false;
    }

    /* 기존 취약점: 반복해서 갱신이 늦어 반복하여 withdraw 가능
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
*/
    /* 방법1: 갱신을 call전에 하기
    function withdraw() external {
        uint256 balance = balanceOf[msg.sender];
        require(balance > 0, "insufficient balance");

        balanceOf[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "failed to send native token");
    }
    */
    /*
    // 방법 2: bool 변수 lock 사용
    function withdraw() external {
        // lock이 false인 경우에만 실행
        // lock이 false인경우는 첫번째 실행
        require(!lock, "is now working on");
        lock = true;
        uint256 balance = balanceOf[msg.sender];
        require(balance > 0, "insufficient balance");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "failed to send native token");

        balanceOf[msg.sender] = 0;
        lock = false;
    }
    */

    // 방법 3: 방법2의 로직을 modifier를 이용
    function withdraw() external noreetrancy {
        uint256 balance = balanceOf[msg.sender];
        require(balance > 0, "insufficient balance");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "failed to send native token");

        balanceOf[msg.sender] = 0;
    }

    receive() external payable {
        balanceOf[msg.sender] += msg.value;
    }
}
