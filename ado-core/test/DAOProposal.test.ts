import { expect } from "chai";
import { ethers } from "hardhat";

describe("DAO Governance Proposal Flow", function () {
  let council: any;
  let master: any;
  let factory: any;
  let proposalId: any;
  let councilUsers: any[];

  beforeEach(async () => {
    [master, ...councilUsers] = await ethers.getSigners();

    const CouncilNFT = await ethers.getContractFactory("MockCouncilNFT");
    council = await CouncilNFT.deploy();

    for (let i = 0; i < 3; i++) {
      await council.mint(councilUsers[i].address, i);
    }

    const Factory = await ethers.getContractFactory("MockProposalFactory");
    factory = await Factory.deploy(council.target, master.address);
  });

  it("should allow proposal creation and voting", async () => {
    const tx = await factory.connect(councilUsers[0]).createProposal("Test proposal", "0x");
    const receipt = await tx.wait();
    proposalId = receipt.logs[0].args[0];

    await factory.connect(councilUsers[0]).vote(proposalId, true);
    await factory.connect(councilUsers[1]).vote(proposalId, true);

    const result = await factory.getProposalStatus(proposalId);
    expect(result).to.equal("PendingMasterApproval");
  });

  it("should allow MasterNFT to approve or veto", async () => {
    const tx = await factory.connect(councilUsers[0]).createProposal("Do something", "0x");
    const receipt = await tx.wait();
    const id = receipt.logs[0].args[0];

    await factory.connect(councilUsers[0]).vote(id, true);
    await factory.connect(councilUsers[1]).vote(id, true);

    await factory.connect(master).finalizeProposal(id, true);
    const result = await factory.getProposalStatus(id);
    expect(result).to.equal("Approved");
  });
});
