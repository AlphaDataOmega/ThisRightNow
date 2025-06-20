// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRetrnIndex {
    function postWeight(uint256 postId) external view returns (uint256);
    function getPostCount() external view returns (uint256);
    function getPostAt(uint256 index) external view returns (uint256);
}

interface ITRNOracle {
    function reportEarning(address user, uint256 amount, bytes32 source) external;
}

contract LottoModule {
    uint256 public constant REWARD = 1e18;

    IRetrnIndex public retrnIndex;
    ITRNOracle public oracle;
    address public owner;

    uint256[] private posts;
    mapping(uint256 => address) public poster;
    mapping(uint256 => bool) public paid;

    event RetrnLottoWinner(address indexed poster, uint256 postId, uint256 reward);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _index, address _oracle) {
        retrnIndex = IRetrnIndex(_index);
        oracle = ITRNOracle(_oracle);
        owner = msg.sender;
    }

    function setPoster(uint256 postId, address postAuthor) external onlyOwner {
        if (poster[postId] == address(0)) {
            posts.push(postId);
        }
        poster[postId] = postAuthor;
    }

    function triggerPayout() external {
        uint256 count = posts.length;
        if (count == 0) return;

        uint256 winningPost;
        uint256 highest;

        for (uint256 i = 0; i < count; i++) {
            uint256 id = posts[i];
            if (paid[id]) continue;
            uint256 weight = retrnIndex.postWeight(id);
            if (weight > highest) {
                highest = weight;
                winningPost = id;
            }
        }

        if (winningPost == 0) return;

        paid[winningPost] = true;
        address winPoster = poster[winningPost];
        oracle.reportEarning(winPoster, REWARD, keccak256("retrn-lotto"));
        emit RetrnLottoWinner(winPoster, winningPost, REWARD);
    }
}

