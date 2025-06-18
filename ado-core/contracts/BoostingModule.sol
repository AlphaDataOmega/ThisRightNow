// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BoostingModule {
    struct Boost {
        address booster;
        uint256 amount;
        bool active;
    }

    mapping(bytes32 => Boost) private boosts;

    function startBoost(bytes32 postHash, uint256 amount) external {
        Boost storage b = boosts[postHash];
        b.booster = msg.sender;
        b.amount = amount;
        b.active = true;
    }

    function endBoost(bytes32 postHash) external {
        Boost storage b = boosts[postHash];
        require(b.active, "not active");
        b.active = false;
    }

    function getBoost(bytes32 postHash) external view returns (Boost memory) {
        return boosts[postHash];
    }
}
