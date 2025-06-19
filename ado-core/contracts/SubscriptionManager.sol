// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IOracle {
    function reportUsage(address user, uint256 amount, bytes32 reason) external;
    function hasDebt(address user) external view returns (bool);
    function clearDebt(address user) external;
}

interface ISubNFT {
    function mint(address user, uint256 duration) external;
    function burn(address user) external;
    function burned(address user) external view returns (bool);
    function hasActive(address user) external view returns (bool);
}

contract SubscriptionManager {
    address public oracle;
    address public nft;
    uint256 public price = 1000;

    mapping(address => uint256) public lastPayment;

    constructor(address _nft, address _oracle) {
        nft = _nft;
        oracle = _oracle;
    }

    function setMintPrice(uint256 _p) external {
        price = _p;
    }

    function subscribe() external {
        require(!ISubNFT(nft).burned(msg.sender), "Subscription revoked");

        IOracle(oracle).reportUsage(msg.sender, price, keccak256("subscription-mint"));
        ISubNFT(nft).mint(msg.sender, 30 days);
        lastPayment[msg.sender] = block.timestamp;
    }

    function renew() external {
        require(!IOracle(oracle).hasDebt(msg.sender), "Debt unpaid");

        IOracle(oracle).reportUsage(msg.sender, price, keccak256("subscription-renew"));
        ISubNFT(nft).mint(msg.sender, 30 days);
        lastPayment[msg.sender] = block.timestamp;
    }

    function cancel() external {
        ISubNFT(nft).burn(msg.sender);
    }

    function hasActiveSubscription(address user) external view returns (bool) {
        return ISubNFT(nft).hasActive(user);
    }
}
