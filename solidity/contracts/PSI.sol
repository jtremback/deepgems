//SPDX-License-Identifier: Unlicense
pragma solidity 0.7.6;

import "./QuadraticBondingCurve.sol";

contract PSI is QuadraticBondingCurve {
    address state_deepGemsContract;

    constructor(address _deepGemsAddress) ERC20("PSI", "PSI") {
        state_deepGemsContract = _deepGemsAddress;
    }

    // This calls the internal transfer function, bypassing the allowance
    // check when transferring psi to the deep gems contract.
    // It can only be called by the deep gems contract..
    function transferToDeepGems(address _sender, uint256 _amount) public {
        require(msg.sender == state_deepGemsContract);
        _transfer(_sender, state_deepGemsContract, _amount);
    }
}
