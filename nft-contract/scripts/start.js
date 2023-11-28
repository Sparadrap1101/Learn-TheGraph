const { create } = require("ipfs-http-client");
const { ethers, run, network } = require("hardhat");
require("dotenv").config();

async function main() {
  // Some smart-contract interactions
  /*
  const accounts = await ethers.getSigners();
  const MAIN_CONTRACT_ADDRESS = process.env.MAIN_CONTRACT_ADDRESS;
  const myContract = await hre.ethers.getContractAt("SomeNFT", MAIN_CONTRACT_ADDRESS);

  const mint = await myContract.mint(accounts[0].address, 1);*/

  // Some IPFS datas push

  const ipfs = create({ url: "http://127.0.0.1:5001" }); // connect to API address http://localhost:15001

  /*const uri = await contractInstance.methods.tokenURI(id).call();

  let url = `${uri.toString().split("ipfs://")[1]}`;

  console.log(url);
  const result = await ipfs.get(url);*/

  var ipfsData = {
    title: "I'm a title.",
    type: "DataType",
    description: "Here is the desc.",
  };

  const addFile = async () => {
    try {
      console.log("Yasss");
      let jsonIPFSData = JSON.stringify(ipfsData);
      console.log(`ipfs.add(${jsonIPFSData})`);
      const { cid } = await ipfs.add(jsonIPFSData);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      let uri = "ipfs://" + cid.toString();
      console.log(uri);

      /*console.log(`mintAsset(${to}, ${creationDate}, ${uri}, ${location}, ${description})`);
      await contractInstance.methods
        .mintAsset(to, creationDate, uri, location, description)
        .send({ from: accountAddress, gasPrice: "0x0", gasLimit: "0x30D40" });*/
    } catch {
      console.log("Failed");
    }
  };

  addFile();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
