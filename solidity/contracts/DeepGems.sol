//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.3;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PSI.sol";

contract DeepGems is ERC721 {
    constructor(
        address psiContract,
        address[] memory artistAddresses,
        uint8[] memory artistPercentages,
        string memory baseURI
    ) ERC721("Deep Gems", "DEEP") {
        require(
            artistAddresses.length == artistPercentages.length,
            "malformed artist info"
        );

        // Check that artist percentages add up to 100
        uint8 totalPercentages = 0;
        for (uint64 i = 0; i < artistPercentages.length; i++) {
            totalPercentages = totalPercentages + artistPercentages[i];
        }
        require(
            totalPercentages == 100,
            "artist percentages must add up to 100"
        );

        PSI_CONTRACT = psiContract;
        ARTIST_ADDRESSES = artistAddresses;
        ARTIST_PERCENTAGES = artistPercentages;
        BASE_URI = baseURI;
    }

    address public PSI_CONTRACT;
    address[] public ARTIST_ADDRESSES;
    uint8[] public ARTIST_PERCENTAGES;
    string BASE_URI;

    uint256 public state_commissionCollected;
    uint256 public state_commissionPaid;
    mapping(uint256 => address) public state_unactivatedGems;
    bytes32 state_lastArtistWithdrawBlock;

    event Forged(uint256 indexed tokenId);
    event Reforged(uint256 indexed oldTokenId, uint256 indexed newTokenId);
    event Activated(uint256 indexed tokenId);
    event Burned(uint256 indexed tokenId);

    function packTokenId(uint128 a, uint128 b) internal pure returns (uint256) {
        return (uint256(a) << 128) | b;
    }

    function unpackTokenId(uint256 a) internal pure returns (uint128, uint128) {
        return (uint128(a >> 128), uint128(a));
    }

    function blockHashEntropy() internal view returns (uint8) {
        // We add in entropy from two blocks to make things more random. A miner who
        // finds blockhash(block.number - 1) will have increased their search space
        // for identical gems by 4 bits. A miner who finds blockhash(block.number - 255)
        // will have increased their search space by the same amount, but only if nobody else
        // forges a gem in the following 255 blocks, because that will throw off their calculations

        // We left shift a by 4, adding 4 zero bits onto the end.
        // Then we right shift b by 4, moving the first 4 bits to the end and making the rest 0.
        // Then we XOR them, effectively creating a byte with the last 4 bits of a and the first 4 bits of b
        // a << 4:  |11111111| -> |11110000|
        // b >> 4:  |11111111| -> |00001111|
        // a | b:                 |11111111|
        return
            (uint8(uint256(blockhash(block.number - 1))) << 4) |
            (uint8(uint256(blockhash(block.number - 255))) >> 4);
    }

    function packLatent(uint120 counter, uint8 blockhashEntropy)
        internal
        pure
        returns (uint128)
    {
        return (uint128(counter) << 8) | blockhashEntropy;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return BASE_URI;
    }

    function _forge(uint256 amountPsi)
        internal
        view
        returns (uint256, uint256)
    {
        // Calculate 5% artist commission
        uint256 commission = amountPsi / 20;
        uint256 psiInGem = amountPsi - commission;

        uint256 commissionCollected = state_commissionCollected + commission;

        // Generate id
        uint256 tokenId =
            packTokenId(
                packLatent(
                    // Dividing by 1e17 quantizes the payout to one decimal place.
                    // This mitigates attacks where someone could mine for a gem
                    // that looks identical to an existing gem, since the commissionCollected is
                    // used as an incrementing counter in the latent. Quantizing
                    // greatly reduces the search space to find an identical looking
                    // gem.
                    uint120(commissionCollected / 1e17),
                    blockHashEntropy()
                ),
                uint128(psiInGem)
            );

        // This error will be triggered if the amount of PSI that was used to forge
        // the gem was not enough to ensure that the quantized commission was
        // larger than 0, since in this case the commissionCollected will not be
        // incremented, and will have the same tokenId as the previous gem in the block.
        // The threshold amount is around 2 PSI with a 5% artist commission and
        // quantization to 1 decimal place, since (2 / 20) = 0.1
        require(
            state_unactivatedGems[tokenId] == address(0),
            "try forging with more PSI"
        );
        require(!_exists(tokenId), "try forging with more PSI");

        return (tokenId, commissionCollected);
    }

    function artistWithdraw() public {
        // Calculate pending payout
        uint256 pendingArtistPayout =
            state_commissionCollected - state_commissionPaid;
        // Calculate 1% of pending payout
        uint256 onePercentOfPayout = pendingArtistPayout / 100;
        // Zero out pending payout
        state_commissionPaid = state_commissionCollected;

        // Transfer coins out to artist addresses proportional to
        // their percentages
        for (uint64 i = 0; i < ARTIST_ADDRESSES.length; i++) {
            IERC20(PSI_CONTRACT).transfer(
                ARTIST_ADDRESSES[i],
                ARTIST_PERCENTAGES[i] * onePercentOfPayout
            );
        }
    }

    function forge(uint256 amountPsi) public returns (uint256) {
        // Transfer Psi to pay for gem
        PSI(PSI_CONTRACT).transferToDeepGems(msg.sender, amountPsi);

        (uint256 tokenId, uint256 commissionCollected) = _forge(amountPsi);

        // Add gem to unactivated gems mapping
        state_unactivatedGems[tokenId] = msg.sender;

        // Update artist's pending payout
        state_commissionCollected = commissionCollected;

        emit Forged(tokenId);

        return tokenId;
    }

    function reforge(uint256 oldTokenId) public returns (uint256) {
        require(
            state_unactivatedGems[oldTokenId] == msg.sender,
            "gem is already activated, you don't own it, or it does not exist"
        );

        delete state_unactivatedGems[oldTokenId];

        // pull the psi off the old token id by casting to uint128
        (uint256 newTokenId, uint256 commissionCollected) =
            _forge(uint128(oldTokenId));

        // Add gem to unactivated gems mapping
        state_unactivatedGems[newTokenId] = msg.sender;

        // Update artist's pending payout
        state_commissionCollected = commissionCollected;

        emit Reforged(oldTokenId, newTokenId);

        return newTokenId;
    }

    function activate(uint256 tokenId) public {
        require(
            state_unactivatedGems[tokenId] == msg.sender,
            "gem is already activated, you don't own it, or it does not exist"
        );

        delete state_unactivatedGems[tokenId];

        _mint(msg.sender, tokenId);
        emit Activated(tokenId);
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
        IERC20(PSI_CONTRACT).transfer(msg.sender, uint256(uint128(tokenId)));

        emit Burned(tokenId);
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
        (uint128 latent, uint128 psi) = unpackTokenId(tokenId);
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
