const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify.js");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [];

  console.log("Account:", deployer);

  const contract = await deploy("SomeNFT", {
    from: deployer,
    args: args,
    log: true,
  });
  /*
  const developmentChains = ["hardhat", "localhost"];

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...");
    await verify(contract.address, args);
  }
  log("--------------------------------");*/
};

module.exports.tags = ["all", "contract"];
