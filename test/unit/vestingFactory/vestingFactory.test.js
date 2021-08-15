/* eslint-env mocha */
/* global artifacts, contract, web3, it, beforeEach, assert */
var assert = require('assert');


var BN = web3.utils.BN;
const tokenVestingFactory = artifacts.require('TokenVestingFactory')
const tokenVesting = artifacts.require("TokenVesting");
const amasaToken = artifacts.require('AmasaToken')
const truffleAssert = require('truffle-assertions')


contract('Token Vesting Factory test', async accounts => {

    let owner
    let zeroAddress
    let _amasaToken
    let _tokenVestingFactory

    beforeEach('init contracts for each test', async function() {
        owner = accounts[0]
        zeroAddress = '0x0000000000000000000000000000000000000000'
        _amasaToken = await amasaToken.new(
            {
                from: owner
            }
        )
        _tokenVestingFactory = await tokenVestingFactory.new(
            _amasaToken.address, 18,[owner, accounts[1]], 2,
            {
                from: owner
            }
        )                     
    })

    
    it('should fail on zero token address initialization', async () => {
        await truffleAssert.fails(tokenVestingFactory.new(zeroAddress, 18,[owner], 1,),
            truffleAssert.ErrorType.REVERT            
        )
    })


    it('should create a token vesting contract and check that it is not a zero address', async () => {        
        beneficiary = accounts[1]
        start = 1621541323
        cliff = 423490
        initialShare = "12500000000000000000"
        periodicShare = "300000000000000000"
        revocable = true
        vestingType = 1
        let result

        await truffleAssert.passes(                
            result = await _tokenVestingFactory.create(
                beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType,
                {
                    from: owner
                }
            )          
        )
        
        truffleAssert.eventEmitted(result, 'TokenVestingCreated', (ev) => {
            vestingAddress = ev.param1
            return vestingAddress !== zeroAddress
        })
    })

    
    it('should fail on creating a token vesting contract using none owner address', async () => {                
        attacker = accounts[1]
        beneficiary = accounts[1]
        start = 1621541323
        cliff = 423490
        initialShare = "12500000000000000000"
        periodicShare = "300000000000000000"
        revocable = true
        vestingType = 1
        let result

        await truffleAssert.fails(                
            _tokenVestingFactory.create(
                beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType,
                {
                    from: attacker
                }
            ),
            truffleAssert.ErrorType.REVERT            
        )
                
    })
    


    it('should fail on creating a token vesting contract for repeated beneficiary address', async () => {                
        beneficiary = accounts[1]
        start = 1621541323
        cliff = 423490
        initialShare = "12500000000000000000"
        periodicShare = "300000000000000000"
        revocable = true
        vestingType = 1
        let result

        await _tokenVestingFactory.create(
            beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType,
            {
                from: owner
            }
        )

        await truffleAssert.fails(                
            _tokenVestingFactory.create(
                beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType,
                {
                    from: owner
                }
            ),
            truffleAssert.ErrorType.REVERT            
        )
                        
    })
    

    it('The status should be initialized and the specified amount of token should be sent to the beneficiary contract', async () => {
        beneficiary = accounts[1]
        start = 1621541323
        cliff = 423490
        initialShare = "12500000000000000000"
        periodicShare = "300000000000000000"
        revocable = true
        vestingType = 1
        let result

        await _tokenVestingFactory.create(
            beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType,
            {
                from: owner
            }
        )
        
        amount = 1000
        tokenVestingAddress = await _tokenVestingFactory.getTokenVesting(beneficiary)
        await _amasaToken.approve(tokenVestingAddress, amount)
        await _tokenVestingFactory.initialize(tokenVestingAddress, owner, amount)
        
        _tokenVesting = await tokenVesting.at(tokenVestingAddress)        

        status = await _tokenVesting.getStatus()        
        assert.equal(status, 1)

        balance = await _amasaToken.balanceOf(tokenVestingAddress)
        assert.equal(balance, amount)

                        
    })

    it('should fail on updating a token vesting contract using none owner address', async () => {                
        attacker = accounts[1]
        beneficiary = accounts[1]
        start = 1621541323
        cliff = 423491
        initialShare = "12500000000000000000"
        periodicShare = "300000000000000000"
        revocable = true
        vestingType = 1
        let result

        await _tokenVestingFactory.create(
            beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType,
            {
                from: owner
            }
        )


        tokenVestingAddress = await _tokenVestingFactory.getTokenVesting(beneficiary)
        
        await truffleAssert.fails(                
            _tokenVestingFactory.update(
                tokenVestingAddress, start, cliff, initialShare, periodicShare, revocable,
                {
                    from: attacker
                }
            ),
            truffleAssert.ErrorType.REVERT            
        )

        
                
    })
    
    it('should update a token vesting contract using owner address', async () => {                
        beneficiary = accounts[1]
        start = 1621541323
        cliff = 423490
        initialShare = "12500000000000000000"
        periodicShare = "300000000000000000"
        revocable = true
        vestingType = 1
        let result

        await _tokenVestingFactory.create(
            beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType,
            {
                from: owner
            }
        )

        start = 1621541323491
        cliff = 423491
        initialShare = "13500000000000000000"
        periodicShare = "400000000000000000"
        revocable = false
        vestingType = 1

        tokenVestingAddress = await _tokenVestingFactory.getTokenVesting(beneficiary)
        
        await _tokenVestingFactory.update(
            tokenVestingAddress, start, cliff, initialShare, periodicShare, revocable,
            {
                from: owner
            }
        )

        _tokenVesting = await tokenVesting.at(tokenVestingAddress)

        details = await _tokenVesting.getDetails()
        
        assert.equal(start, details[3])
        assert.equal(start + cliff, details[4])
        assert.equal(initialShare, details[1])
        assert.equal(periodicShare, details[2])
        assert.equal(revocable, details[9])            
                                
    })

    
    it('should fail on revoking a token vesting contract using none owner address', async () => {                
        attacker = accounts[1]
        beneficiary = accounts[1]
        start = 1621541323
        cliff = 423491
        initialShare = "12500000000000000000"
        periodicShare = "300000000000000000"
        revocable = true
        vestingType = 1
        let result

        await _tokenVestingFactory.create(
            beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType,
            {
                from: owner
            }
        )


        tokenVestingAddress = await _tokenVestingFactory.getTokenVesting(beneficiary)
        

    })
    

    

})