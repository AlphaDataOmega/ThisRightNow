// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICouncilNFT {
    function balanceOf(address user) external view returns (uint256);
}

contract MockProposalFactory {
    address public council;
    address public master;
    uint256 public nextId;

    enum Status {Pending, PendingMasterApproval, Approved, Rejected}

    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        Status status;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public voted;

    constructor(address _council, address _master) {
        council = _council;
        master = _master;
    }

    function createProposal(string calldata desc, bytes calldata data) external returns (uint256) {
        require(ICouncilNFT(council).balanceOf(msg.sender) > 0, "Not council");

        proposals[nextId] = Proposal(desc, 0, 0, Status.Pending);
        emit ProposalCreated(nextId, msg.sender, desc);
        return nextId++;
    }

    function vote(uint256 id, bool support) external {
        require(ICouncilNFT(council).balanceOf(msg.sender) > 0, "Not council");
        require(!voted[id][msg.sender], "Already voted");

        voted[id][msg.sender] = true;
        if (support) {
            proposals[id].yesVotes++;
        } else {
            proposals[id].noVotes++;
        }

        if (proposals[id].yesVotes >= 2) {
            proposals[id].status = Status.PendingMasterApproval;
        }
    }

    function finalizeProposal(uint256 id, bool approve) external {
        require(msg.sender == master, "Only master");

        if (approve) {
            proposals[id].status = Status.Approved;
        } else {
            proposals[id].status = Status.Rejected;
        }
    }

    function getProposalStatus(uint256 id) external view returns (string memory) {
        Status s = proposals[id].status;
        if (s == Status.Pending) return "Pending";
        if (s == Status.PendingMasterApproval) return "PendingMasterApproval";
        if (s == Status.Approved) return "Approved";
        return "Rejected";
    }

    event ProposalCreated(uint256 indexed id, address indexed proposer, string description);
}
