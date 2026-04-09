const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const HireHelpAudit = await ethers.getContractFactory("HireHelpAudit");
  console.log("Deploying HireHelpAudit contract...");
  const contract = await HireHelpAudit.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`HireHelpAudit deployed successfully to: ${address}`);
  console.log("Save this address. You will need it to update your backend's .env or config.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
