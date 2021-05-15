import {generalService} from './general-service'


//contract address
const address = '0x0CD1Bc0f54F60F5E3d428B203a3EDb802196Ab21';
const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenAddr",
                "type": "address"
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
                "name": "decimal",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "tokenVesting",
                "type": "address"
            }
        ],
        "name": "CreateTokenVesting",
        "type": "event"
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
        "inputs": [
            {
                "internalType": "enum TokenVestingFactory.VestingType",
                "name": "vestingType",
                "type": "uint8"
            }
        ],
        "name": "beneficiaries",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
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
            },
            {
                "internalType": "enum TokenVestingFactory.VestingType",
                "name": "vestingType",
                "type": "uint8"
            }
        ],
        "name": "create",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "beneficiary",
                "type": "address"
            }
        ],
        "name": "tokenVesting",
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
                "internalType": "address",
                "name": "beneficiary",
                "type": "address"
            }
        ],
        "name": "vestingType",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let web3VestingContractFactory  = null;
async function init(){
    if(web3VestingContractFactory){
        return;
    }
    await generalService.init();
    let web3 = generalService.getWeb3();
    web3VestingContractFactory = new web3.eth.Contract(abi, address);
}

async function getBeneficiaries(beneficiariesType){
    await init();
    let beneficiaries = await web3VestingContractFactory.methods.beneficiaries(beneficiariesType).call();
    let retBeneficiaries = [];
    for(let idx = 0; idx < beneficiaries.length; ++idx){
        console.log(beneficiaries[idx]);
        if(beneficiaries[idx]){
            retBeneficiaries.push(beneficiaries[idx]);
        }
    }
    return retBeneficiaries;
}

async function create(beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType){
    await init();
    await web3VestingContractFactory.methods.create(beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType).call();
}

async function getOwner(){
    await init();
    let address = await web3VestingContractFactory.methods.owner().call();
    return address;
}

async function tokenVesting(beneficiary){
    await init();
    let address = await web3VestingContractFactory.methods.tokenVesting(beneficiary).call();
    return address;
}

async function transferOwnership(newOwner){
    await init();
    await web3VestingContractFactory.methods.transferOwnership(newOwner).call();
}

async function vestingType(address){
    await init();
    let vestingType = await web3VestingContractFactory.methods.vestingType(address).call();
    return vestingType;
}

export const vestingContractFactory = {
    create, getOwner, tokenVesting, getBeneficiaries, transferOwnership, vestingType
}
