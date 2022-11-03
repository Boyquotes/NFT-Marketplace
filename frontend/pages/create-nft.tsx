// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
// import { useEffect, useState } from 'react';
// import { BannerStrip } from '@web3uikit/core';
// import {
//   Alert,
//   AlertIcon,
//   AlertTitle,
//   AlertDescription,
// } from '@chakra-ui/react'
// import Contract from '../NFTMarketplace.json';
// const marketContractAddress: string = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
// import { ethers } from 'ethers';
// import axios from 'axios'
// import Web3Modal from 'web3modal'
// import { useRouter } from 'next/router'
// import { create as ipfsHttpClient } from 'ipfs-http-client'

// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

// export default function CreateItem() {

//     const [fileUrl, setFileUrl] = useState(null)
//     const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
//     const router = useRouter()

//     async function onChange(e) {
//         /* upload image to IPFS */
//         const file = e.target.files[0]
//         try {
//           const added = await client.add(
//             file,
//             {
//               progress: (prog) => console.log(`received: ${prog}`)
//             }
//           )
//           const url = `https://ipfs.infura.io/ipfs/${added.path}`
//           setFileUrl(url)
//         } catch (error) {
//           console.log('Error uploading file: ', error)
//         }  
//     }

//     async function uploadToIPFS() {
//         const { name, description, price } = formInput
//         if (!name || !description || !price || !fileUrl) return
//         /* first, upload metadata to IPFS */
//         const data = JSON.stringify({
//           name, description, image: fileUrl
//         })
//         try {
//           const added = await client.add(data)
//           const url = `https://ipfs.infura.io/ipfs/${added.path}`
//           /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
//           return url
//         } catch (error) {
//           console.log('Error uploading file: ', error)
//         }  
//     }

//     async function listNFTForSale() {
//         const url = await uploadToIPFS()
//         const web3Modal = new Web3Modal()
//         const connection = await web3Modal.connect()
//         const provider = new ethers.providers.Web3Provider(connection)
//         const signer = provider.getSigner()
    
//         /* create the NFT */
//         const price = ethers.utils.parseUnits(formInput.price, 'ether')
//         let contract = new ethers.Contract(marketContractAddress, Contract.abi, signer)
//         let listingPrice = await contract.getListingPrice()
//         listingPrice = listingPrice.toString()
//         let transaction = await contract.createToken(url, price, { value: listingPrice })
//         await transaction.wait()
    
//         router.push('/')
//     }

//     return (
//         <div>
//             <div className="flex justify-center">
//                 <div className="w-1/2 flex flex-col pb-12">
//                     <input 
//                     placeholder="Asset Name"
//                     className="mt-8 border rounded p-4"
//                     onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
//                     />
//                     <textarea
//                     placeholder="Asset Description"
//                     className="mt-2 border rounded p-4"
//                     onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
//                     />
//                     <input
//                     placeholder="Asset Price in Eth"
//                     className="mt-2 border rounded p-4"
//                     onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
//                     />
//                     <input
//                     type="file"
//                     name="Asset"
//                     className="my-4"
//                     onChange={onChange}
//                     />
//                     {
//                     fileUrl && (
//                         <img className="rounded mt-4" width="350" src={fileUrl} />
//                     )
//                     }
//                     <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
//                     Create NFT
//                     </button>
//                 </div>
//                 </div>
//         </div>
//     )
// }