//SPDX-License-Identifier: Unlicense
pragma solidity 0.7.6;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./PSI.sol";

contract DeepGems is ERC721 {
    constructor() ERC721("Deep Gems", "DEEP") {}

    address state_psiContract;

    mapping(uint256 => address) public state_unactivatedGems;

    event Forged(address indexed owner, uint256 indexed tokenId);
    event Reforged(
        address indexed owner,
        uint256 indexed oldTokenId,
        uint256 indexed newTokenId
    );
    event Activated(address indexed owner, uint256 indexed tokenId);
    event Burned(address indexed owner, uint256 indexed tokenId);

    function uint128sToUint256(uint128 a, uint128 b)
        public
        pure
        returns (uint256)
    {
        return (uint256(a) << 128) | b;
    }

    function uint256ToUint128s(uint256 a)
        public
        pure
        returns (uint128, uint128)
    {
        return (uint128(a >> 128), uint128(a));
    }

    function packLatent(address addr, bytes32 blckhash)
        public
        pure
        returns (uint128)
    {
        return (uint128(addr) << 64) | uint64(uint256(blckhash));
    }

    function initialize(address psiContract) public {
        state_psiContract = psiContract;
    }

    function forge(uint256 amountPsi) public {
        // Transfer Psi to pay for gem
        PSI(state_psiContract).transferToDeepGems(msg.sender, amountPsi);

        uint256 id =
            uint128sToUint256(
                // Someone could set up a site where people can view the gem
                // they could forge in an upcoming block, and what it looks like at
                // different psi levels.
                // 5 blocks gives you about a minute to get your tx in.
                packLatent(msg.sender, blockhash(block.number - 5)),
                uint128(amountPsi)
            );

        state_unactivatedGems[id] = msg.sender;

        emit Forged(msg.sender, id);
    }

    function activate(uint256 tokenId) public {
        require(
            state_unactivatedGems[tokenId] == msg.sender,
            "either this gem is already activated, you don't own it, or it does not exist"
        );

        delete state_unactivatedGems[tokenId];

        _mint(msg.sender, tokenId);
        emit Activated(msg.sender, tokenId);
    }

    function reforge(uint256 oldTokenId) public {
        require(
            state_unactivatedGems[oldTokenId] == msg.sender,
            "either this gem is already activated, you don't own it, or it does not exist"
        );

        delete state_unactivatedGems[oldTokenId];

        uint256 newTokenId =
            uint128sToUint256(
                packLatent(msg.sender, blockhash(block.number)),
                uint128(oldTokenId)
            );

        state_unactivatedGems[newTokenId] = msg.sender;

        emit Reforged(msg.sender, oldTokenId, newTokenId);
    }

    function burn(uint256 tokenId) public {
        if (state_unactivatedGems[tokenId] == msg.sender) {
            // We are burning an unactivated gem
            delete state_unactivatedGems[tokenId];
        } else if (_exists(tokenId) && ownerOf(tokenId) == msg.sender) {
            // We are burning an activated gem
            _burn(tokenId);
        } else {
            revert("this gem does not exist or you don't own it");
        }

        // Casting tokenId to uint128 chops off the first 16 bytes,
        // leaving only the amount of psi the gem has.
        IERC20(state_psiContract).transfer(
            msg.sender,
            uint256(uint128(tokenId))
        );

        emit Burned(msg.sender, tokenId);
    }

    function getGemMetadata(uint256 tokenId)
        public
        pure
        returns (
            uint32,
            uint32,
            uint32,
            uint32,
            uint32
        )
    {
        (uint128 latent, uint128 psi) = uint256ToUint128s(tokenId);
        // We want 100 psi to correspond to an input of 1 into truncation_psi in the neural net,
        // and 103 psi to correspond to 1.03 truncation_psi, etc.
        // So we scale by 1e18, which results in e.g. 103 PSI = 103 (losing 18 decimal places).
        // Before putting it into the neural net, we will divide by 100, giving us a truncation_psi of 1.03 for this example.
        uint32 scaledPsi = uint32(psi / 1e18);

        // We will pass the uint128 latent into the gan as an array of 4 u32's. It's easiest format it here.
        // The psi goes on the end. Since we scaled it, it easily fits into a uint32.
        return (
            uint32(latent >> 96),
            uint32(latent >> 64),
            uint32(latent >> 32),
            uint32(latent),
            scaledPsi
        );
    }
}
