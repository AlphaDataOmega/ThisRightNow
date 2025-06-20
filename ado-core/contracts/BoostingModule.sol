// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITRNOracle {
    function recordBoostRefund(address user, uint256 amount) external;
}

contract BoostingModule {
    struct Boost {
        address booster;
        uint256 amount;
        bool active;
    }

    mapping(bytes32 => Boost) private boosts;
    address public oracle;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function _startBoost(bytes32 postHash, uint256 amount, address booster) internal {
        Boost storage b = boosts[postHash];
        b.booster = booster;
        b.amount = amount;
        b.active = true;
    }

    function startBoost(bytes32 postHash, uint256 amount) external {
        _startBoost(postHash, amount, msg.sender);
    }

    function startBoost(uint256 postId, uint256 amount) external {
        bytes32 postHash = bytes32(postId);
        _startBoost(postHash, amount, msg.sender);
    }

    function endBoost(bytes32 postHash) external {
        Boost storage b = boosts[postHash];
        require(b.active, "not active");
        b.active = false;
    }

    function simulatePostBurn(uint256 postId) external {
        bytes32 postHash = bytes32(postId);
        Boost storage b = boosts[postHash];
        require(b.active, "not active");
        b.active = false;
        ITRNOracle(oracle).recordBoostRefund(b.booster, b.amount);
    }

    function getBoost(bytes32 postHash) external view returns (Boost memory) {
        return boosts[postHash];
    }
}
