// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ModerationLog {
    enum ActionType { None, Burned, Flagged, Blocked, Unblocked, Escalated }

    // Appeal logging enums
    enum AppealReason { GeoBlock, PostBurned, MisTag, AIFlag }
    enum AppealResolution { None, Approved, Denied, Escalated }

    struct ModerationEntry {
        ActionType action;
        string reason;
        address actor;
        uint256 timestamp;
    }

    struct Appeal {
        address submitter;
        bytes32 postHash;
        AppealReason reason;
        uint256 timestamp;
        address moderator;
        AppealResolution resolution;
    }

    mapping(bytes32 => ModerationEntry[]) public postLogs;

    Appeal[] public appeals;

    event ModerationEvent(bytes32 indexed postHash, ActionType action, string reason, address actor);
    event AppealSubmitted(uint256 indexed id, address indexed submitter, bytes32 indexed postHash, AppealReason reason);
    event AppealResolved(uint256 indexed id, address indexed moderator, AppealResolution resolution);

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

    // ----- Appeal Handling -----

    function submitAppeal(bytes32 postHash, AppealReason reason) external returns (uint256) {
        appeals.push(Appeal({
            submitter: msg.sender,
            postHash: postHash,
            reason: reason,
            timestamp: block.timestamp,
            moderator: address(0),
            resolution: AppealResolution.None
        }));

        uint256 id = appeals.length - 1;
        emit AppealSubmitted(id, msg.sender, postHash, reason);
        return id;
    }

    function resolveAppeal(uint256 id, AppealResolution resolution) external {
        require(id < appeals.length, "Invalid appeal ID");
        Appeal storage a = appeals[id];
        require(a.resolution == AppealResolution.None, "Already resolved");

        a.moderator = msg.sender;
        a.resolution = resolution;

        emit AppealResolved(id, msg.sender, resolution);
    }

    function getAppeal(uint256 id) external view returns (Appeal memory) {
        require(id < appeals.length, "Invalid appeal ID");
        return appeals[id];
    }

    function appealCount() external view returns (uint256) {
        return appeals.length;
    }
}
