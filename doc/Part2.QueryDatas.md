# Part.2: Query request on NFTContract smart-contract with a NodeJS App.

_In this course you will learn how to query blockchain datas with a NodeJS application using your Subgraph._

## Pre-requisite

Make sure you already finish the Part.1 and [created your own Subgraph](./Part1.CreateSubgraph.md).

## Use TheGraph API with a NodeJS App

Now we gonna query some datas from our `SomeNFT` smart contract through the API you just created with TheGraph!

### Run some transations on the contract

Before making queries we will perform some transactions on the smart contract we [previously](./Part1.CreateSubgraph.md) deployed on mumbai.

```
$ yarn hardhat --network mumbai console
...
Type ".help" for more information.
> const hre = require("hardhat")
> let somenft = await hre.ethers.getContractAt("SomeNFT", '<YOUR SMART CONTRACT ADDRESS AS DEPLOYED IN PREVIOUS EXERCISE>');
> const [deployer, player] = await hre.ethers.getSigners();
> await somenft.balanceOf(deployer.address)
BigNumber { _hex: '0x00', _isBigNumber: true }
> await somenft.mint(deployer.address, 10083);
> await somenft.balanceOf(deployer.address)
BigNumber { _hex: '0x01', _isBigNumber: true }
> await somenft.mint(deployer.address, 12083);
> await somenft.mint(deployer.address, 10283);
> await somenft.mint(deployer.address, 10023);
```

---

### The Graph queries

We have created a simple node.js app for this purpose in `dapp` folder.

#### The Graph app first analyses

Open the `dapp/script.js` file and look at the code, we will explain it now.

First, we import `axios`. Axios is a simple promise based HTTP client for the browser and node.js. It is the client that will allow us to query our subgraph.

Then we create our `main` async function that will call our API.

Then come the most important part of our code:

```
const result = await axios.post("<API_URL>", {
    query: `{
        owners {
          id
          tokens {
            id
          }
        }
    }`,
});

console.log("Results are:", result.data.data.owners);
```

In the first line you can see that we use Axios for our API request. In GraphQL API request will always be `post` requests, so we use this keyword.

In the `post()` parameters you can see 2 things, first the `API_URL` and then your query:

```
query: `{
  ...
}`
```

For the `query` parameters we will detail how it works in the next section. At the moment you only have to know that this is a GraphQL query that will ask our API to return the NFT IDs by Owner from our NFTContract smart contract datas.

Then we console.log() the result. We find it in `result.data.data.owners`. There are two times `data` because one is from Axios and the other from TheGraph so you have to put it two times to get your datas. The `owners` keyword is here because we choose this entity in our request but you will modify it if the request is modified (it can also be remove).

#### The Graph app setup

- In order to successfully run the script, go to `learn-thegraph/dapp` and install dependencies with:

```
npm install
```

- Copy `.env.example` file into `.env` :

```
cp .env.example .env
```

- SetGo to your [Dashboard](https://thegraph.com/hosted-service/dashboard), copy the API URL of your subgraph and paste it to setup `API_URL` var in `.env` file.

- Finally, to test the script run:

```
node script.js
```

You should get the results!

![](../img/scriptResult.png)

## Querying Code

Now we will focus on the querying code.

This is the most important part of your code because this is what you ask to the API to get the datas you want. So you have to understand how to communicate with the API.

First, your queries will always be in the `query` brackets:

```
query: `{
  <yourQueryHere>
}`
```

To correctly ask for datas in your query, you have to know how the GraphQL Schema of the API is built. In our case you just created it in Part.1 so you know the Schema.

Your query will follow the Schema organization, you will enter entities and properties that you want your API to return.

If you look of the query in `script.js` you can see this:

```
owners {
  id
  tokens {
    id
  }
}
```

We want to get all our `Owner` entities with the `id` and the `tokens` properties.

**Important rules for queries:**

- In every queries, you can't only specify the entity, you always have to specify at least one property. When a property is derived from an entity (like `tokens` here), you also have to specify at least one subproperty of this special property or the query will fail.

- Add an "s" at the end of the entities to get several (here `Owner` -> `owners`). If there is any "s", it will only return one element and you have to specify which element you want with and only with his `id` in parameter.

- To add a parameter in your query, add parenthesis, the parameter name you want and the parameter between quotation marks. For example, if you want to get the `mintedAt` timestamp of your Token with an `id` equal to 1, your query will be:

```
token(id: "1") {
  mintedAt
}
```

- Your parameters have always to be a string and in lower case. Warning when using Ethereum addresses, if there is one letter in upper case the result will be Null! For example, if you want to get the NFT IDs of one specific Owner, you will do:

```
owner(id: "0x767bcbca6388b74911b00a65da666b9f813a4aee") {
  tokens {
    id
  }
}
```

- GraphQL queries also allow to add some sorting or pagination arguments. It works the same way parameters works but with specific keywords and without quotation marks. If you want to sort by a specific property use `orderBy` argument with the property you want to sort by. You can choose the sorting direction with `orderDirection: asc` for ascendant or `orderDirection: desc` for descendant.

- For pagination, you can use the `first` keyword with a number to return only this number of values, and the `skip` keyword to skip this number of values.

For example if we want to get 10 tokens with their owners starting from the 20th sorted by IDs in ascendant direction, we will do:

```
tokens(first: 10, skip: 20, orderBy: id, orderDirection: asc) {
  id
  owners {
    id
  }
}
```

Queries should avoid using very large `skip` values since they generally perform poorly. For retrieving a large number of items, it is much better to page through entities based on an attribute.

Note that the `first` argument take only a maximum of `1000` elements. If any `first` argument is passed, `100` elements will be displayed by default.

- You can filter with `where` keyword and the filter you want. For example use `id_gt` for "ID greater than" or `id_lt` for "ID lower than".

For example, if you want to get the first 10 owners of the tokens filtered by ID greater than 1, the code is:

```
tokens(first: 10, where: { id_gt: 1 }) {
  id
  owner {
    id
  }
}
```

For more, [see documentation](https://thegraph.com/docs/en/querying/graphql-api/).

## Next Steps

Well play! Now that you know how to query datas from your subgraph, let's learn how to develop in local and test your subgraph in the [Next Course](./Part3.LocalDevelopment.md)!

_// Hosted Service will be deprecated in 2023 https://thegraph.com/blog/sunsetting-hosted-service/ switch to Studio, check Requirements for indexing._
