// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SubscriptionNFT {
    address public manager;
    mapping(address => bool) public burned;
    mapping(address => uint256) public expiry;

    function setManager(address _m) external {
        manager = _m;
    }

    function mint(address user, uint256 duration) external {
        require(msg.sender == manager, "Only manager");
        require(!burned[user], "Banned");

        expiry[user] = block.timestamp + duration;
    }

    function burn(address user) external {
        require(msg.sender == manager, "Only manager");
        delete expiry[user];
        burned[user] = true;
    }

    function hasActive(address user) external view returns (bool) {
        return expiry[user] > block.timestamp;
    }

    function balanceOf(address user) external view returns (uint256) {
        return expiry[user] > block.timestamp ? 1 : 0;
    }
}
