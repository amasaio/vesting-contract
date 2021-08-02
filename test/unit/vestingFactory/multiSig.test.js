/* eslint-env mocha */
/* global artifacts, contract, web3, it, beforeEach, assert */
var assert = require('assert');


var BN = web3.utils.BN;
const tokenVestingFactory = artifacts.require('TokenVestingFactory')
const tokenVesting = artifacts.require("TokenVesting");
const multisig = artifacts.require("multisig");
const amasaToken = artifacts.require('AmasaToken')
const truffleAssert = require('truffle-assertions')


contract('Token Vesting Factory test', async accounts => {

    let _owner
    let _zeroAddress
    let _amasaToken
    let _multiSig
    let _multiSigAddress
    let _tokenVestingAddress
    let _tokenVesting
    let _tokenVestingFactory


    beforeEach('init contracts for each test', async function() {
        _owner = accounts[0]
        _zeroAddress = '0x0000000000000000000000000000000000000000'
        _amasaToken = await amasaToken.new(
            {
                from: _owner
            }
        )
        _tokenVestingFactory = await tokenVestingFactory.new(
            _amasaToken.address, 18,[_owner], 1,
            {
                from: _owner
            }
        )
        _multiSigAddress = await _tokenVestingFactory.getMultisigAddress();
        _multiSig = await multisig.at(_multiSigAddress);

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
        let encode = await _multiSig.contract.methods.addSigner(accounts[1], 2).encodeABI();
        await _multiSig.approveHashAndExecute(
            _multiSigAddress,0, encode,
            {
                from: _owner
            }
        )

        assert.equal(await _tokenVesting.isRevoked(), false)

        encode = await _tokenVestingFactory.contract.methods.revoke(_tokenVestingAddress).encodeABI();
        await truffleAssert.fails(
            _multiSig.approveHashAndExecute(
                _tokenVestingFactory.address,0, encode,
                {
                    from: _owner
                }
            ),
            truffleAssert.ErrorType.REVERT);

        assert.equal(await _tokenVesting.isRevoked(), false)

        _multiSig.approveHash(
            _tokenVestingFactory.address,0, encode,
            {
                from: _owner
            }
        )

        assert.equal(await _tokenVesting.isRevoked(), false)

        await _multiSig.approveHashAndExecute(
            _tokenVestingFactory.address,0, encode,
            {
                from: accounts[1]
            }
        )
        assert.equal(await _tokenVesting.isRevoked(), true)

    })

    it('change signer', async () => {

        assert.equal(await _multiSig.existSigner(_owner), true);
        assert.equal(await _multiSig.existSigner(accounts[1]), false);


        let encode = await _multiSig.contract.methods.changeSigner(_owner, accounts[1]).encodeABI();
        await _multiSig.approveHashAndExecute(
            _multiSigAddress,0, encode,
            {
                from: _owner
            }
        )

        assert.equal(await _multiSig.existSigner(_owner), false);
        assert.equal(await _multiSig.existSigner(accounts[1]), true);


    })

    it('Add/Remove signers', async () => {
        let encode = await _multiSig.contract.methods.addSigner(accounts[1], 2).encodeABI();
        await _multiSig.approveHashAndExecute(
            _multiSigAddress,0, encode,
            {
                from: _owner
            }
        )

        let signers = await _multiSig.getSigners();
        assert.equal(signers.length, 2)
////////////////////////////////////////////
        encode = await _multiSig.contract.methods.removeSigner(accounts[1], 1).encodeABI();
        await _multiSig.approveHash(
            _multiSigAddress,0, encode,
            {
                from: _owner
            }
        )

        signers = await _multiSig.getSigners();
        assert.equal(signers.length, 2)

        await _multiSig.approveHashAndExecute(
            _multiSigAddress,0, encode,
            {
                from: accounts[1]
            }
        )

        signers = await _multiSig.getSigners();
        assert.equal(signers.length, 1)

    })

    it('cancel in progress transaction', async () => {
        let encode = await _multiSig.contract.methods.addSigner(accounts[1], 2).encodeABI();
        await _multiSig.approveHashAndExecute(
            _multiSigAddress,0, encode,
            {
                from: _owner
            }
        )

        assert.equal(await _tokenVesting.isRevoked(), false)

        _multiSig.approveHash(
            _tokenVestingFactory.address,0, encode,
            {
                from: _owner
            }
        )

        assert.equal(await _tokenVesting.isRevoked(), false)
///////////////////////////////////////////////////
        //it should cancel in progress transaction
        const nonce = await _multiSig.getNonce();
        encode = '0x0';
        await _multiSig.approveHash(
            _multiSigAddress,0, encode,
            {
                from: accounts[1]
            }
        )
        await _multiSig.approveHashAndExecute(
            _multiSigAddress,0, encode,
            {
                from: _owner
            }
        )

        assert.equal(parseInt(nonce)+1 , await _multiSig.getNonce());
///////////////////////////////////////////////////
        await truffleAssert.fails(
        _multiSig.approveHashAndExecute(
            _tokenVestingFactory.address,0, encode,
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

})