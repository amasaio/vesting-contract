const path = require('path');
require('dotenv').config(path.resolve(__dirname, '../.env'));
console.log(path.resolve(__dirname, '../.env'))

const tokenVestingFactory = artifacts.require("TokenVestingFactory");
const multisig = artifacts.require("MultiSig");
const AmasaToken = artifacts.require("AmasaToken");


module.exports = function (deployer, network, accounts) {
	deployer.deploy(tokenVestingFactory, process.env.TOKEN_ADDRESS, process.env.VESTING_DECIMAL, [accounts[0]], 1);
	// deployer.deploy(multisig, [accounts[0]], 1);
	// deployer.deploy(AmasaToken);
};
