import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react';
import { BannerStrip } from '@web3uikit/core';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Box } from '@chakra-ui/react'
import { Image } from '@chakra-ui/react'
import { Heading } from '@chakra-ui/react'
import { Badge } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import Contract from '../NFTMarketplace.json';
const marketContractAddress: string = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
import { ethers } from 'ethers';
import axios from 'axios'
import Web3Modal from 'web3modal'

export default function Home() {

  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider('');
    const NFTMarketplace = new ethers.Contract(marketContractAddress, Contract.abi, provider)
    let data = await NFTMarketplace.fetchMarketItems()
    
    const items = await Promise.all(data.map(async nft => {
      const id = nft.tokenId.toString();
      const tokenURI = await NFTMarketplace.tokenURI(id)
      let price = ethers.utils.formatUnits(nft.price.toString(), 'ether')
      const metadatas = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      let object = {}
      const go = await axios.get(metadatas).then(response => {
        let name = response.data.name;
        let image = response.data.image;
        image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
        let description = response.data.description;
        object = {
          name: name,
          image: image,
          description: description,
          tokenId: id,
          price: price
        }
      })
      return object
    }))
    setNfts(items)
  }

  return(
    <div className="nftList">
      {
        nfts.length === 0 ? (
          <>
            <p>No NFT</p>
            {nfts}
          </>
        ) : (
          <>
            {
              nfts.map((nft) => {
                return (
                  <div className="nftListElement" key={nft.image}>
                    <Box maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
                      <Image src={nft.image} alt={nft.name} />

                      <Box p='6'>

                        <Box
                          mt='1'
                          fontWeight='semibold'
                          as='h3'
                          lineHeight='tight'
                          noOfLines={1}
                        >
                          {nft.name}
                        </Box>
                        <Box
                          mt='1'
                          lineHeight='tight'
                          noOfLines={1}
                        >
                          {nft.description}
                        </Box>
                        <Box
                          mt='1'
                          lineHeight='tight'
                          noOfLines={1}
                        >
                          <Badge colorScheme='purple'>
                            <Text fontWeight="bold" as="span">{nft.price}</Text> <Text as="span">Eth</Text>
                          </Badge>
                        </Box>
                        <Button mt='1rem' colorScheme='purple' width='100%' size='lg'>
                          Buy
                        </Button>
                      </Box>
                    </Box>
                  </div>
                )
              })
            }
          </>
        )
      }
    </div>
  )
}
