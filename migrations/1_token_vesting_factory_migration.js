const path = require('path');
require('dotenv').config(path.resolve(__dirname, '../.env'));
console.log(path.resolve(__dirname, '../.env'))

const tokenVestingFactory = artifacts.require("TokenVestingFactory");


module.exports = function (deployer) {
	deployer.deploy(tokenVestingFactory, process.env.TOKEN_ADDRESS, process.env.VESTING_DECIMAL);
};
