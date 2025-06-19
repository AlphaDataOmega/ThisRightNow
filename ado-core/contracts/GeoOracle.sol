// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IModerationLog {
    enum ActionType { None, Burned, Flagged, Blocked, Unblocked, Escalated }
    function logAction(bytes32 postHash, ActionType action, string calldata reason) external;
}

interface ICountryRulesetManager {
    function isCategoryBanned(string calldata countryCode, string calldata category) external view returns (bool);
}

contract GeoOracle {
    ICountryRulesetManager public ruleset;
    IModerationLog public moderationLog;
    address public dao;

    // postHash → countryCode → blocked
    mapping(bytes32 => mapping(string => bool)) public geoBlocked;

    event GeoBlockSet(bytes32 indexed postHash, string countryCode, string category);
    event GeoBlockCleared(bytes32 indexed postHash, string countryCode);

    modifier onlyDAO() {
        require(msg.sender == dao, "Not DAO");
        _;
    }

    constructor(address _ruleset, address _moderationLog) {
        ruleset = ICountryRulesetManager(_ruleset);
        moderationLog = IModerationLog(_moderationLog);
        dao = msg.sender;
    }

    function enforceGeoBlock(bytes32 postHash, string calldata countryCode, string calldata category) external {
        require(ruleset.isCategoryBanned(countryCode, category), "Category not banned in region");

        geoBlocked[postHash][countryCode] = true;

        moderationLog.logAction(postHash, IModerationLog.ActionType.Blocked, string(abi.encodePacked("Blocked in ", countryCode, " (", category, ")")));
        emit GeoBlockSet(postHash, countryCode, category);
    }

    function overrideUnblock(bytes32 postHash, string calldata countryCode) external onlyDAO {
        geoBlocked[postHash][countryCode] = false;

        moderationLog.logAction(postHash, IModerationLog.ActionType.Unblocked, string(abi.encodePacked("Unblocked by DAO in ", countryCode)));
        emit GeoBlockCleared(postHash, countryCode);
    }

    function isVisible(bytes32 postHash, string calldata countryCode) external view returns (bool) {
        return !geoBlocked[postHash][countryCode];
    }
}
