// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IModerationLog {
    function log(bytes32 postHash, string calldata action, string calldata reason) external;
}

contract BurnRegistry {
    address public moderationLog;

    constructor(address _log) {
        moderationLog = _log;
    }

    function burnPost(bytes32 postHash, string calldata reason) external {
        IModerationLog(moderationLog).log(postHash, "Burned", reason);
    }
}
