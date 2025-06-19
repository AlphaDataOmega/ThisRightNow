// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CountryRulesetManager {
    mapping(string => mapping(string => bool)) public policies;

    function setCountryPolicy(string calldata country, string[] calldata categories) external {
        for (uint256 i = 0; i < categories.length; i++) {
            policies[country][categories[i]] = true;
        }
    }

    function isCategoryBanned(string calldata countryCode, string calldata category) external view returns (bool) {
        return policies[countryCode][category];
    }
}
