import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  Mint as MintEvent,
  Transfer as TransferEvent
} from "../generated/SomeNFT/SomeNFT"
import { Approval, ApprovalForAll, Mint, Transfer } from "../generated/schema"
import { Owner, Token } from "../generated/schema";

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMint(event: MintEvent): void {
  let entity = new Mint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._to = event.params._to
  entity._tokenId = event.params._tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  const owner = getOrCreateOwner(event.params._to.toHex());
  const token = new Token(event.params._tokenId.toString());

  token.mintedAt = event.block.timestamp;
  token.owner = owner.id;

  token.save();
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  const nextOwner = getOrCreateOwner(event.params.to.toHex());

  let token = Token.load(event.params.tokenId.toString());

  if (!token) {
    return;
  }

  token.owner = nextOwner.id;

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