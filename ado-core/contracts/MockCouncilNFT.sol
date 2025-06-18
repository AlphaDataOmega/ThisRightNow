// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockCouncilNFT {
    mapping(uint256 => address) public owners;

    function mint(address to, uint256 tokenId) external {
        owners[tokenId] = to;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return owners[tokenId];
    }

    function balanceOf(address user) external view returns (uint256) {
        uint256 count;
        for (uint256 i = 0; i < 100; i++) {
            if (owners[i] == user) count++;
        }
        return count;
    }
}
