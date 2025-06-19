// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICountryRulesetManager {
    function isBlocked(string calldata country, string calldata category) external view returns (bool);
}

interface IModerationLog {
    enum ActionType { None, Burned, Flagged, Blocked, Unblocked, Escalated }
    function logAction(bytes32 postHash, ActionType action, string calldata reason) external;
}

contract GeoOracle {
    address public countryRules;
    address public moderationLog;

    mapping(bytes32 => mapping(string => bool)) public blocked;

    constructor(address _countryRules, address _log) {
        countryRules = _countryRules;
        moderationLog = _log;
    }

    function enforceGeoBlock(bytes32 postHash, string calldata country, string calldata category) external {
        blocked[postHash][country] = true;
        IModerationLog(moderationLog).logAction(postHash, IModerationLog.ActionType.Blocked, category);
    }

    function isVisible(bytes32 postHash, string calldata country) external view returns (bool) {
        return !blocked[postHash][country];
    }

    function overrideUnblock(bytes32 postHash, string calldata country) external {
        blocked[postHash][country] = false;
        IModerationLog(moderationLog).logAction(postHash, IModerationLog.ActionType.Unblocked, country);
    }
}
