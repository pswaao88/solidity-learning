// staking
// deposit(MyToken) / withdraw(MyToken)

// MyToken : token balance management
// - the balance of TinyBank address
// TinyBank : deposit / withdraw vault
// -users token.management
// - user --> deposit --> TinyBank --> transfer(TinyBank --> user)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./ManageAccess.sol";

interface IMyToken {
    function transfer(uint256 amount, address to) external;

    function transferFrom(address from, address to, uint256 amount) external;

    function mint(uint256 amount, address owner) external;
}

contract TinyBank is ManageAccess {
    event Staked(address, uint256);
    event Withdraw(uint256, address to);

    IMyToken public stakingToken;

    mapping(address => uint256) public lastClaimedBlock;
    uint256 defaultRewardPerBlock = 1 * 10 ** 18;
    uint256 rewardPerBlock;

    mapping(address => uint256) public staked;
    uint256 public totalStaked;

    constructor(IMyToken _stackingToken) ManageAccess(msg.sender, msg.sender) {
        stakingToken = _stackingToken;
        rewardPerBlock = defaultRewardPerBlock;
    }

    modifier updateReward(address to) {
        if (staked[to] > 0) {
            uint256 blocks = block.number - lastClaimedBlock[to];
            uint256 reward = (blocks * rewardPerBlock * staked[to]) /
                totalStaked;
            stakingToken.mint(reward, to);
        }
        lastClaimedBlock[to] = block.number;
        _; // caller
    }

    function setRewardPerBlock(uint256 _amount) external onlyManager {
        rewardPerBlock = _amount;
    }

    function stake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount >= 0, "cannot stake 0 amount");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external updateReward(msg.sender) {
        require(staked[msg.sender] >= _amount, "insufficient stake token");
        stakingToken.transfer(_amount, msg.sender);
        staked[msg.sender] -= _amount;
        totalStaked -= _amount;
        emit Withdraw(_amount, msg.sender);
    }
}
