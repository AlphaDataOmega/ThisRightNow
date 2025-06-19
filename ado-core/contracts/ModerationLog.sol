// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ModerationLog {
    enum ActionType { None, Burned, Flagged, Blocked, Unblocked, Escalated }

    struct ModerationEntry {
        ActionType action;
        string reason;
        address actor;
        uint256 timestamp;
    }

    mapping(bytes32 => ModerationEntry[]) public postLogs;

    event ModerationEvent(bytes32 indexed postHash, ActionType action, string reason, address actor);

    modifier validAction(ActionType action) {
        require(action != ActionType.None, "Invalid action");
        _;
    }

    function logAction(bytes32 postHash, ActionType action, string calldata reason) external validAction(action) {
        ModerationEntry memory entry = ModerationEntry({
            action: action,
            reason: reason,
            actor: msg.sender,
            timestamp: block.timestamp
        });

        postLogs[postHash].push(entry);

        emit ModerationEvent(postHash, action, reason, msg.sender);
    }

    function getLatestAction(bytes32 postHash) external view returns (ModerationEntry memory) {
        ModerationEntry[] storage logs = postLogs[postHash];
        require(logs.length > 0, "No logs for post");
        return logs[logs.length - 1];
    }

    function getAllActions(bytes32 postHash) external view returns (ModerationEntry[] memory) {
        return postLogs[postHash];
    }
}
