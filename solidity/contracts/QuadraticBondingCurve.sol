//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Uses quadratic bonding curve integral formula from
// https://blog.relevant.community/how-to-make-bonding-curves-for-continuous-token-models-3784653f8b17
abstract contract QuadraticBondingCurve is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 scaling
    ) ERC20(name, symbol) {
        SCALING = scaling;
    }

    uint256 private SCALING;

    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "ETH transfer failed");
    }

    function quoteBuyRaw(uint256 tokensToBuy, uint256 currentPsiSupply)
        public
        view
        returns (uint256)
    {
        uint256 newPsiSupply = currentPsiSupply + tokensToBuy;

        // How much is the pool's ether balance
        uint256 currentPoolBalance =
            (currentPsiSupply * currentPsiSupply * currentPsiSupply) / 3;
        // How much the pool's ether balance will be after minting
        uint256 newPoolBalance =
            (newPsiSupply * newPsiSupply * newPsiSupply) / 3;

        // How much it costs to increase the supply by tokensToBuy
        uint256 numEther = newPoolBalance - currentPoolBalance;

        // Scale by 1e18 (ether precision) to cancel out exponentiation
        // Scales the number by a constant to get to the level we want
        // We add one wei to absorb rounding error
        return ((numEther / (1 ether * 1 ether)) / SCALING) + 1;
    }

    function quoteBuy(uint256 tokensToBuy) public view returns (uint256) {
        return quoteBuyRaw(tokensToBuy, totalSupply());
    }

    function buy(uint256 tokensToBuy) public payable {
        // CHECKS

        uint256 numEther = quoteBuy(tokensToBuy);

        require(numEther <= msg.value, "Did not send enough Ether");

        // ACTIONS

        // Make tokens
        _mint(msg.sender, tokensToBuy);

        // Send dust back to caller
        safeTransferETH(msg.sender, msg.value - numEther);
    }

    function quoteSellRaw(uint256 tokensToSell) public view returns (uint256) {
        uint256 currentPsiSupply = totalSupply();
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
        return numEther / (1 ether * 1 ether);
    }

    function quoteSell(uint256 tokensToSell) public view returns (uint256) {
        // Scales the number by a constant to get to the level we want
        return quoteSellRaw(tokensToSell) / SCALING;
    }

    function sell(uint256 tokensToSell, uint256 minEther) public payable {
        // CHECKS

        uint256 numEther = quoteSell(tokensToSell);

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
