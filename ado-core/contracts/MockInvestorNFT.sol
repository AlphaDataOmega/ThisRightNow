// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockInvestorNFT {
    mapping(uint256 => address) public owners;

    function mint(address to, uint256 tokenId) external {
        owners[tokenId] = to;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return owners[tokenId];
    }
}
