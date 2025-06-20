// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TRNUsageOracle {
    struct Earning {
        uint256 postId;
        uint256 amount;
        string source;
        uint256 timestamp;
    }

    mapping(address => int256) private balances;
    mapping(address => int256) private debts;
    mapping(address => uint256) public boostRefunds;
    mapping(address => Earning[]) public earnings;

    event EarningReported(address indexed account, uint256 amount, bytes32 postHash);
    event UsageReported(address indexed account, uint256 amount, bytes32 reason);
    event BoostRefunded(address indexed user, uint256 amount);
    event EarningRecorded(address indexed user, uint256 postId, string source, uint256 amount);

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

    function recordBoostRefund(address user, uint256 amount) external {
        boostRefunds[user] += amount;
        balances[user] += int256(amount);
        emit BoostRefunded(user, amount);
    }

    function recordEarning(address user, uint256 postId, uint256 amount, string calldata source) external {
        earnings[user].push(Earning({
            postId: postId,
            amount: amount,
            source: source,
            timestamp: block.timestamp
        }));

        balances[user] += int256(amount);
        int256 debt = debts[user];
        if (debt > 0) {
            if (int256(amount) >= debt) {
                debts[user] = 0;
            } else {
                debts[user] = debt - int256(amount);
            }
        }

        emit EarningRecorded(user, postId, source, amount);
    }

    function getEarnings(address user) external view returns (Earning[] memory) {
        return earnings[user];
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
