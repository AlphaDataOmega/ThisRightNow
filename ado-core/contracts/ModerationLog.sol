// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ModerationLog {
    struct Entry {
        string action;
        string reason;
    }

    mapping(bytes32 => Entry) public logs;

    function log(bytes32 postHash, string calldata action, string calldata reason) external {
        logs[postHash] = Entry(action, reason);
    }

    function getPostModerationLog(bytes32 postHash) external view returns (Entry memory) {
        return logs[postHash];
    }
}
