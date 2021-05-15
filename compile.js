import path from 'path';
import fs from 'fs-extra';
import solc from 'solc';

let __dirname = path.resolve(path.dirname(''));

const contract1Path = path.resolve(__dirname, 'contracts', 'BokkyPooBahsDateTimeLibrary.sol');
const contract1Source = fs.readFileSync(contract1Path, 'utf8');
const input1 = {
    language: 'Solidity',
    sources: {
        'test.sol': {
            content: contract1Source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

 console.log(solc.compile(input1, 1));
/*

const contract2Path = path.resolve(__dirname, 'contracts', 'TokenVesting.sol');
const contract2Source = fs.readFileSync(contract2Path, 'utf8');
const input2 = {
    language: 'Solidity',
        sources: {
    'test.sol': {
        content: contract2Source
    }
},
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};
console.log(solc.compile(JSON.stringify(input2)));//.contracts[':Inbox'];
*/
