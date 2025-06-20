// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RetrnIndex {
    event RetrnLogged(address indexed retrnr, bytes32 indexed postHash);
    // Weight is multiplier * 100 to preserve decimals (e.g. 150 = 1.5x)
    event WeightedRetrn(address indexed retrnr, bytes32 indexed postHash, uint256 weight);

    address public owner;

    mapping(address => uint256) public trustScore;
    mapping(uint256 => uint256) public postWeight;
    uint256[] private posts;
    mapping(uint256 => bool) private seen;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setTrustScore(address user, uint256 score) external onlyOwner {
        trustScore[user] = score;
    }

    function retrn(uint256 postId) external {
        _logRetrn(msg.sender, bytes32(postId));
    }

    function logRetrn(address user, bytes32 postHash) external {
        _logRetrn(user, postHash);
    }

    function _logRetrn(address user, bytes32 postHash) internal {
        uint256 score = trustScore[user];
        uint256 multiplier = getMultiplier(score);
        emit WeightedRetrn(user, postHash, multiplier);
        emit RetrnLogged(user, postHash);
        uint256 id = uint256(postHash);
        postWeight[id] += multiplier;
        if (!seen[id]) {
            seen[id] = true;
            posts.push(id);
        }
    }

    function getPostCount() external view returns (uint256) {
        return posts.length;
    }

    function getPostAt(uint256 index) external view returns (uint256) {
        return posts[index];
    }

    function getMultiplier(uint256 score) internal pure returns (uint256) {
        if (score > 100) return 200;
        if (score > 80) return 150;
        if (score > 50) return 100;
        if (score > 20) return 75;
        return 25;
    }
}
