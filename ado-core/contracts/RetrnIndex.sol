// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RetrnIndex {
    event RetrnLogged(address indexed retrnr, bytes32 indexed postHash);
    // Weight is multiplier * 100 to preserve decimals (e.g. 150 = 1.5x)
    event WeightedRetrn(address indexed retrnr, bytes32 indexed postHash, uint256 weight);

    mapping(address => uint256) public trustScore;

    function logRetrn(address user, bytes32 postHash) external {
        uint256 score = trustScore[user];
        uint256 multiplier = getMultiplier(score);
        emit WeightedRetrn(user, postHash, multiplier);
        emit RetrnLogged(user, postHash);
    }

    function getMultiplier(uint256 score) internal pure returns (uint256) {
        if (score > 100) return 200;
        if (score > 80) return 150;
        if (score > 50) return 100;
        if (score > 20) return 75;
        return 25;
    }
}
