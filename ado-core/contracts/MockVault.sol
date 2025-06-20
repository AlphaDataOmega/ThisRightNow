// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMerkleDistributor {
    function receiveFunds(uint256 amount) external;
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

    function fundDistributor(address distributor, uint256 amount) external {
        require(balance >= amount, "insufficient balance");
        balance -= amount;
        IMerkleDistributor(distributor).receiveFunds(amount);
    }

    function getBalance() external view returns (uint256) {
        return balance;
    }
}
