// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/utils/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";


contract TokenVestingFactory is Ownable {

    event CreateTokenVesting(address tokenVesting);

    enum VestingType { SeedInvestors, StrategicInvestors, Advisors, Team, All }

    struct BeneficiaryIndex {
        address tokenVesting;
        VestingType vestingType;
        bool isExist;
        // uint256 index;
    }
    mapping(address => BeneficiaryIndex) private _beneficiaryIndex;
    address[] private _beneficiaries;
    address private _tokenAddr;
    uint256 private _interval;
    uint256 private _duration;
    uint256 private _decimal;
    
    constructor (address tokenAddr, uint256 duration, uint256 interval, uint256 decimal) {
      _tokenAddr = tokenAddr;
      _interval = interval * 24 * 60 * 60;
      _duration = duration * 24 * 60 * 60;
      _decimal = decimal;
    }    
    
    function create(address beneficiary, uint256 start, uint256 cliff, uint256 initialShare, uint256 periodicShare, bool revocable, VestingType vestingType) onlyOwner public {
        require(!_beneficiaryIndex[beneficiary].isExist, "TokenVestingFactory: benficiery exists");
        
        address tokenVesting = address(new TokenVesting(_tokenAddr, beneficiary, start, cliff, _duration, _interval, initialShare, periodicShare, _decimal, revocable));
        TokenVesting(tokenVesting).transferOwnership(msg.sender);
        
        _beneficiaries.push(beneficiary);
        _beneficiaryIndex[beneficiary].tokenVesting = tokenVesting;
        _beneficiaryIndex[beneficiary].vestingType = vestingType;
        _beneficiaryIndex[beneficiary].isExist = true;
        
        emit CreateTokenVesting(tokenVesting);
    }

    function beneficiaries(VestingType vestingType) public view returns(address[] memory) {
        uint256 j = 0;
        address[] memory beneficiaries = new address[](_beneficiaries.length);
        
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            address beneficiary = _beneficiaries[i];
            if ( _beneficiaryIndex[beneficiary].vestingType == vestingType || vestingType == VestingType.All ) {
                beneficiaries[j] = beneficiary;
                j++;
            }
        }
        return beneficiaries;
    }
    
    function vestingType(address beneficiary) public view returns(uint8) {
        require(_beneficiaryIndex[beneficiary].isExist, "TokenVestingFactory: benficiery does not exist");
        return uint8(_beneficiaryIndex[beneficiary].vestingType);
    }

    function tokenVesting(address beneficiary) public view returns(address) {
        require(_beneficiaryIndex[beneficiary].isExist, "TokenVestingFactory: benficiery does not exist");
        return _beneficiaryIndex[beneficiary].tokenVesting;
    }
}

/**
 * @title TokenVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
 * owner.
 */
