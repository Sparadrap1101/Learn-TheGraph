// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SomeNFT is ERC721 {
    constructor() ERC721("SomeNFTs", "SNFT") {}

    event Mint(address indexed _to, uint256 _tokenId);

    function mint(address _to, uint256 _tokenId) public {
        _mint(_to, _tokenId);

        emit Mint(_to, _tokenId);
    }
}
