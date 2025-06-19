// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IModerationLog {
    enum ActionType { None, Burned, Flagged, Blocked, Unblocked, Escalated }
    function logAction(bytes32 postHash, ActionType action, string calldata reason) external;
}

contract BurnRegistry {
    IModerationLog public moderationLog;
    address public daoAddress;
    address public councilMod;
    mapping(bytes32 => bool) public isBurned;

    event PostBurned(bytes32 indexed postHash, string reason, address actor);

    modifier onlyDAO() {
        require(msg.sender == daoAddress, "Not DAO");
        _;
    }

    modifier onlyCouncilMod() {
        require(msg.sender == councilMod, "Not council mod");
        _;
    }

    constructor(address _moderationLog) {
        moderationLog = IModerationLog(_moderationLog);
        daoAddress = msg.sender;
    }

    function setDAO(address _dao) external onlyDAO {
        daoAddress = _dao;
    }

    function setCouncilMod(address _mod) external onlyDAO {
        councilMod = _mod;
    }

    function burnPost(bytes32 postHash, string calldata reason) external {
        require(!isBurned[postHash], "Already burned");
        require(msg.sender == daoAddress || msg.sender == councilMod, "Not authorized");

        isBurned[postHash] = true;

        moderationLog.logAction(postHash, IModerationLog.ActionType.Burned, reason);
        emit PostBurned(postHash, reason, msg.sender);
    }

    function isContentBurned(bytes32 postHash) external view returns (bool) {
        return isBurned[postHash];
    }
}
