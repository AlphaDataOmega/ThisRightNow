// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IModerationLog {
    enum ActionType { None, Burned, Flagged, Blocked, Unblocked, Escalated }
    function logAction(bytes32 postHash, ActionType action, string calldata reason) external;
}

contract BurnRegistry {
    address public moderationLog;

    constructor(address _log) {
        moderationLog = _log;
    }

    function burnPost(bytes32 postHash, string calldata reason) external {
        IModerationLog(moderationLog).logAction(postHash, IModerationLog.ActionType.Burned, reason);
    }
}
