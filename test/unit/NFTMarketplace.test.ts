import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { BigNumber } from "ethers";
import { network, deployments, ethers } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { NFTMarketplace } from '../../typechain-types/contracts/NFTMarketplace';

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT Marketplace", function () {
      let NFTMarketplace: NFTMarketplace
      let deployer, accounts

      before(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["NFTMarketplace"])
        NFTMarketplace = await ethers.getContract("NFTMarketplace")
      })

      it('should test if the smart contract has been successfully deployed', async function() {
        assert.equal(await NFTMarketplace.name(), "Ben BK NFT Marketplace")
        assert.equal(await NFTMarketplace.symbol(), "BBKNFTM")
        let listingPrice = await NFTMarketplace.getListingPrice()
        let listingPriceToString = listingPrice.toString()
        let expectedPrice = ethers.utils.parseEther('0.025').toString()
        assert.equal(listingPriceToString, expectedPrice)
      })

      it('should mint a NFT and list it in the marketplace', async function() {
        await expect(NFTMarketplace.createToken('ipfs://CID/file.json', ethers.utils.parseEther('1'), {value: ethers.utils.parseEther('0.025')})).to.emit(
          NFTMarketplace,
          "MarketItemCreated"
        )
      })

      it('should fetch Market items', async function() {
        let fetchMarketItems = await NFTMarketplace.fetchMarketItems()
        assert.equal(fetchMarketItems.length, 1);
        assert.equal(fetchMarketItems[0].tokenId.toString(), '1')
        assert.equal(fetchMarketItems[0].seller, deployer.address)
        assert.equal(fetchMarketItems[0].owner, NFTMarketplace.address)
        assert.equal(fetchMarketItems[0].price.toString(), '1000000000000000000')
        assert.equal(fetchMarketItems[0].sold, false)
      })

      it('should return only items a user has listed', async function() {
        let fetchMarketItems = await NFTMarketplace.fetchItemsListed()
        assert.equal(fetchMarketItems.length, 1);
        assert.equal(fetchMarketItems[0].tokenId.toString(), '1')
        assert.equal(fetchMarketItems[0].seller, deployer.address)
        assert.equal(fetchMarketItems[0].owner, NFTMarketplace.address)
        assert.equal(fetchMarketItems[0].price.toString(), '1000000000000000000')
        assert.equal(fetchMarketItems[0].sold, false)
      })

      it('should buy a NFT', async function() {
        await NFTMarketplace.connect(accounts[1]).createMarketSale(1, { value: ethers.utils.parseEther('1')})
        let NFTsOwnedByAccount1 = await NFTMarketplace.connect(accounts[1]).fetchMyNFTs()
        assert.equal(NFTsOwnedByAccount1.length, 1);
        assert.equal(NFTsOwnedByAccount1[0].tokenId.toString(), '1')
        assert.equal(NFTsOwnedByAccount1[0].seller, '0x0000000000000000000000000000000000000000')
        assert.equal(NFTsOwnedByAccount1[0].owner, accounts[1].address)
        assert.equal(NFTsOwnedByAccount1[0].price.toString(), '1000000000000000000')
        assert.equal(NFTsOwnedByAccount1[0].sold, true)
      })

      it('should resell an NFT', async function() {
        await NFTMarketplace.connect(accounts[1]).resellToken(1, ethers.utils.parseEther('1'), { value: ethers.utils.parseEther('0.025')})
        let marketedItems = await NFTMarketplace.fetchMarketItems()
        assert.equal(marketedItems.length, 1);
        assert.equal(marketedItems[0].tokenId.toString(), '1')
        assert.equal(marketedItems[0].seller, accounts[1].address)
        assert.equal(marketedItems[0].owner, NFTMarketplace.address)
        assert.equal(marketedItems[0].price.toString(), '1000000000000000000')
        assert.equal(marketedItems[0].sold, false)
      })
    })