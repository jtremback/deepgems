//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// import "hardhat/console.sol";

// Uses quadratic bonding curve integral formula from
// https://blog.relevant.community/how-to-make-bonding-curves-for-continuous-token-models-3784653f8b17
abstract contract QuadraticBondingCurve is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 scaling,
        uint256 supplyCap,
        uint256 priceCliff
    ) ERC20(name, symbol) {
        SCALING = scaling;
        SUPPLY_CAP = supplyCap;
        PRICE_CLIFF = priceCliff;
    }

    uint256 public SUPPLY_CAP;
    uint256 public PRICE_CLIFF;
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

    function quoteBuyRaw(uint256 tokensToBuy, uint256 currentPsiSupply)
        public
        view
        returns (uint256)
    {
        // if (PRICE_CLIFF > currentPsiSupply) {
        //     currentPsiSupply = 0;
        // } else {
        //     currentPsiSupply = currentPsiSupply - PRICE_CLIFF;
        // }

        uint256 newPsiSupply = currentPsiSupply + tokensToBuy;
        // if (PRICE_CLIFF > newPsiSupply) {
        //     newPsiSupply = 0;
        // } else {
        //     newPsiSupply = newPsiSupply - PRICE_CLIFF;
        // }

        // Calculate price cliff
        uint256 priceCliffBalance =
            (PRICE_CLIFF * PRICE_CLIFF * PRICE_CLIFF) / 3;

        // How much is the pool's ether balance
        uint256 currentPoolBalance =
            (currentPsiSupply * currentPsiSupply * currentPsiSupply) / 3;
        // How much the pool's ether balance will be after minting
        uint256 newPoolBalance =
            (newPsiSupply * newPsiSupply * newPsiSupply) / 3;

        // How much it costs to increase the supply by tokensToBuy
        uint256 numEther =
            absorbingSub(
                newPoolBalance,
                max(currentPoolBalance, priceCliffBalance)
            );

        // Scale by 1e18 (ether precision) to cancel out exponentiation
        // Scales the number by a constant to get to the level we want
        // We add one wei to absorb rounding error
        return ((numEther / (1 ether * 1 ether)) / SCALING) + 1;
    }

    function quoteBuy(uint256 tokensToBuy) public view returns (uint256) {
        uint256 supply = totalSupply();
        return quoteBuyRaw(tokensToBuy, supply);
    }

    function buy(uint256 tokensToBuy) public payable {
        // CHECKS
        uint256 currentPsiSupply = totalSupply();

        require(
            currentPsiSupply + tokensToBuy <= SUPPLY_CAP,
            "Supply cap exceeded, no more tokens can be bought from the curve."
        );

        uint256 numEther = quoteBuyRaw(tokensToBuy, currentPsiSupply);

        require(numEther <= msg.value, "Did not send enough Ether");

        // ACTIONS

        // Make tokens
        _mint(msg.sender, tokensToBuy);

        // Send dust back to caller
        safeTransferETH(msg.sender, msg.value - numEther);
    }

    function quoteSellRaw(uint256 tokensToSell, uint256 currentPsiSupply)
        public
        view
        returns (uint256)
    {
        uint256 newPsiSupply = currentPsiSupply - tokensToSell;

        // How much the pool's ether balance
        uint256 currentPoolBalance =
            (currentPsiSupply * currentPsiSupply * currentPsiSupply) / 3;

        // How much the pool's ether balance will be after
        uint256 newPoolBalance =
            (newPsiSupply * newPsiSupply * newPsiSupply) / 3;

        // How much you get when you decrease the supply by tokensToSell
        uint256 numEther = currentPoolBalance - newPoolBalance;

        // Scale by 1e18 (ether precision) to cancel out exponentiation
        // Scales the number by a constant to get to the level we want
        return ((numEther / (1 ether * 1 ether)) / SCALING);
    }

    function quoteSell(uint256 tokensToSell) public view returns (uint256) {
        uint256 supply = totalSupply();
        return quoteSellRaw(tokensToSell, supply);
    }

    function sell(uint256 tokensToSell, uint256 minEther) public payable {
        // CHECKS

        uint256 numEther = quoteSellRaw(tokensToSell, totalSupply());

        require(
            numEther >= minEther,
            "Number of Ether received would be lower than minEther"
        );

        // ACTIONS

        // Burn tokens
        _burn(msg.sender, tokensToSell);

        // Send proceeds to caller
        safeTransferETH(msg.sender, numEther);
    }
}
