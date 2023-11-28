import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Approval } from "../generated/schema";
import { Approval as ApprovalEvent, Mint, Transfer } from "../generated/SomeNFT/SomeNFT";
import { handleMint, handleTransfer } from "../src/some-nft";
import { createMintEvent, createTransferEvent } from "./some-nft-utils";
import { log } from "@graphprotocol/graph-ts";

var ownerAddress: string = "0x0000000000000000000000000000000000000001";
let userAddress: string = "0x0000000000000000000000000000000000000002";
let tokenId: string = "1";
let tokenId2: string = "2";
let newMintEvent: Mint;
let newMintEvent2: Mint;
let newTransferEvent: Transfer;

log.info("test1 {}", [ownerAddress]);

describe("Test Subgraph API returns of Mint, Transfer, Owner & Token entities", () => {
  log.info("test2 {}", [ownerAddress]);

  beforeAll(() => {
    log.info("Owner '{}', Owner to Address '{}'", [ownerAddress, Address.fromString(ownerAddress).toString()]);

    newMintEvent = createMintEvent(Address.fromString(ownerAddress), BigInt.fromString(tokenId));
    handleMint(newMintEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("Should test Token entity creation", () => {
    log.info("test {}", [ownerAddress]);

    assert.fieldEquals("Token", tokenId, "owner", ownerAddress);

    assert.fieldEquals("Token", tokenId, "mintedAt", newMintEvent.block.timestamp.toString());
  });
  /*
  test("Should test Owner entity creation", () => {

    //newMintEvent = createMintEvent(Address.fromString(ownerAddress), BigInt.fromString(tokenId2))
    //handleMint(newMintEvent)

    let array: Array<ethereum.Value> = [ethereum.Value.fromI32(tokenId), ethereum.Value.fromI32(tokenId2)]

    assert.arrayEquals(array, ethereum.Value.fromArray(array))
    
    assert.fieldEquals(
      "Owner",
      ownerAddress,
      "tokens",
      array.toString()
    )
  })*/

  test("Should test Mint entity creation", () => {
    log.info("test {}", [newMintEvent.transaction.hash.concatI32(newMintEvent.logIndex.toI32()).toHexString()]);

    assert.fieldEquals(
      "Mint",
      newMintEvent.transaction.hash.concatI32(newMintEvent.logIndex.toI32()).toHexString(),
      "_to",
      ownerAddress
    );

    assert.fieldEquals(
      "Mint",
      newMintEvent.transaction.hash.concatI32(newMintEvent.logIndex.toI32()).toHexString(),
      "_tokenId",
      tokenId
    );

    assert.fieldEquals(
      "Mint",
      newMintEvent.transaction.hash.concatI32(newMintEvent.logIndex.toI32()).toHexString(),
      "blockNumber",
      newMintEvent.block.number.toString()
    );

    assert.fieldEquals(
      "Mint",
      newMintEvent.transaction.hash.concatI32(newMintEvent.logIndex.toI32()).toHexString(),
      "blockTimestamp",
      newMintEvent.block.timestamp.toString()
    );

    assert.fieldEquals(
      "Mint",
      newMintEvent.transaction.hash.concatI32(newMintEvent.logIndex.toI32()).toHexString(),
      "transactionHash",
      newMintEvent.transaction.hash.toHexString()
    );
  });

  test("Should test if entities are incremented when several are created", () => {
    log.info("test2 {}", [ownerAddress]);

    assert.entityCount("Mint", 1);
    //assert.entityCount("Token", 1)
    assert.entityCount("Owner", 1);

    newMintEvent2 = createMintEvent(Address.fromString(userAddress), BigInt.fromString(tokenId2));
    handleMint(newMintEvent2);

    //assert.entityCount("Mint", 2)
    assert.entityCount("Token", 2);
    assert.entityCount("Owner", 2);
  });

  test("Should modify owner field of Token entity after a transfer", () => {
    assert.fieldEquals("Token", tokenId, "owner", ownerAddress);

    newTransferEvent = createTransferEvent(
      Address.fromString(ownerAddress),
      Address.fromString(userAddress),
      BigInt.fromString(tokenId)
    );
    handleTransfer(newTransferEvent);

    assert.fieldEquals("Token", tokenId, "owner", userAddress);
  });

  /*test("Should modify tokens field of Owner entity after a transfer", () => {

    assert.fieldEquals(
      "Owner",
      ownerAddress,
      "tokens",
      tokenId // Need an array but not possible, may arrayEquals() but need ethereum value
    )

    assert.fieldEquals(
      "Owner",
      userAddress,
      "tokens",
      ""
    )

    newTransferEvent = createTransferEvent(Address.fromString(ownerAddress), Address.fromString(userAddress), BigInt.fromString(tokenId))
    handleTransfer(newTransferEvent)

    assert.fieldEquals(
      "Owner",
      ownerAddress,
      "tokens",
      ""
    )

    assert.fieldEquals(
      "Owner",
      userAddress,
      "tokens",
      tokenId
    )
  })*/

  test("Should test Transfer entity creation", () => {
    newTransferEvent = createTransferEvent(
      Address.fromString(ownerAddress),
      Address.fromString(userAddress),
      BigInt.fromString(tokenId)
    );
    handleTransfer(newTransferEvent);

    assert.fieldEquals(
      "Transfer",
      newTransferEvent.transaction.hash.concatI32(newTransferEvent.logIndex.toI32()).toHexString(),
      "from",
      ownerAddress
    );

    assert.fieldEquals(
      "Transfer",
      newTransferEvent.transaction.hash.concatI32(newTransferEvent.logIndex.toI32()).toHexString(),
      "to",
      userAddress
    );

    assert.fieldEquals(
      "Transfer",
      newTransferEvent.transaction.hash.concatI32(newTransferEvent.logIndex.toI32()).toHexString(),
      "tokenId",
      tokenId
    );

    assert.fieldEquals(
      "Transfer",
      newTransferEvent.transaction.hash.concatI32(newTransferEvent.logIndex.toI32()).toHexString(),
      "blockNumber",
      newMintEvent.block.number.toString()
    );

    assert.fieldEquals(
      "Transfer",
      newTransferEvent.transaction.hash.concatI32(newTransferEvent.logIndex.toI32()).toHexString(),
      "blockTimestamp",
      newMintEvent.block.timestamp.toString()
    );

    assert.fieldEquals(
      "Transfer",
      newTransferEvent.transaction.hash.concatI32(newTransferEvent.logIndex.toI32()).toHexString(),
      "transactionHash",
      newMintEvent.transaction.hash.toHexString()
    );
  });
});
