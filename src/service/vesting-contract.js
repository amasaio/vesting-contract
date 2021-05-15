import {generalService} from './general-service'


//contract address
const address = '0x0CD1Bc0f54F60F5E3d428B203a3EDb802196Ab21';
const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "release",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenAddr",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "beneficiary",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "start",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cliff",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "duration",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "interval",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "initialShare",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "periodicShare",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "decimal",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "revocable",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "revoke",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "contractAddr",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tm",
                "type": "uint256"
            }
        ],
        "name": "TokenVestingInitialized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "contractAddr",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "TokenVestingRevoked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "contractAddr",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "TokensReleased",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "start",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cliff",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "initialShare",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "periodicShare",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "revocable",
                "type": "bool"
            }
        ],
        "name": "update",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "beneficiary",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "cliff",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "duration",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "end",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "releasable",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "released",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "revocable",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "revoked",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "start",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "status",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "total",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "vested",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let web3VestingContract  = null;
async function init(){
    if(web3VestingContract){
        return;
    }
    await generalService.init();
    let web3 = generalService.getWeb3();
    web3VestingContract = new web3.eth.Contract(abi, address);
}
//================================ Methods of VestingContract ======================================
async function initialize(from, amount){
    await init();
    await web3VestingContract.methods.initialize(from, amount).call();
}

async function renounceOwnership(){
    await init();
    await web3VestingContract.methods.renounceOwnership().call();
}

async function revoke(){
    await init();
    await web3VestingContract.methods.revoke().call();
}

async function transferOwnership(newOwner){
    await init();
    await web3VestingContract.methods.transferOwnership(newOwner).call();
}

async function getOwner(){
    await init();
    let address = await web3VestingContract.methods.owner().call();
    return address;
}

async function update(start, cliff, initialShare, periodicShare, revocable){
    await init();
    await update.methods.update(start, cliff, initialShare, periodicShare, revocable).call();
}

async function release(){
    await init();
    await web3VestingContract.methods.release().call();
}

async function getBeneficiary(){
    await init();
    let address = await web3VestingContract.methods.beneficiary().call();
    return address;
}

async function getCliff(){
    await init();
    let cliff = await web3VestingContract.methods.cliff().call();
    return cliff;
}

async function getDuration(){
    await init();
    let duration = await web3VestingContract.methods.duration().call();
    return duration;
}

async function getEnd(){
    await init();
    let end = await web3VestingContract.methods.end().call();
    return end;
}


async function getReleasable(){
    await init();
    let releasable = await web3VestingContract.methods.releasable().call();
    return releasable;
}

async function getReleased(){
    await init();
    let released = await web3VestingContract.methods.released().call();
    return released;
}

async function isRevocable(){
    await init();
    let revocable = await web3VestingContract.methods.revocable().call();
    return revocable;
}

async function isRevoked(){
    await init();
    let revoked = await web3VestingContract.methods.revoked().call();
    return revoked;
}

async function getStart(){
    await init();
    let start = await web3VestingContract.methods.start().call();
    return start;
}

async function getStatus(){
    await init();
    let status = await web3VestingContract.methods.status().call();
    return status;
}

async function getTotal(){
    await init();
    let total = await web3VestingContract.methods.total().call();
    return total;
}

async function getVested(){
    await init();
    let vested = await web3VestingContract.methods.vested().call();
    return vested;
}

export const vestingContract = {
    initialize, renounceOwnership, revoke, transferOwnership, getOwner, update, release, getBeneficiary, getCliff,
    getDuration, getEnd, getReleasable, getReleased, isRevocable, isRevoked, getStart, getStatus, getTotal, getVested
}
