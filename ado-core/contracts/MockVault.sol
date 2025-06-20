// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMerkleDistributor {
    function receiveFunds(uint256 amount) external;
}

interface ITRNUsageOracle {
    function reportEarning(address user, uint256 amount, bytes32 source) external;
}

contract MockVault {
    address public oracle;
    uint256 public balance;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function setBalance(uint256 amount) external {
        balance = amount;
    }

    function receiveRevenue(uint256 amount) external {
        balance += amount;
    }

    function claim() external {
        uint256 amount = balance;
        balance = 0;
        ITRNUsageOracle(oracle).reportEarning(msg.sender, amount, keccak256("vault-claim"));
    }

    function fundDistributor(address distributor, uint256 amount) external {
        require(balance >= amount, "insufficient balance");
        balance -= amount;
        IMerkleDistributor(distributor).receiveFunds(amount);
    }

    function getBalance() external view returns (uint256) {
        return balance;
    }
}
