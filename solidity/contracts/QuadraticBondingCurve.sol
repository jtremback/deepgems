//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.3;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

// import "hardhat/console.sol";

// Uses quadratic bonding curve integral formula from
// https://blog.relevant.community/how-to-make-bonding-curves-for-continuous-token-models-3784653f8b17
abstract contract QuadraticBondingCurve is ERC20Burnable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 scaling,
        uint256 supplyCap,
        uint256 priceCliff
    ) ERC20(name, symbol) {
        SCALING = scaling;
        SUPPLY_CAP = supplyCap;
        // Mint total supply to the contract address
        _mint(address(this), supplyCap);
        PRICE_CLIFF = priceCliff;
        // Calculate price cliff
        PRICE_CLIFF_BALANCE = (PRICE_CLIFF * PRICE_CLIFF * PRICE_CLIFF) / 3;
    }

    uint256 public SUPPLY_CAP;
    // Price switches from 0 to the curve price at this supply level
    uint256 public PRICE_CLIFF;
    // Area under the curve before the price cliff
    uint256 private PRICE_CLIFF_BALANCE;
    uint256 private SCALING;

    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "ETH transfer failed");
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }

    function absorbingSub(uint256 a, uint256 b)
        internal
        pure
        returns (uint256)
    {
        return a >= b ? a - b : 0;
    }

    function quoteBuyRaw(uint256 tokensToBuy, uint256 currentPsiBought)
        public
        view
        returns (uint256)
    {
        uint256 newPsiBought = currentPsiBought + tokensToBuy;

        // How much is the pool's ether balance
        uint256 currentPoolBalance =
            (currentPsiBought * currentPsiBought * currentPsiBought) / 3;

        // How much the pool's ether balance will be after buying
        uint256 newPoolBalance =
            (newPsiBought * newPsiBought * newPsiBought) / 3;

        // How much it costs to increase the supply by tokensToBuy
        uint256 numEther =
            absorbingSub(
                newPoolBalance,
                max(currentPoolBalance, PRICE_CLIFF_BALANCE)
            );

        // Scale by 1e18 (ether precision) to cancel out exponentiation
        // Scales the number by a constant to get to the level we want
        // We add one wei to absorb rounding error
        return ((numEther / (1 ether * 1 ether)) / SCALING) + 1;
    }

    // This function gives us the total number of tokens that are not
    // owned by the contract
    function totalBought() public view returns (uint256) {
       return SUPPLY_CAP - balanceOf(address(this));
    }

    function quoteBuy(uint256 tokensToBuy) public view returns (uint256) {
        return quoteBuyRaw(tokensToBuy, totalBought());
    }

    function buy(uint256 tokensToBuy) public payable {
        // CHECKS
        uint256 currentPsiBought = totalBought();

        require(
            currentPsiBought + tokensToBuy <= SUPPLY_CAP,
            "Supply cap exceeded, no more tokens can be bought from the curve."
        );

        uint256 numEther = quoteBuyRaw(tokensToBuy, currentPsiBought);

        require(numEther <= msg.value, "Did not send enough Ether");

        // ACTIONS

        // Give bought tokens to buyer
        _transfer(address(this), msg.sender, tokensToBuy);

        // Send dust back to caller
        safeTransferETH(msg.sender, msg.value - numEther);
    }

    function quoteSellRaw(uint256 tokensToSell, uint256 currentPsiBought)
        public
        view
        returns (uint256)
    {
        uint256 newPsiBought = currentPsiBought - tokensToSell;

        // How much the pool's ether balance
        uint256 currentPoolBalance =
            (currentPsiBought * currentPsiBought * currentPsiBought) / 3;

        // How much the pool's ether balance will be after
        uint256 newPoolBalance =
            (newPsiBought * newPsiBought * newPsiBought) / 3;

        // How much you get when you decrease the supply by tokensToSell
        uint256 numEther =
            absorbingSub(
                currentPoolBalance,
                max(newPoolBalance, PRICE_CLIFF_BALANCE)
            );

        // Scale by 1e18 (ether precision) to cancel out exponentiation
        // Scales the number by a constant to get to the level we want
        return ((numEther / (1 ether * 1 ether)) / SCALING);
    }

    function quoteSell(uint256 tokensToSell) public view returns (uint256) {
        return quoteSellRaw(tokensToSell, totalBought());
    }

    function sell(uint256 tokensToSell, uint256 minEther) public payable {
        // CHECKS

        uint256 numEther = quoteSell(tokensToSell);

        require(
            numEther >= minEther,
            "Number of Ether received would be lower than minEther"
        );

        // ACTIONS

        // Take sold tokens from seller
        _transfer(msg.sender, address(this), tokensToSell);

        // Send proceeds to caller
        safeTransferETH(msg.sender, numEther);
    }
}
