import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🚀 Deploying UserIPFSStorage contract...");

  // Compile + get contract factory
  const Contract = await ethers.getContractFactory("UserIPFSStorage");

  // Deploy
  const contract = await Contract.deploy();

  // Wait for deployment
  await contract.waitForDeployment();

  // Get deployed address
  const address = await contract.getAddress();

  console.log(`✅ UserIPFSStorage deployed at: ${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
