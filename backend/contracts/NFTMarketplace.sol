// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title NFT Marketplace
/// @author Ben BK

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error NFTMarketplace__NotTheOwner();
error NFTMarketplace__PriceIsNull();
error NFTMarketplace__ListingPriceNotMet();
error NFTMarketplace__NotNftOwner();
error NFTMarketplace__SalePriceNotMet();

contract NFTMarketplace is ERC721URIStorage {
    // We need to keep track of the last tokenId
    uint private _tokenIds;
    // The number of items that are currently on sale
    uint private _itemsSold;

    // Fee given to the owner of the smart contract for each sale
    uint256 listingPrice = 0.025 ether;
    address payable owner;

    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      bool sold;
    }

    event MarketItemCreated (
      uint256 indexed tokenId,
      address seller,
      address owner,
      uint256 price,
      bool sold
    );

    constructor() ERC721("Ben BK NFT Marketplace", "BBKNFTM") {
      owner = payable(msg.sender);
    }

    /// @notice Updates the listing price of the contract
    /// @param _listingPrice The new listing price
    function updateListingPrice(uint _listingPrice) public payable {
      if(owner != msg.sender) {
        revert NFTMarketplace__NotTheOwner();
      }
      listingPrice = _listingPrice;
    }

    /// @notice Returns the listing price of the contract 
    /// @return listingPrice The listing price
    function getListingPrice() public view returns (uint256) {
      return listingPrice;
    }

    /// @notice Mints a token and lists it in the marketplace 
    /// @param tokenURI The TokenURI of the NFT
    /// @param price The price of the NFT
    /// @return newTokenId The TokenId of the NFT
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
      _tokenIds = _tokenIds + 1;
      uint256 newTokenId = _tokenIds;

      _mint(msg.sender, newTokenId);
      _setTokenURI(newTokenId, tokenURI);
      createMarketItem(newTokenId, price);
      return newTokenId;
    }

    /// @notice Create a Market Item (List a new NFT on the Marketplace)
    /// @param tokenId The Token Id of the NFT
    /// @param price The price of the NFT
    function createMarketItem(
      uint256 tokenId,
      uint256 price
    ) private {
      if(price <= 0) {
        revert NFTMarketplace__PriceIsNull();
      }
      if(msg.value != listingPrice) {
        revert NFTMarketplace__ListingPriceNotMet();
      }

      idToMarketItem[tokenId] =  MarketItem(
        tokenId,
        payable(msg.sender),
        payable(address(this)),
        price,
        false
      );

      _transfer(msg.sender, address(this), tokenId);
      emit MarketItemCreated(
        tokenId,
        msg.sender,
        address(this),
        price,
        false
      );
    }

    /// @notice Allows someone to resell a NFT they have purchased
    /// @param tokenId The Token Id of the NFT 
    /// @param price The new Price of the NFT
    function resellToken(uint256 tokenId, uint256 price) public payable {
      if(idToMarketItem[tokenId].owner != msg.sender) {
        revert NFTMarketplace__NotNftOwner();
      }
      if(msg.value != listingPrice) {
        revert NFTMarketplace__ListingPriceNotMet();
      }
      idToMarketItem[tokenId].sold = false;
      idToMarketItem[tokenId].price = price;
      idToMarketItem[tokenId].seller = payable(msg.sender);
      idToMarketItem[tokenId].owner = payable(address(this));
      _itemsSold--;

      _transfer(msg.sender, address(this), tokenId);
    }

    /// @notice Creates the sale of a marketplace item and transfers ownership of the item, as well as funds between parties
    /// @param tokenId The Token Id of the NFT
    function createMarketSale(uint256 tokenId) public payable {
      uint price = idToMarketItem[tokenId].price;
      address seller = idToMarketItem[tokenId].seller;
      if(msg.value != price) {
        revert NFTMarketplace__SalePriceNotMet();
      }
      
      idToMarketItem[tokenId].owner = payable(msg.sender);
      idToMarketItem[tokenId].sold = true;
      idToMarketItem[tokenId].seller = payable(address(0));
      _itemsSold++;
      _transfer(address(this), msg.sender, tokenId);
      payable(owner).transfer(listingPrice);
      payable(seller).transfer(msg.value);
    }

    /// @notice Returns all unsold market items
    /// @return All the unsold market items
    function fetchMarketItems() public view returns (MarketItem[] memory) {
      uint itemCount = _tokenIds;
      uint unsoldItemCount = _tokenIds - _itemsSold;
      uint currentIndex = 0;

      MarketItem[] memory items = new MarketItem[](unsoldItemCount);
      for (uint i = 0; i < itemCount; i++) {
        if (idToMarketItem[i + 1].owner == address(this)) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /// @notice Returns only items that a user has purchased
    /// @return Returns all the items that a user has purchased
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
      uint totalItemCount = _tokenIds;
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /// @notice Returns only items a user has listed 
    /// @return All the items a user has listed
    function fetchItemsListed() public view returns (MarketItem[] memory) {
      uint totalItemCount = _tokenIds;
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }
}