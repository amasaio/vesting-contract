<h1 align="center">Amasa Vesting Contract</h1>

> Smart contract for Amasa token vesting. 

**Table of Contents**

- [Installation](#-installation)
- [Usage](#-usage)
- [Quickstart](#-quickstart)
- [Network Deployments](#-network-deployments)
- [Local Development](#-local-development)
- [Testing](#-testing)
- [License](#-license)

## Installation

For quick installation of the contract `ABIs`:

## Usage


## Quickstart


## Network Deployments

You can deploy the contract locally, to Rinkeby, or to Ethereum mainnet.

#### Deploy Locally (Ganache)

* In a separate terminal, start the testnet: `ganache-cli`
* In your main terminal, run: `truffle migrate --network development`

#### Deploy to Remote (e.g. Rinkeby)

* In your main terminal, run: `truffle migrate --network Rinkeby`


## Local Development

For local development of `vesting contract`, set up the development environment on your machine as follows.

As a prerequisite, you need:

- Node.js v12+
- npm

Clone the project and install all dependencies:

```bash
git clone https://github.com/amasaio/vesting-contract.git
cd vesting-contract/

# install packages
npm i

# to compile contracts
truffle compile
```

## Testing

In a separate console:
```console
ganache-cli
```

In main console:
```bash
# for unit tests


# for test coverage

```

## 🏛 License

```
Copyright 2021 Amasa

```
