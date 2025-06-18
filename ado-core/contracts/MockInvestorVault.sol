// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IInvestorNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface ITRNUsageOracle {
    function reportEarning(address user, uint256 amount, bytes32 source) external;
}

contract MockInvestorVault {
    address public investorNFT;
    address public oracle;

    mapping(uint256 => uint256) public pending;
    mapping(uint256 => bool) public claimed;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function setInvestorNFT(address _addr) external {
        investorNFT = _addr;
    }

    function depositRevenue(uint256 totalDAOEarnings) external {
        uint256 totalToInvestors = (totalDAOEarnings * 33) / 100;
        uint256 each = totalToInvestors / 100;

        for (uint256 i = 0; i < 100; i++) {
            pending[i] = each;
        }
    }

    function pendingClaim(uint256 tokenId) external view returns (uint256) {
        return pending[tokenId];
    }

    function claim(uint256 tokenId) external {
        require(!claimed[tokenId], "Already claimed");
        address owner = IInvestorNFT(investorNFT).ownerOf(tokenId);
        require(msg.sender == owner, "Not NFT owner");

        uint256 amount = pending[tokenId];
        claimed[tokenId] = true;

        ITRNUsageOracle(oracle).reportEarning(owner, amount, keccak256("investor-vault"));
    }
}
