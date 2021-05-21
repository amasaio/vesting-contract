<h1 align="center">Amasa Vesting Contract</h1>

> Smart contract for Amasa token vesting. 

**Table of Contents**

- [Usage](#-usage)
- [Installation](#-installation)
- [Network Deployments](#-network-deployments)
- [Testing](#-testing)
- [License](#-license)


# Usage

This contract is used to create vesting table for Amasa token beneficiaries.


# Installation

Set up the development environment on your machine as follows.

As a prerequisite, you need:

- Node.js v12+
- npm

Clone the project and install all dependencies:

```bash
git clone https://github.com/amasaio/vesting-contract.git
cd vesting-contract/
```

## install truffle
```
npm i -g truffle
```


## install packages
```
npm i
```

## setup environment variables
In the root directory of the project create a file with name ```.env```. Then paste these parameters to the file and initialize them accordingly:

```
INFURA_TOKEN_MAINNET=<Token for connecting to Ethereum mainnet using infura provider>
INFURA_TOKEN_RINKEBY=<Token for connecting to Ethereum rinkeby using infura provider>
MNEMONIC=<Contract owner's mnemonic backup phrase>
VESTING_DECIMAL=<Precision of the numbers. 18 is recommended>
TOKEN_ADDRESS=<Amasa token address>
OWNER_ADDRESS=<Owner wallet address>
ETHERSCAN_API_KEY=<The Etherscan API Key which is used for publishing the source code on the Etherscan>
```

## to compile contracts
```
truffle compile
```



# Network Deployments

You can deploy the contract locally, to Rinkeby, or to Ethereum mainnet.

## Deploy Locally (Ganache)

* In a separate terminal, start the testnet: `ganache-cli`
* In your main terminal, run: `truffle migrate --network development`

## Deploy to Rinkeby

* In your main terminal, run: `truffle migrate --network rinkeby`

## Deploy to mainnet

* In your main terminal, run: `truffle migrate --network mainnet`


# Testing

In a separate console:
```console
ganache-cli
```

In main console:
```bash
# for unit tests
 truffle test --network development
```

# License

```
Copyright 2021 Amasa

```
