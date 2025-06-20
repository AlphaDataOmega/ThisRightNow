// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVault {
    function receiveRevenue(uint256 amount) external;
}

contract PostVaultSplitter {
    address public contributorVault;
    address public investorVault;
    address public countryVault;
    address public daoVault;

    constructor(
        address _contributorVault,
        address _investorVault,
        address _countryVault,
        address _daoVault
    ) {
        contributorVault = _contributorVault;
        investorVault = _investorVault;
        countryVault = _countryVault;
        daoVault = _daoVault;
    }

    function splitPostRevenue(uint256 postId, uint256 amount) external {
        IVault(contributorVault).receiveRevenue((amount * 50) / 100);
        IVault(investorVault).receiveRevenue((amount * 20) / 100);
        IVault(countryVault).receiveRevenue((amount * 10) / 100);
        IVault(daoVault).receiveRevenue((amount * 20) / 100);
    }
}
