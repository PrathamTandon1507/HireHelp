const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HireHelpAudit", function () {
  let HireHelpAudit;
  let auditContract;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    HireHelpAudit = await ethers.getContractFactory("HireHelpAudit");
    [owner, addr1] = await ethers.getSigners();

    // Deploy the contract
    auditContract = await HireHelpAudit.deploy();
  });

  it("Should store the decision hash and emit an event", async function () {
    const appId = "app123";
    const decisionHash = "a3f5b7..."; // Dummy hash

    // Perform audit
    const tx = await auditContract.auditDecision(appId, decisionHash);
    const receipt = await tx.wait();

    // Assert the record in mapping
    const record = await auditContract.auditRecords(appId);
    expect(record.decisionHash).to.equal(decisionHash);
    expect(record.auditor).to.equal(owner.address);

    // Verify Event emission
    await expect(tx)
        .to.emit(auditContract, "DecisionAudited")
        .withArgs(appId, decisionHash, record.timestamp, owner.address);
  });

  it("Should fail if application is already audited", async function () {
    const appId = "app456";
    const decisionHash = "hash1";
    await auditContract.auditDecision(appId, decisionHash);

    const newDecisionHash = "hash2";
    await expect(
        auditContract.auditDecision(appId, newDecisionHash)
    ).to.be.revertedWith("Application decision already audited");
  });

  it("Should fail if parameters are empty", async function() {
    await expect(
        auditContract.auditDecision("", "hash1")
    ).to.be.revertedWith("Application ID cannot be empty");

    await expect(
        auditContract.auditDecision("app123", "")
    ).to.be.revertedWith("Decision Hash cannot be empty");
  });
});
