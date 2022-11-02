import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useMoralis } from "react-moralis";
import { useEffect, useState } from 'react';
import { BannerStrip } from '@web3uikit/core';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

export default function Home() {

  const { chainId, account, isWeb3Enabled } = useMoralis()

  return (
    <div className="body">
      {account === null ? (
        <Alert status='error'>
          <AlertIcon />
          <AlertTitle>Wallet not connected</AlertTitle>
          <AlertDescription>Please connect your wallet to our application ;)!</AlertDescription>
        </Alert>
      ) : (
        <p>Welcome !</p>
      )}
    </div>
  );
}
