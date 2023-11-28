# Part.1: Create and deploy your own subgraph

_In this course you will learn how to create your own Subgraph and how to deploy it._

## Pre-requisite

### Polygon Scan

Create a [Polygon Scan](https://polygonscan.com/) account and from there create a new API Key, we will use it later.

## Initialize your subgraph:

Started from now, we will begin to create our own subgraph based on the NFTContract smart-contract!

As an example or if you have a problem you can look at the Subgraph I already created in the `nft-subgraph` folder.

The objective is to create our own subgraph with the Hosted Service, to being able to query NFT IDs by Owner through our subgraph. Here is the process:

- First go to: [this page](https://thegraph.com/hosted-service) and `Sign in` with your Github account.

- Then go to your Dashboard and click `add a subgraph`.

- Then fill the required informations and click `create subgraph`.

- Open your terminal and install the Graph CLI:

```
npm install -g @graphprotocol/graph-cli
```

- Go to `learn-thegraph/nft-contract` and create your `.env`:

```
$ cp .env.example .env
```

- Add your private key in the `.env` file.

- Add your polygonscan API key previously created to the ETHERSCAN_API_KEY field.

Now init the smart contract:

```
$ yarn install
...
$ yarn hardhat compile
...
$ yarn hardhat  --network mumbai deploy
Nothing to compile
...
Successfully submitted source code for contract
contracts/SomeNFT.sol:SomeNFT at 0x254Df466B9E09C268ca377428AE4Ead7F7D6Ba22
for verification on the block explorer. Waiting for verification result...

Successfully verified contract SomeNFT on Etherscan.
https://mumbai.polygonscan.com/address/0x254Df466B9E09C268ca377428AE4Ead7F7D6Ba22#code
--------------------------------
```

Here the contract has been deployed on address `0x254Df466B9E09C268ca377428AE4Ead7F7D6Ba22`. Copy paste your own deployment address for next step.

- init the subgraph creation:

```
graph init --product hosted-service --from-contract <Your contract deployment address> <Your github account name>/<The name of subgraph you created previously>
```

- Then continue the init process as follow:

  - Protocol: `Ethereum`

  - Subgraph name: `<Your github account name>/<The name of subgraph you created previously>` (or Tab)

  - Directory: `subgraph`

  - Ethereum Network: `Mumbai`

  - Contract Address: `0x254Df466B9E09C268ca377428AE4Ead7F7D6Ba22` (Or Tab)

  - Start Block: `32000000`

  - Contract Name: `SomeNFT`

  - Index contract events as entities: `true`

  - Add another contract: `n`

- Then: `cd subgraph`. Take care to remove `.git` directory inside `subgraph` directory.

Your subgraph is initialized, congrats!

## Create your subgraph rules:

Now we will start creating our API based on our smart-contract and the datas we want to get.

As reminder we want to get the NFT IDs by Owner for our NFTContract smart-contract.

Now that you have initialized your subgraph, you can open it in your favorite code editor.

You can see several files already filled. You will have to understand and modify 3 of them: `./schema.graphql`, `./subgraph.yaml` and `./src/some-nft.ts`.

`./schema.graphql`: This file is the GraphQL Schema, it defines the entities and properties you would like to save and query in your API.

`./subgraph.yaml`: This file is the Manifest, it defines the smart contracts your subgraph indexes, their ABIs, which events from these contracts to pay attention to, and how to map event data to entities you created in the GraphQL Schema.

`./src/some-nft.ts`: This file is the Mapping, it allows you to connect your smart contracts events to your GraphQL Schema entities. This is where you create the logic you want between your smart contracts and your API, and where you usually will spend the majority of your time.

### GraphQL Schema

First, in the `./schema.graphql` file, you will have to create your entities. Entities are the objects that you will get when querying your API, so you have
to think of what you want to get first. In our case we want the owners and the NFT IDs, so for that we will create two entities: `Token` and `Owner`.

- Open the `./schema.graphql` file. (Note that some code is already written. This language is the GraphQL, you can learn more about it [here](https://graphql.org/learn/))

- Add our `Token` and `Owner` entities at the end of the file:

```
type Token @entity {
  id: ID!
  owner: Owner!
  mintedAt: BigInt!
}

type Owner @entity {
  id: ID!
  tokens: [Token!]! @derivedFrom(field: "owner")
}
```

Let's explain this code!

As you can see to create an entity in GraphQL you do:

```
type <EntityName> @entity {
  ...
}
```

This will create your entity and you will be able to query it via an API call (we will explain how to do it in the part 2).

Inside your entity you will be able to create several properties. Note that you can create as much properties as you need, you create your own API here (you will link this to the smart contract events later).

These properties are set as follow:

```
type <EntityName> @entity {
  <PropertyName1>: <Type>!
  <PropertyName2>: <Type>
  <PropertyName3>: <Type>
  ...
}
```

At the end of the line, you can see a `!` sometimes. This exclamation mark means that the property is required.

Usually we advise developers to put an `id` property in each entities with the specific `ID!` type created for this purpose.

Finally in `Owner` entity we have the line:

```
tokens: [Token!]! @derivedFrom(field: "owner")
```

The `[]` means that we expect an array in this property. So `[Token!]!` means that an array is require with `Token` element types inside also required.

The `@derivedFrom(field: "owner")` means that this property will automatically derived from the `owner` property of the `Token` entity. This is a link connection between these properties.

### The Graph Manifest

In the `./subgraph.yaml` file, TheGraph should have already created many things. You can see the specs, your schema file path, your smart contract address and abi path, the network name, the language, etc.

The field that will interest us and to modify are the `entities` and the `eventHandlers`.

- in the `entities` field you will have to put the names of the entities you added in the GraphQL Schema file:

```
entities:
  ...
  - Token
  - Owner
```

- In the `eventHandlers` field you will have to declare the events you want to listen in your smart contract, and the handler functions you want to trigger in your Mapping file if one of the event is emit. In our case we have:

```
eventHandlers:
  - event: Approval(indexed address,indexed address,indexed uint256)
    handler: handleApproval
  - event: ApprovalForAll(indexed address,indexed address,bool)
    handler: handleApprovalForAll
  - event: Mint(indexed address,uint256)
    handler: handleMint
  - event: Transfer(indexed address,indexed address,indexed uint256)
    handler: handleTransfer
```

You can see that we listen the `Mint()` and `Transfer()` events of our smart contract and we trigger the `handleMint` and `handleTranfer` functions of our Mapping file (the Mapping file will be explain in the next section).

Before continue with the Mapping file, you will have to codegen your code:

```
graph codegen
```

### The Graph Mapping

Finally in `./src/some-nft.ts`, our Mapping file, you have to create the logical links between your smart contract events & parameters and your API entities. This ensure TheGraph to make the bridge between the API queries and the Blockchain datas.

- Import your entities and your smart contract events as follow:

```
import { Owner, Token } from "../generated/schema";
```

- Complete the `handleMint` function logic with:

```
export function handleMint(event: MintEvent): void {
  ...

  const owner = getOrCreateOwner(event.params._to.toHex());
  const token = new Token(event.params._tokenId.toString());

  token.mintedAt = event.block.timestamp;
  token.owner = owner.id;

  token.save();
}

function getOrCreateOwner(address: string): Owner {
  let owner = Owner.load(address);

  if (!owner) {
    owner = new Owner(address);
    owner.save();
  }

  return owner;
}
```

**Let's explain this code.**

Our objective is to create and fill our entities of the GraphQL Schema file with the datas in our smart contract events. For this purpose, we first create 2 functions, `handleMint()` and `getOrCreateOwner()`. Functions with the `export` keyword means that they can be triggered externally by TheGraph.

In our logic we decided to create the `getOrCreateOwner()` in order to verify if the minter is already store as an `Owner` or not. You can notify with our function creation `function getOrCreateOwner(address: string): Owner { ... }` that we want an address `string` in parameters and we expect an `Owner` in return.

To verify if the owner already exists, we `load()` our owners with the `id` in parameters (we chosen to put the Ethereum address as id for owners) and check if it already exists or not.

If the owner doesn't exist, we create a new one with `owner = new Owner(address);` with his address as `id` parameter. As reminder our `Owner` entity only need an `id` and a `tokens` parameter as defined in our GraphQL Schema. But the `tokens` parameter is automatically derived from our `Token` entity so we don't have to specify it, only the `id` is require to create and save our `Owner` entity.

So then we `save()` our entity previously created to store it. It is really important to don't forget to `save()` your entities to successfully store them.

Then we return our `owner` entity.

Now, in the `handleMint()` function, we want our `MintEvent` event in parameters (it will be call thanks to our `./subgraph.yaml` file previously created) and we expect nothing in return.

First we get our `Owner` entity (loaded or created) with our `getOrCreateOwner()` function, and we create a new `Token` entity with the NFT tokenId as `id` parameter.

As we can see, we can access our smart contract event parameters with `event.params.<paramName>`. Be carefull and try to put them in the good format you want.

In our `Token` entity we have 3 parameters: `id`, `owner` and `mintedAt`. We already have the `id` parameter so we want the two others. For the `owner` parameter, we just get the `id` of the owner previously created (or loaded) with `token.owner = owner.id;`.

Then for the `mintedAt` parameter, we will get the timestamp of our mint (i.e. the timestamp of the block where the `Mint()` event was triggered). We have access to this information with `event.block.timestamp`.

Finally don't forget to save your new `Token` entity.

Well done you successfully connected your `Mint()` event to your API entities!

- Now let's connect our `Transfer()` event by completing `handleTransfer` function:

```
export function handleTransfer(event: TransferEvent): void {
  ...

  const nextOwner = getOrCreateOwner(event.params.to.toHex());

  let token = Token.load(event.params.tokenId.toString());

  if (!token) {
    return;
  }

  token.owner = nextOwner.id;

  token.save();
}
```

Now that you're an expert you can see that we have the `TransferEvent` event in parameter and expect nothing in return. We then get our owner with our previous `getOrCreateOwner()` function.

Then we load our `Token` entity with his `id` parameter the same way we did before with the `Owner` entity. Here we only have to load because it's a `Transfer()` event so the token already exist and only change his owner.

To be sure we still check if we already have store this `Token`, and then we modify his `owner` property to the new one.

We don't forgot to `save()` and here we are, the logic of our subgraph is finish!

Now we only have to deploy it and then you will be able to query you own subgraph.

## Deploy your subgraph:

When your subgraph is finish, you just need to deploy it.

- First, on your local subgraph directory in terminal run `graph build` to build your subgraph.

- Then you will need to authentificate you. For this, go to your subgraph dashboard and copy your `<ACCESS_TOKEN>`. You can then run:

```
graph auth --product hosted-service <ACCESS_TOKEN>
```

- Finally deploy your subgraph with:

```
graph deploy --product hosted-service <Github>/<SubgraphName>
```

Congratulations! You've now successfully created and deployed your own subgraph!

For more documentation you can see here to [create a new subgraph](https://thegraph.com/docs/en/developing/creating-a-subgraph/) or here for [polygon specifications](https://wiki.polygon.technology/docs/develop/data/graph/).

## Next Steps

Well play! Now that you have created your own subgraph, let's learn how to query blockchain datas from it in the [Next Course](./Part2.QueryDatas.md)!
