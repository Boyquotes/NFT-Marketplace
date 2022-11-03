import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { Heading } from '@chakra-ui/react'
import Link from 'next/link'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <div className="header">
        <Heading as='h3' size='lg'>
          <Link href="/">
            BEN BK Marketplace
          </Link>
        </Heading>
        <ul className="header__menu">
          <li>
            <Link href="/mynfts">My NFTs</Link>
          </li>
          <li>
            <Link href="/create-nft">Create a NFT</Link>
          </li>
          <li>
            <Link href="/sellnft">Sell a NFT</Link>
          </li>
        </ul>
      </div>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
