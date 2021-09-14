const hardhat = require("hardhat");

const ethers = hardhat.ethers;

const config = {};

async function main() {
  await hardhat.run("compile");

  const Token = await ethers.getContractFactory("DemonToken");
  const FtmStaking = await ethers.getContractFactory("FtmStaking");

  const [deployer] = await ethers.getSigners();

  const token = await Token.deploy();
  await token.deployed();

  const ftmStaking = await FtmStaking.deploy();
  await ftmStaking.deployed();

  console.log("Token deployed to:", token.address);
  console.log("FtmStaking deployed to:", ftmStaking.address);
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });