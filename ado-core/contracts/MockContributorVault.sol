// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IContributorNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface ITRNUsageOracle {
    function reportEarning(address user, uint256 amount, bytes32 source) external;
}

contract MockContributorVault {
    address public contributorNFT;
    address public oracle;
    address public beneficiary;

    struct Allocation {
        uint256 amount;
        uint256 assignedAt;
        bool claimed;
    }

    mapping(uint256 => Allocation) public allocations;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function setContributorNFT(address _addr) external {
        contributorNFT = _addr;
    }

    function setBeneficiary(address _addr) external {
        beneficiary = _addr;
    }

    function assign(uint256 tokenId, uint256 amount) external {
        allocations[tokenId] = Allocation(amount, block.timestamp, false);
    }

    function pendingClaim(uint256 tokenId) external view returns (uint256) {
        Allocation memory a = allocations[tokenId];
        if (a.claimed) return 0;
        return a.amount;
    }

    function claim(uint256 tokenId) external {
        Allocation storage a = allocations[tokenId];
        require(!a.claimed, "Already claimed");
        require(IContributorNFT(contributorNFT).ownerOf(tokenId) == msg.sender, "Not NFT owner");

        a.claimed = true;
        ITRNUsageOracle(oracle).reportEarning(msg.sender, a.amount, keccak256("contributor-vault"));
    }

    function reclaim(uint256 tokenId) external {
        Allocation storage a = allocations[tokenId];
        require(!a.claimed, "Already claimed");
        require(block.timestamp > a.assignedAt + 90 days, "Too early");

        a.claimed = true;
        ITRNUsageOracle(oracle).reportEarning(beneficiary, a.amount, keccak256("expired-contributor"));
    }
}
