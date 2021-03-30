//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.3;

import "./LinearBondingCurve.sol";

contract PSI is LinearBondingCurve {
    constructor() LinearBondingCurve("PSI", "PSI", 2000000000000) {}
}
