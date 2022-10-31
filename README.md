# NFT Marketplace

Rename .env.example to .env and put your private key, the rpc url and your etherscan API key.

## Scripts 

```
yarn hardhat deploy 
```

Deploy on local network


```
yarn hardhat deploy --network goerli
```

Deploy on goerli network and verify automaticaly the smart contract


```
yarn hardhat test
```

Run all the tests 


```
yarn hardhat coverage
```

Check the coverage of the tests