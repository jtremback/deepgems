//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

// Uses quadratic bonding curve integral formula from
// https://blog.relevant.community/how-to-make-bonding-curves-for-continuous-token-models-3784653f8b17
abstract contract QuadraticBondingCurve is ERC20 {
    uint256 private SCALING = 2000000000000;

    function pow3(uint256 base) internal pure returns (uint256) {
        return base * base * base;
    }

    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "ETH transfer failed");
    }

    function quoteMintRaw(uint256 tokensToMint) public view returns (uint256) {
        uint256 psiSupply = totalSupply();

        // How much is the pool's ether balance
        uint256 currentPoolBalance = pow3(psiSupply) / 3;

        // How much the pool's ether balance will be after minting
        uint256 newPoolBalance = pow3(psiSupply + tokensToMint) / 3;

        // How much it costs to increase the supply by tokensToMint
        uint256 numEther = newPoolBalance - currentPoolBalance;

        // Scale by 1e18^2 (ether precision) to cancel out exponentiation of 1e18
        return numEther / 1e36;
    }

    function quoteMint(uint256 tokensToMint) public view returns (uint256) {
        // Scales the number by a constant to get to the level we want
        // We add one wei to absorb rounding error
        return (quoteMintRaw(tokensToMint) / SCALING) + 1;
    }

    function mint(uint256 tokensToMint) public payable {
        // CHECKS

        uint256 numEther = quoteMint(tokensToMint);

        require(numEther <= msg.value, "Did not send enough Ether");

        // ACTIONS

        // Make tokens
        _mint(msg.sender, tokensToMint);

        // Send dust back to caller
        safeTransferETH(msg.sender, msg.value - numEther);
    }

    function quoteBurnRaw(uint256 tokensToBurn) public view returns (uint256) {
        uint256 psiSupply = totalSupply();

        // How much the pool's ether balance
        uint256 currentPoolBalance = pow3(psiSupply) / 3;

        // How much the pool's ether balance will be after
        uint256 newPoolBalance = pow3(psiSupply - tokensToBurn) / 3;

        // How much you get when you decrease the supply by tokensToBurn
        uint256 numEther = currentPoolBalance - newPoolBalance;

        // Scale by 1e18^2 (ether precision) to cancel out exponentiation of 1e18
        return numEther / 1e36;
    }

    function quoteBurn(uint256 tokensToBurn) public view returns (uint256) {
        // Scales the number by a constant to get to the level we want
        return quoteBurnRaw(tokensToBurn) / SCALING;
    }

    function burn(uint256 tokensToBurn, uint256 _minEther) public payable {
        // CHECKS

        uint256 numEther = quoteBurn(tokensToBurn);

        require(
            numEther >= _minEther,
            "Number of Ether returned would be lower than minEther"
        );

        // ACTIONS

        // Burn tokens
        _burn(msg.sender, tokensToBurn);

        // Send proceeds to caller
        safeTransferETH(msg.sender, numEther);
    }
}
