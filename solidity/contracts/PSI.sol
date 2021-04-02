//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.3;

import "./LinearBondingCurve.sol";

contract PSI is LinearBondingCurve {
    address public DEEP_GEMS_CONTRACT;

    constructor() LinearBondingCurve("PSI", "PSI", 10000000000) {}

    function initialize(address deepGemsContract) public {
        require(DEEP_GEMS_CONTRACT == address(0), "already initialized");
        DEEP_GEMS_CONTRACT = deepGemsContract;
    }

    // This calls the internal transfer function, bypassing the allowance
    // check when transferring psi to the deep gems contract.
    // It can only be called by the deep gems contract.
    function transferToDeepGems(address sender, uint256 amount) public {
        require(msg.sender == DEEP_GEMS_CONTRACT);
        _transfer(sender, DEEP_GEMS_CONTRACT, amount);
    }
}
