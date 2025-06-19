// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IModerationLog {
    function log(bytes32 postHash, string calldata action, string calldata reason) external;
}

contract FlagEscalator {
    address public moderationLog;

    mapping(bytes32 => uint256) public burnCount;
    mapping(bytes32 => bool) public escalated;

    constructor(address _log) {
        moderationLog = _log;
    }

    function burnFlag(bytes32 postHash) external {
        burnCount[postHash] += 1;
    }

    function aiEscalate(bytes32 postHash) external {
        require(burnCount[postHash] >= 2, "Not enough burns");
        escalated[postHash] = true;
        IModerationLog(moderationLog).log(postHash, "Escalated", "");
    }

    function isEscalated(bytes32 postHash) external view returns (bool) {
        return escalated[postHash];
    }
}
