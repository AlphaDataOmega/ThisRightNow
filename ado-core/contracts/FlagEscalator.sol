// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IModerationLog {
    enum ActionType { None, Burned, Flagged, Blocked, Unblocked, Escalated }
    function logAction(bytes32 postHash, ActionType action, string calldata reason) external;
}

contract FlagEscalator {
    IModerationLog public moderationLog;

    uint256 public constant THRESHOLD = 3;

    mapping(bytes32 => uint256) public burnCounts;
    mapping(bytes32 => bool) public escalated;
    mapping(bytes32 => mapping(address => bool)) public hasFlagged;

    address public aiAgent;
    address public owner;

    event PostFlagged(bytes32 indexed postHash, address indexed user);
    event Escalated(bytes32 indexed postHash, string method);

    modifier onlyAI() {
        require(msg.sender == aiAgent, "Not authorized AI");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _moderationLog) {
        moderationLog = IModerationLog(_moderationLog);
        owner = msg.sender;
    }

    function setAI(address _aiAgent) external onlyOwner {
        aiAgent = _aiAgent;
    }

    function burnFlag(bytes32 postHash) external {
        require(!hasFlagged[postHash][msg.sender], "Already flagged");
        require(!escalated[postHash], "Already escalated");

        hasFlagged[postHash][msg.sender] = true;
        burnCounts[postHash] += 1;

        moderationLog.logAction(postHash, IModerationLog.ActionType.Flagged, "User burn flag");
        emit PostFlagged(postHash, msg.sender);

        if (burnCounts[postHash] >= THRESHOLD) {
            escalated[postHash] = true;
            moderationLog.logAction(postHash, IModerationLog.ActionType.Escalated, "Auto-threshold");
            emit Escalated(postHash, "Threshold");
        }
    }

    function aiEscalate(bytes32 postHash) external onlyAI {
        require(!escalated[postHash], "Already escalated");

        escalated[postHash] = true;
        moderationLog.logAction(postHash, IModerationLog.ActionType.Escalated, "AI escalation");
        emit Escalated(postHash, "AI");
    }

    function isEscalated(bytes32 postHash) external view returns (bool) {
        return escalated[postHash];
    }

    function getBurnCount(bytes32 postHash) external view returns (uint256) {
        return burnCounts[postHash];
    }
}