contract TokenVesting is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  event TokensReleased(address contractAddr, uint256 amount);
  event TokenVestingRevoked(address contractAddr, uint256 amount);
  event TokenVestingInitialized(address contractAddr, uint256 tm);

  enum Status { NoInitialized, Initialized, Revoked }

  // beneficiary of tokens after they are released
  address private _beneficiary;

  uint256 private _cliff;
  uint256 private _start;
  uint256 private _end;
  uint256 private _duration;
  uint256 private _interval;
  address private _tokenAddr;
  uint256 private _initialShare;
  uint256 private _periodicShare;
  uint256 private _decimal;
  uint256 private _released;

  bool private _revocable;
  Status private _status;

  /**
   * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
   * beneficiary, gradually in a linear fashion until start + duration. By then all
   * of the balance will have vested.
   * @param beneficiary address of the beneficiary to whom vested tokens are transferred
   * @param cliff duration in seconds of the cliff in which tokens will begin to vest
   * @param start the time (as Unix time) at which point vesting starts
   * @param duration duration in seconds of the period in which the tokens will vest
   * @param revocable whether the vesting is revocable or not
   */
  constructor(
    address tokenAddr,
    address beneficiary,
    uint256 start,
    uint256 cliff,
    uint256 duration,
    uint256 interval,
    uint256 initialShare,
    uint256 periodicShare,
    uint256 decimal,
    bool revocable
    )
    
  {
    require(beneficiary != address(0), "TokenVesting: beneficiary address must not be zero");
    require(cliff <= duration, "TokenVesting: cliff must be less than duration");
    require(duration > 0, "TokenVesting: duration must be greater than zero");
    require(start.add(duration) > block.timestamp, "TokenVesting: end time must be greater than now");
    
    _tokenAddr = tokenAddr;
    _beneficiary = beneficiary;
    _revocable = revocable;
    _cliff = start.add(cliff);
    _start = start;
    _end = start.add(duration);
    _interval = interval;
    _duration = duration;
    _initialShare = initialShare;
    _periodicShare = periodicShare;
    _decimal = decimal;
    _status = Status.NoInitialized;
    
  }

  /**
   * @return the beneficiary of the tokens.
   */
  function beneficiary() public view returns(address) {
    return _beneficiary;
  }

  /**
   * @return the start time of the token vesting.
   */
  function start() public view returns(uint256) {
    return _start;
  }

  /**
   * @return the cliff time of the token vesting.
   */
  function cliff() public view returns(uint256) {
    return _cliff;
  }

  /**
   * @return the end time of the token vesting.
   */
  function end() public view returns(uint256) {
    return _end;
  }

  /**
   * @return the duration of the token vesting.
   */
  function duration() public view returns(uint256) {
    return _duration;
  }

  /**
   * @return the total amount of the token.
   */
  function total() public view returns(uint256) {
    return IERC20(_tokenAddr).balanceOf(address(this)).add(_released);
  }

  /**
   * @return the amount of the vested token.
   */
  function vested() public view returns(uint256) {
    return _vestedAmount();
  }

  /**
   * @return the amount of the token released.
   */
  function released() public view returns(uint256) {
    return _released;
  }

  /**
   * @return the amount that has already vested but hasn't been released yet.
   */
  function releasable() public view returns(uint256) {
    return _vestedAmount().sub(_released);
  }

  /**
   * @return true if the vesting is revocable.
   */
  function revocable() public view returns(bool) {
    return _revocable;
  }
  
  /**
   * @return true if the token is revoked.
   */
  function revoked() public view returns(bool) {
    if (_status == Status.Revoked) {
      return true;
    } else {
      return false;
    }
  }

   /**
   * @return status.
   */
  function status() public view returns(uint256) {
    return uint256(_status);
  }

  /**
   * @notice change status to initialized.
   */
  function initialize(address from, uint256 amount) public onlyOwner {

    require(_status == Status.NoInitialized, "TokenVesting: status must be NoInitialized");

      IERC20(_tokenAddr).safeTransferFrom(from, address(this), amount);
      _status = Status.Initialized;
      emit TokenVestingInitialized(address(this), block.timestamp);
    
  }

   /**
   * @notice update token vesting contract.
   */
  function update(
    uint256 start,
    uint256 cliff,
    uint256 initialShare,
    uint256 periodicShare,
    bool revocable

  ) public onlyOwner {

    require(_status == Status.NoInitialized, "TokenVesting: status must be NoInitialized");
    require(cliff <= _duration, "TokenVesting: cliff must be less than duration");
    require(start.add(_duration) > block.timestamp, "TokenVesting: end time must be greater than time.now()");
    
    _start = start;
    _cliff = start.add(cliff);
    _end = start.add(_duration);
    _initialShare = initialShare;
    _periodicShare = periodicShare;
    _revocable = revocable;

  }

  /**
   * @notice Transfers vested tokens to beneficiary.
   */
  function release() public {
    require(_status != Status.NoInitialized, "TokenVesting: status is NoInitialized");
    uint256 unreleased = releasable();

    require(unreleased > 0, "TokenVesting: releasable amount is zero");

    _released = _released.add(unreleased);

    IERC20(_tokenAddr).safeTransfer(_beneficiary, unreleased);

    emit TokensReleased(address(this), unreleased);
  }

  /**
   * @notice Allows the owner to revoke the vesting. Tokens already vested
   * remain in the contract, the rest are returned to the owner.
   */
  function revoke() public onlyOwner {
    require(_revocable, "TokenVesting: contract is not revocable");
    require(_status != Status.Revoked, "TokenVesting: status is Revoked");

    uint256 balance = IERC20(_tokenAddr).balanceOf(address(this));

    uint256 unreleased = releasable();
    uint256 refund = balance.sub(unreleased);

    _status = Status.Revoked;

    IERC20(_tokenAddr).safeTransfer(owner(), refund);

    emit TokenVestingRevoked(address(this), refund);
  }


  /**
   * @dev Calculates the amount that has already vested.
   */
  function _vestedAmount() private view returns (uint256) {
    uint256 currentBalance = IERC20(_tokenAddr).balanceOf(address(this));
    uint256 totalBalance = currentBalance.add(_released);
    uint256 cliffBalance = totalBalance.mul(_initialShare).div(10**_decimal).div(100);

    if (block.timestamp < _start) {
      return 0;
    } else if (block.timestamp < _cliff) {
      return cliffBalance;
    } else {
        uint256 intervalBalance = totalBalance.mul(_periodicShare).div(10**_decimal).div(100);
        uint256 intervalNumbers = (block.timestamp.sub(_cliff)).div(_interval);
        
        if (block.timestamp >= _end || _status == Status.Revoked || cliffBalance.add(intervalBalance.mul(intervalNumbers)) >= totalBalance) {
            return totalBalance;
        } else {
            return cliffBalance.add(intervalBalance.mul(intervalNumbers));
        }
    } 
  }
}