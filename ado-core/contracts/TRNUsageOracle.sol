// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TRNUsageOracle {
    mapping(address => int256) private balances;
    mapping(address => int256) private debts;

    event EarningReported(address indexed account, uint256 amount, bytes32 postHash);
    event UsageReported(address indexed account, uint256 amount, bytes32 reason);

    function reportEarning(address account, uint256 amount, bytes32 postHash) external {
        balances[account] += int256(amount);
        int256 debt = debts[account];
        if (debt > 0) {
            if (int256(amount) >= debt) {
                debts[account] = 0;
            } else {
                debts[account] = debt - int256(amount);
            }
        }
        emit EarningReported(account, amount, postHash);
    }

    function reportUsage(address user, uint256 amount, bytes32 reason) external {
        balances[user] -= int256(amount);
        debts[user] += int256(amount);
        emit UsageReported(user, amount, reason);
    }

    function hasDebt(address user) external view returns (bool) {
        return debts[user] > 0;
    }

    function clearDebt(address user) external {
        debts[user] = 0;
    }

    function getAvailableTRN(address account) external view returns (int256) {
        return balances[account];
    }

    // Alias used in tests
    function earnedTRN(address account) external view returns (int256) {
        return balances[account];
    }
}
