const { ethers, run, network } = require("hardhat");
require("dotenv").config();

async function main() {
  const accounts = await ethers.getSigners();
  const MAIN_CONTRACT_ADDRESS = process.env.MAIN_CONTRACT_ADDRESS;
  const myContract = await hre.ethers.getContractAt("SomeNFT", MAIN_CONTRACT_ADDRESS);

  const mint = await myContract.mint(accounts[0].address, 1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
