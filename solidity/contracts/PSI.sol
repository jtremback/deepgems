//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.3;

import "./QuadraticBondingCurve.sol";

// QuadraticBondingCurve("PSI", "PSI", 2e16, 5000000 ether, 1000000 ether) 18 cents at launch, 20% cut
// QuadraticBondingCurve("PSI", "PSI", 5e15, 2500000 ether, 250000 ether) 4 cents at launch, 10% cut, $10m market cap
// QuadraticBondingCurve("PSI", "PSI", 2e15, 2500000 ether, 250000 ether) 12 cents at launch, 10% cut, $25m market cap cap
// QuadraticBondingCurve("PSI", "PSI", 4e15, 2500000 ether, 250000 ether) 7 cents at launch, $12.8m market cap

contract PSI is QuadraticBondingCurve {
    address public DEEP_GEMS_CONTRACT;

    constructor()
        QuadraticBondingCurve("PSI", "PSI", 5e15, 2500000 ether, 250000 ether)
    {}

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
