// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MerkleProof.sol";

interface ITRNOracle {
    function reportEarning(address user, uint256 amount, bytes32 source) external;
}

contract MerkleDropDistributor {
    using MerkleProof for bytes32[];

    bytes32 public merkleRoot;
    address public oracle;
    address public vault;
    mapping(address => bool) public claimed;
    uint256 public balance;

    constructor(address _oracle, address _vault, bytes32 _root) {
        oracle = _oracle;
        vault = _vault;
        merkleRoot = _root;
    }

    function receiveFunds(uint256 amount) external {
        require(msg.sender == vault, "Not vault");
        balance += amount;
    }

    function claim(address account, uint256 amount, bytes32[] calldata proof) external {
        require(!claimed[account], "Already claimed");
        bytes32 leaf = keccak256(abi.encodePacked(account, amount));
        require(proof.verify(merkleRoot, leaf), "Invalid proof");
        claimed[account] = true;
        require(balance >= amount, "Insufficient balance");
        balance -= amount;
        ITRNOracle(oracle).reportEarning(account, amount, keccak256("merkle-claim"));
    }
}
