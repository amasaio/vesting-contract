/* eslint-env mocha */
/* global artifacts, contract, web3, it, beforeEach, assert */
var assert = require('assert');


var BN = web3.utils.BN;
const tokenVestingFactory = artifacts.require('TokenVestingFactory')
const tokenVesting = artifacts.require("TokenVesting");
const amasaToken = artifacts.require('AmasaToken')
const truffleAssert = require('truffle-assertions')


contract('Token Vesting Factory test', async accounts => {

    let _owner
    let _zeroAddress
    let _amasaToken
    let _tokenVestingAddress
    let _tokenVesting
    let _tokenVestingFactory


    beforeEach('init contracts for each test', async function () {
        _owner = accounts[0]
        _zeroAddress = '0x0000000000000000000000000000000000000000'
        _amasaToken = await amasaToken.new(
            {
                from: _owner
            }
        )
        _tokenVestingFactory = await tokenVestingFactory.new(
            _amasaToken.address, 18, [accounts[0]], 1,
            {
                from: _owner
            }
        )

        beneficiary = accounts[1]
        start = 1621541323
        cliff = 423490
        initialShare = "12500000000000000000"
        periodicShare = "300000000000000000"
        revocable = true
        vestingType = 1

        await _tokenVestingFactory.create(
            beneficiary, start, cliff, initialShare, periodicShare, revocable, vestingType,
            {
                from: _owner
            }
        )

        _tokenVestingAddress = await _tokenVestingFactory.getTokenVesting(beneficiary)
        _tokenVesting = await tokenVesting.at(_tokenVestingAddress)

    })

    it('With Two signer, on first revoke call it should not revoke the vesting contract, after second one, should be revoked', async () => {
        let encode = await _tokenVestingFactory.contract.methods.addSigner(accounts[1], 2).encodeABI();
        await _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )
        await _tokenVestingFactory.execTransaction(
             0, encode,
            {
                from: _owner
            }
        )

        assert.equal(await _tokenVesting.isRevoked(), false)

        encode = await _tokenVestingFactory.contract.methods.revoke(_tokenVestingAddress).encodeABI();
        _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )
        await truffleAssert.fails(
            _tokenVestingFactory.execTransaction(
                 0, encode,
                {
                    from: _owner
                }
            ),
            truffleAssert.ErrorType.REVERT);

        assert.equal(await _tokenVesting.isRevoked(), false)

        _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )

        assert.equal(await _tokenVesting.isRevoked(), false)

        await _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: accounts[1]
            }
        )
        await _tokenVestingFactory.execTransaction(
             0, encode,
            {
                from: accounts[1]
            }
        )
        assert.equal(await _tokenVesting.isRevoked(), true)

    })

    it('change signer', async () => {

        assert.equal(await _tokenVestingFactory.existSigner(_owner), true);
        assert.equal(await _tokenVestingFactory.existSigner(accounts[2]), false);


        let encode = await _tokenVestingFactory.contract.methods.changeSigner(_owner, accounts[2]).encodeABI();
        await _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )
        await _tokenVestingFactory.execTransaction(
             0, encode,
            {
                from: _owner
            }
        )

        assert.equal(await _tokenVestingFactory.existSigner(_owner), false);
        assert.equal(await _tokenVestingFactory.existSigner(accounts[2]), true);


    })


    it('Add/Remove signers', async () => {
        let encode = await _tokenVestingFactory.contract.methods.addSigner(accounts[1], 1).encodeABI();
        await _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )
        await _tokenVestingFactory.execTransaction(
             0, encode,
            {
                from: _owner
            }
        )

        let signers = await _tokenVestingFactory.getSigners();
        assert.equal(signers.length, 2)

        encode = await _tokenVestingFactory.contract.methods.addSigner(accounts[2], 1).encodeABI();
        await _tokenVestingFactory.approveHash(
            0, encode,
            {
                from: _owner
            }
        )
        await _tokenVestingFactory.execTransaction(
            0, encode,
            {
                from: _owner
            }
        )

        signers = await _tokenVestingFactory.getSigners();
        assert.equal(signers.length, 3)
////////////////////////////////////////////
        encode = await _tokenVestingFactory.contract.methods.removeSigner(accounts[1], 1).encodeABI();
        await _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )

        await _tokenVestingFactory.execTransaction(
             0, encode,
            {
                from: accounts[1]
            }
        )

        signers = await _tokenVestingFactory.getSigners();
        assert.equal(signers.length, 2);
        assert.equal(await _tokenVestingFactory.existSigner(accounts[1]), false);
        assert.equal(await _tokenVestingFactory.existSigner(accounts[2]), true);


    })

    it('cancel in progress transaction', async () => {
        let encode = await _tokenVestingFactory.contract.methods.addSigner(accounts[1], 2).encodeABI();
        await _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )

        await _tokenVestingFactory.execTransaction(
             0, encode,
            {
                from: _owner
            }
        )

        let signers = await _tokenVestingFactory.getSigners();
        assert.equal(signers.length, 2)


        assert.equal(await _tokenVesting.isRevoked(), false)

        _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )

        assert.equal(await _tokenVesting.isRevoked(), false)
///////////////////////////////////////////////////
        //it should cancel in progress transaction
        const nonce = await _tokenVestingFactory.getNonce();
        encode = '0x0';
        await _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: accounts[1]
            }
        )
        await _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )

        await _tokenVestingFactory.execTransaction(
             0, encode,
            {
                from: _owner
            }
        )

        assert.equal(parseInt(nonce) + 1, await _tokenVestingFactory.getNonce());
///////////////////////////////////////////////////
        _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: accounts[1]
            }
        )
        await truffleAssert.fails(
            _tokenVestingFactory.execTransaction(
                 0, encode,
                {
                    from: accounts[1]
                }
            ),
            truffleAssert.ErrorType.REVERT);
        assert.equal(await _tokenVesting.isRevoked(), false)

    })

    it('cancel in progress transaction', async () => {

        await truffleAssert.fails(
            _tokenVestingFactory.revoke(_tokenVestingAddress,
                {
                    from: accounts[1]
                }
            ),
            truffleAssert.ErrorType.REVERT);
        assert.equal(await _tokenVesting.isRevoked(), false)

    })

    it('Test AddSigner', async () => {
        let encode = await _tokenVestingFactory.contract.methods.addSigner(accounts[1], 2).encodeABI();
        await _tokenVestingFactory.approveHash(
             0, encode,
            {
                from: _owner
            }
        )

        await _tokenVestingFactory.execTransaction(
             0, encode,
            {
                from: _owner
            }
        )

        signers = await _tokenVestingFactory.getSigners();
        assert.equal(signers.length, 2)
    })

    it('Test sign revoke method', async () => {
        encode = await _tokenVestingFactory.contract.methods.revoke(_tokenVestingAddress).encodeABI();
        await _tokenVestingFactory.approveHash(
            0, encode,
            {
                from: _owner
            }
        )
        await _tokenVestingFactory.execTransaction(
            0, encode,
            {
                from: _owner
            }
        )
        assert.equal(await _tokenVesting.isRevoked(), true);

    })
})
