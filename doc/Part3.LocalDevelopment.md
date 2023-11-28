# Part.3: Run all in local to test and query in your localhost.

_In this course you will learn how to run and simulate your applications in local._

## Pre-requisite

Make sure you already finish the [Part.1](./Part1.CreateSubgraph.md) and [Part.2](./Part2.QueryDatas.md) courses.

For this course, you'll need a Linux environment.

## Explanations

We want to be able to deploy, query and test our subgraph and our smart contracts in local. For this purpose we will need to run a local Blockchain (with Ganache), a Postgres
database, an IPFS instance & a Graph Node. All of them will run in a Docker container. This course is adapted for Linux users and doesn't work this way for Windows users.

## Deploy Docker containers and install dependencies

- First we will install dependencies. Clone this repo, open your terminal, go to the `nft-contract` directory and run:

```
yarn install
```

- Then go to the `nft-subgraph` directory and run again:

```
yarn install
```

- Now deploy the docker container in the same directory with:

```
docker-compose up -d
```

This will execute your code inside the `docker-compose.yml` which create containers and run your Ganache, Postgres, IPFS and Graph Node. You can see their logs with `docker logs -f <Container Name>` and `ctrl + C` to exit.

You have now successfully created and deployed you Docker containers!

If you want to stop them do `docker-compose down`, but keep them up for the moment.

## Deploy your smart-contract on your Ganache local Blockchain

- In your Docker terminal, do `docker logs -f ganache-node` and make sure the `RPC Listening on` is `0.0.0.0:8545`, or copy it.

- Open your `.env` file in your `nft-contract` directory. You will see the `GANACHE_RPC_URL=`, make sure the url is the same of above or paste your RPC URL.

- Now open another terminal, go to your `nft-contract` directory and compile your smart contracts with:

```
yarn hardhat compile
```

- Deploy your contract using:

```
yarn hardhat deploy --network localhost
```

You should get:

```
Account: 0xE0bc97dA4b255E88352300f4cbdb6d780eF02318
deploying "SomeNFT" (tx: 0x56bb087030d00f71c7fe27eb9a1584cf2c89a3345ce7529b7f15c003c19088c7)...: deployed at 0xdeAFFfB593C4f037170B0F6275fe6Fc17Aa7ff8F with 2128759 gas
```

It means your contract has been successfully deployed in local! And the address of the contract here is `0xdeAFFfB593C4f037170B0F6275fe6Fc17Aa7ff8F`.

Now we will mint an NFT in this contract in order to see something in our Subgraph.

- First copy the address of the contract you just created.

- Go to your `nft-contract/.env` file and paste it on the `MAIN_CONTRACT_ADDRESS=` line.

- Now run the `interact.js` script I made to mint a token with:

```
yarn hardhat run ./scripts/interact.js --network localhost
```

If you see the Ganache logs in your other terminal you should see a transaction happened. It means you successfully mint your first token on the contract!

Now let's deploy your Subgraph.

## Deploy your subgraph on your local Graph Node

- In your terminal go to your `nft-subgraph`. This subgraph correspond to what you saw in Part.1 and Part.2.

- Open the `docker-compose.yml` file and look at the `ethereum:` line in the `graph-node:` section, you should see `mumbai:http://ganache-node:8545`. This is the way your Graph Node connect to your Ganache local Blockchain: `ethereum: '<Network Name>:<Ganache RPC URL>'`. Make sure the `<Network Name>` is the same than your `network: <Network Name>` in the `subgraph.yaml` file. This is `mumbai` in our case but you can put anything you want as long as they are the same.

- Still in the `subgraph.yaml` file, make sure the `startBlock` is set to `0`. Then put the address of the contract you just created in the `address:` line.

- Run `yarn graph codegen`. Then build your code with `yarn graph build`.

- Once done, you will create your subgraph on your Graph Node with:

```
yarn graph create --node http://localhost:8020/ my-subgraph
```

- Finally, deploy your subgraph locally:

```
yarn graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 my-subgraph
```

Same as before for the IP addresses.

- Create a first version with `v0.0.1`

Then you should get somethink like that:

```
Build completed: QmUaPrjFGDiwT7iufh7WbMSC3ifk8Mm9UTA7HnTF1JJbFj

Deployed to http://localhost:8000/subgraphs/name/my-subgraph/graphql

Subgraph endpoints:
Queries (HTTP):     http://localhost:8000/subgraphs/name/my-subgraph
```

- Copy Paste the URL on your browser. You should have a GraphQL interface to make your queries. This is all in local and you can make the queries you want from here! Try:

```
query {
  mints {
    id
    _to
    _tokenId
  }
}
```

You should get something like:

```
{
  "data": {
    "mints": [
      {
        "id": "0xffe2a3553d8a2d7d0aad5e84d142beee64845618b6e7fabac4e67165b4768e1801000000",
        "_to": "0xe0bc97da4b255e88352300f4cbdb6d780ef02318",
        "_tokenId": "1"
      }
    ]
  }
}
```

Well play you successfully deployed and queried your subgraph in local!

## Test your Subgraph

We will now run our unit test for the Subgraph in order to verify it.

- Go to `nft-subgraph` directory in your terminal and install dependencies:

```
sudo apt install libpq-dev
```

- Run your tests:

```
yarn graph test some-nft -v 0.5.4
```
