// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TRNUsageOracle {
    mapping(address => uint256) private balances;

    event EarningReported(address indexed account, uint256 amount, bytes32 postHash);

    function reportEarning(address account, uint256 amount, bytes32 postHash) external {
        balances[account] += amount;
        emit EarningReported(account, amount, postHash);
    }

    function getAvailableTRN(address account) external view returns (uint256) {
        return balances[account];
    }
}
