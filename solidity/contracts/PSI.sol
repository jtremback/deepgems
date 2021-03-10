//SPDX-License-Identifier: Unlicense
pragma solidity 0.7.6;

import "./QuadraticBondingCurve.sol";

contract PSI is QuadraticBondingCurve {
    address state_deepGemsContract;

    constructor(address deepGemsAddress) ERC20("PSI", "PSI") {
        state_deepGemsContract = deepGemsAddress;
    }

    // This calls the internal transfer function, bypassing the allowance
    // check when transferring psi to the deep gems contract.
    // It can only be called by the deep gems contract.
    function transferToDeepGems(address sender, uint256 amount) public {
        require(msg.sender == state_deepGemsContract);
        _transfer(sender, state_deepGemsContract, amount);
    }
}
