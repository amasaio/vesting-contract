// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";



contract MultiSig {
    string public constant VERSION = "1.3.0";

    event setupEvent(address[] signers, uint256 threshold);
    event ApproveHash(bytes32 indexed approvedHash, address indexed owner);
    event ExecutionFailure(bytes32 txHash);
    event ExecutionSuccess(bytes32 txHash);
    event signerAddEvent(address signer);
    event signerRemoveEvent(address signer);
    event signerChangedEvent(address oldSigner, address newSigner);
    event thresholdEvent(uint256 threshold);
    event eventAlreadySigned(address indexed signed);


    // Mapping to keep track of all hashes (message or transaction) that have been approved by ANY owners
    address[] private _signers;
    mapping(address => mapping(bytes32 => uint256)) public approvedHashes;

    uint256 internal _threshold;
    uint256 public _nonce;

    constructor (address[] memory signers, uint256 threshold) {

        require(threshold <= signers.length, "MultiSig: Can not set neededSigners count bigger than signers length!");
        require(threshold >= 1, "MultiSig: Can not set neededSigners count lower than 1!");

        for (uint256 i = 0; i < signers.length; i++) {
            address signer = signers[i];
            require(!existSigner(signer), "MultiSig: signer exists");
            require(signer != address(0), "MultiSig: signer you want to add is ZERO_ADDRESS");
            require(signer != address(this), "MultiSig: Sender can not be own contract");

            _signers.push(signer);
        }

        _threshold = threshold;
        emit setupEvent(signers, threshold);
    }

    /// @dev Allows to execute a Safe transaction confirmed by required number of owners and then pays the account that submitted the transaction.
    ///      Note: The fees are always transferred, even if the user transaction fails.
    /// @param to Destination address of Safe transaction.
    /// @param value Ether value of Safe transaction.
    /// @param data Data payload of Safe transaction.
    function execTransaction(
        address to,
        uint256 value,
        bytes calldata data
    ) public payable virtual returns (bool success) {
        bytes32 txHash;
        // Use scope here to limit variable lifetime and prevent `stack too deep` errors
        {
            bytes memory txHashData =
            encodeTransactionData(
            // Transaction info
                to,
                value,
                data,
                _nonce
            );
            // Increase nonce and execute transaction.
            _nonce++;
            txHash = keccak256(txHashData);
            checkSignatures(txHash);
        }
        // Use scope here to limit variable lifetime and prevent `stack too deep` errors
        {
            // If the gasPrice is 0 we assume that nearly all available gas can be used (it is always more than safeTxGas)
            // We only substract 2500 (compared to the 3000 before) to ensure that the amount passed is still higher than safeTxGas
            success = execute(to, value, data);
            if (success) emit ExecutionSuccess(txHash);
            else emit ExecutionFailure(txHash);
        }
    }

    function getNonce() public view returns (uint256){
        return _nonce;
    }


    function execute(
        address to,
        uint256 value,
        bytes memory data
    ) internal returns (bool success) {
        uint256 gasToCall = gasleft()-2500;
        emit thresholdEvent(gasToCall);
        assembly {
            success := call(gasToCall, to, value, add(data, 0x20), mload(data), 0, 0)
        }
    }

    /**
     * @dev Checks whether the signature provided is valid for the provided data, hash. Will revert otherwise.
     * @param dataHash Hash of the data (could be either a message hash or transaction hash)
     */
    function checkSignatures(bytes32 dataHash) public view {
        // Load threshold to avoid multiple storage loads
        uint256 threshold = _threshold;
        // Check that a threshold is set
        require(threshold > 0, "Not enough signers is defined");
        address[] memory alreadySigned = getSignersOfHash(dataHash);

        require(alreadySigned.length >= threshold, "signed count are not enough! needs ");
        // + threshold + " but got " + alreadySigned.length);
    }

    function getSignersOfHash(bytes32 hash) public view returns (address[] memory) {
        uint256 j = 0;
        address[] memory doneSignersTemp = new address[](_signers.length);

        uint256 i;
        for (i = 0; i < _signers.length; i++) {
            address currentSigner = _signers[i];
            if (approvedHashes[currentSigner][hash] == 1) {
                doneSignersTemp[j] = currentSigner;
                j++;
            }
        }
        address[] memory doneSigners = new address[](j);
        for (i=0; i<j; i++){
            doneSigners[i] = doneSignersTemp[i];
        }
        return doneSigners;
    }

    /**
     * @dev Marks a hash as approved. This can be used to validate a hash that is used by a signature.
    /// @param to Destination address.
    /// @param value Ether value.
    /// @param data Data payload.
     */
    function approveHash(address to,
        uint256 value,
        bytes calldata data) public {
        require(existSigner(msg.sender), "You are not one of the signers");
        bytes32 hashToApprove = getTransactionHash(to, value, data, _nonce);

        approvedHashes[msg.sender][hashToApprove] = 1;
        emit ApproveHash(hashToApprove, msg.sender);
    }



    /// @dev Returns the bytes that are hashed to be signed by owners.
    /// @param to Destination address.
    /// @param value Ether value.
    /// @param data Data payload.
    /// @param nonce Transaction nonce.
    function encodeTransactionData(
        address to,
        uint256 value,
        bytes calldata data,
        uint256 nonce
    ) public pure returns (bytes memory) {
        bytes32 safeTxHash =
        keccak256(
            abi.encode(
                to,
                value,
                keccak256(data),
                nonce
            )
        );
        return abi.encodePacked(bytes1(0x19), bytes1(0x01), safeTxHash);
    }

    /// @dev Returns hash to be signed by owners.
    /// @param to Destination address.
    /// @param value Ether value.
    /// @param data Data payload.
    function getTransactionHash(
        address to,
        uint256 value,
        bytes calldata data,
        uint256 nonce
    ) public pure returns (bytes32) {
        return keccak256(encodeTransactionData(to, value, data, nonce));
    }

    function existSigner(address signer) public view returns (bool) {
        for (uint256 i = 0; i < _signers.length; i++) {
            address signerI = _signers[i];
            if (signerI == signer) {
                return true;
            }
        }
        return false;
    }

    function getSigners() public view returns (address[] memory ) {
        address[] memory ret = new address[](_signers.length) ;
        for (uint256 i = 0; i < _signers.length; i++) {
            ret[i] = _signers[i];
        }
        return ret;
    }

    function setThreshold(uint256 threshold) public {
        require(msg.sender == address(this), "MultiSig: Sender should only be own contract");
        require(threshold <= _signers.length, "MultiSig: Can not set neededSigners count bigger than signers length!");
        require(_threshold >= 1, "MultiSig: Can not set neededSigners count lower than 1!");
        _threshold = threshold;
        emit thresholdEvent(threshold);
    }

    function addSigner(address signer, uint256 threshold) public {
        require(msg.sender == address(this), "MultiSig: Sender should only be own contract");
        require(!existSigner(signer), "MultiSig: signer exists");
        require(signer != address(0), "MultiSig: signer you want to add is ZERO_ADDRESS");
        require(signer != address(this), "MultiSig: Sender can not be own contract");
        _signers.push(signer);
        emit signerAddEvent(signer);
        setThreshold(threshold);
    }

    function removeSigner(address signer, uint256 threshold) public {
        require(msg.sender == address(this), "MultiSig: Sender should only be own contract");
        require(existSigner(signer), "MultiSig: signer is not exists");
        require(_signers.length - 1 >= 1, "MultiSig: can not remove last signer");
        require(_signers.length - 1 >= threshold, "MultiSig: threshold can not be greater then signers count");
        require(signer != address(0), "MultiSig: signer you want to remove is ZERO_ADDRESS");


        uint256 i = 0;
        for (; i < _signers.length; i++) {
            if (_signers[i] == signer) {
                break;
            }
        }
        for (; i < _signers.length-1; i++) {
            _signers[i] = _signers[i+1];
        }
        _signers.pop();
        emit signerRemoveEvent(signer);
        setThreshold(threshold);
    }

    function changeSigner(address oldSigner, address newSigner) public {
        require(msg.sender == address(this), "MultiSig: Sender should only be own contract");
        require(existSigner(oldSigner), "MultiSig: signer is not exists");
        require(!existSigner(newSigner), "MultiSig: signer is exists");
        require(newSigner != address(0), "MultiSig: signer you want to add is ZERO_ADDRESS");
        require(newSigner != address(this), "MultiSig: Sender can not be own contract");
        uint256 i = 0;
        for (; i < _signers.length; i++) {
            if (_signers[i] == oldSigner) {
                _signers[i] = newSigner;
                break;
            }
        }

        emit signerChangedEvent(oldSigner, newSigner);
    }

}