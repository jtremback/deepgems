//SPDX-License-Identifier: Unlicense
pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "hardhat/console.sol";

// Uses quadratic bonding curve integral formula from
// https://blog.relevant.community/how-to-make-bonding-curves-for-continuous-token-models-3784653f8b17
abstract contract QuadraticBondingCurve is ERC20 {
    using SafeMath for uint256;

    function pow3(uint256 base) internal pure returns (uint256) {
        return base.mul(base).mul(base);
    }

    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "ETH transfer failed");
    }

    function quoteMintRaw(uint256 _tokensToMint) public view returns (uint256) {
        uint256 psiSupply = totalSupply();

        // How much the pool's ether balance
        uint256 currentPoolBalance = pow3(psiSupply).div(3);

        // How much the pool's ether balance will be after
        uint256 newPoolBalance = pow3(psiSupply.add(_tokensToMint)).div(3);

        // How much it costs to increase the supply by _tokensToMint
        uint256 numEther = newPoolBalance.sub(currentPoolBalance);

        // Scale by precision^2 to cancel out exponentiation of precision
        return numEther.div(1 ether * 1 ether);
    }

    function quoteMint(uint256 _tokensToMint) public view returns (uint256) {
        // Scales the number by a constant to get to the level we want
        return quoteMintRaw(_tokensToMint).div(1000000);
    }

    function mint(uint256 _tokensToMint) public payable {
        // CHECKS

        uint256 numEther = quoteMint(_tokensToMint) + 1; // Plus one for good luck

        require(numEther <= msg.value, "Did not send enough Ether");

        // ACTIONS

        // Make tokens
        _mint(msg.sender, _tokensToMint);

        // Send dust back to caller
        safeTransferETH(msg.sender, msg.value.sub(numEther));
    }

    function quoteBurnRaw(uint256 _tokensToBurn) public view returns (uint256) {
        uint256 psiSupply = totalSupply();

        // How much the pool's ether balance
        uint256 currentPoolBalance = pow3(psiSupply).div(3);

        // How much the pool's ether balance will be after
        uint256 newPoolBalance = pow3(psiSupply.sub(_tokensToBurn)).div(3);

        // How much you get when you decrease the supply by _tokensToBurn
        uint256 numEther = currentPoolBalance.sub(newPoolBalance);

        // Scale by precision^2 to cancel out exponentiation of precision
        return numEther.div(1 ether * 1 ether);
    }

    function quoteBurn(uint256 _tokensToBurn) public view returns (uint256) {
        // Scales the number by a constant to get to the level we want
        return quoteBurnRaw(_tokensToBurn).div(1000000);
    }

    function burn(uint256 _tokensToBurn, uint256 _minEther) public payable {
        // CHECKS

        uint256 numEther = quoteBurn(_tokensToBurn);

        require(
            numEther >= _minEther,
            "Number of Ether returned would be lower than minEther"
        );

        // ACTIONS

        // Burn tokens
        _burn(msg.sender, _tokensToBurn);
        // Send proceeds to caller
        console.log(numEther);
        safeTransferETH(msg.sender, numEther);
    }
}
