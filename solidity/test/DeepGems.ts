import { expect } from "chai";
import { readFileSync } from "fs";
import { ethers, network } from "hardhat";
import { Signer, BigNumber, BigNumberish, Contract } from "ethers";
import { PSI } from "../typechain/PSI";
import { DeepGems } from "../typechain/DeepGems";

const MAXUINT256 = BigNumber.from(2).pow(256).sub(1);

const fe = ethers.utils.formatEther;
const pe = ethers.utils.parseEther;

async function resetChain() {
  await network.provider.request({
    method: "hardhat_reset",
    params: [],
  });
}

async function mineBlock() {
  await network.provider.request({
    method: "evm_mine",
    params: [],
  });
}

async function initContracts() {
  const signers = await ethers.getSigners();

  const PSIContract = await ethers.getContractFactory("PSI");
  const psi = (await PSIContract.deploy()) as PSI;

  const DeepGemsContract = await ethers.getContractFactory("DeepGems");
  const gems = (await DeepGemsContract.deploy(
    psi.address,
    "https://deepge.ms/tokenId/"
  )) as DeepGems;

  await psi.initialize(gems.address);

  // Would be very bad if you could initialize twice
  await expect(psi.initialize(signers[0].address)).to.be.revertedWith(
    "already initialized"
  );

  return { signers, gems, psi };
}

function takeCommission(x: BigNumber) {
  const commission = x.div(20);
  return [x.sub(commission), commission];
}

describe("Deep gems NFT functionality", function () {
  it("forges", async function () {
    const { signers, gems, psi } = await initContracts();

    for (let i = 0; i < 260; i++) {
      await mineBlock();
    }

    await psi.buy(pe(`200`), { value: pe(`10`), gasPrice: 0 });

    await gems.forge(pe("104"));

    await gems.forge(pe("96"));

    let events = (
      await gems.queryFilter({
        address: gems.address,
        topics: [],
      })
    ).filter((event) => event.event === "Forged");

    const forgedTokenId = events[0].args.tokenId;

    console.log(forgedTokenId.toHexString());
  });

  it("happy path", async function () {
    for (let i = 0; i < 260; i++) {
      await mineBlock();
    }

    const { signers, gems, psi } = await initContracts();

    const gem1Input = 104;
    const gem2Input = 96;

    const gem1MetadataPsi = gem1Input;
    const gem2MetadataPsi = gem2Input;

    const gem1Remaining1 = pe(`${gem1Input}`);

    function loseFivePercent(a: BigNumber) {
      return a.sub(a.div(20));
    }

    // it gets reforged and so loses 5%, then gets burned and loses another 5%
    const gem1Remaining2 = loseFivePercent(loseFivePercent(gem1Remaining1));

    const gem2Remaining = loseFivePercent(pe(`${gem2Input}`));

    await psi.buy(pe(`200`), { value: pe(`10`), gasPrice: 0 });

    // Make sure that transferToDeepGems can only be called by deepgems
    await expect(
      psi.transferToDeepGems(signers[0].address, pe("1"))
    ).to.be.revertedWith(
      "transferToDeepGems can only be called by the deep gems contract"
    );

    // FORGE

    await gems.forge(pe("104"));

    // Takes money
    expect(await psi.balanceOf(signers[0].address)).to.equal(
      pe(`${200 - gem1Input}`)
    );

    // Not enough tokens
    await expect(gems.forge(pe("100000"))).to.be.revertedWith(
      "ERC20: transfer amount exceeds balance"
    );

    await gems.forge(pe(`${gem2Input}`));

    let events = (
      await gems.queryFilter({
        address: gems.address,
        topics: [],
      })
    ).filter((event) => event.event === "Forged");

    // const forgedOwner = events[0].args.owner;
    const forgedTokenId1 = events[0].args.tokenId;
    const forgedTokenId2 = events[1].args.tokenId;

    // expect(forgedOwner).to.equal(signers[0].address);

    const metadata1 = await gems.getGemMetadata(forgedTokenId1);
    console.log("gem 1 METADATA", forgedTokenId1, metadata1);

    const metadata2 = await gems.getGemMetadata(forgedTokenId2);
    console.log("gem 2 METADATA", forgedTokenId2, metadata2);

    expect(metadata1[4]).to.equal(gem1MetadataPsi);
    expect(metadata2[4]).to.equal(gem2MetadataPsi);

    // REFORGE

    await gems.reforge(forgedTokenId1);

    events = (
      await gems.queryFilter({
        address: gems.address,
        topics: [],
      })
    ).filter((event) => event.event === "Reforged");

    const reforgedTokenId = events[0].args.newTokenId;

    // ACTIVATE

    await gems.activate(reforgedTokenId);

    // Doesn't exist
    await expect(gems.activate(forgedTokenId1)).to.be.revertedWith(
      "gem is already activated, you don't own it, or it does not exist"
    );

    // Already activated
    await expect(gems.activate(reforgedTokenId)).to.be.revertedWith(
      "gem is already activated, you don't own it, or it does not exist"
    );

    // TRANSFER

    await gems.transferFrom(
      signers[0].address,
      signers[1].address,
      reforgedTokenId
    );

    events = (
      await gems.queryFilter({
        address: gems.address,
        topics: [
          // "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        ],
      })
    ).filter((event) => event.event === "Transfer");

    expect(events[0].args.tokenId).to.equal(reforgedTokenId);

    // BURN

    // Can't burn a gem you don't own
    await expect(gems.burn(reforgedTokenId)).to.be.revertedWith(
      "this gem does not exist or you don't own it"
    );

    await gems.connect(signers[1]).burn(reforgedTokenId);

    // Already been burned
    await expect(
      gems.connect(signers[1]).burn(reforgedTokenId)
    ).to.be.revertedWith("this gem does not exist or you don't own it");

    // Should have gotten the money
    expect(await psi.balanceOf(signers[1].address)).to.equal(gem1Remaining2);

    // Burn unactivated gem

    await gems.burn(forgedTokenId2);

    expect(await psi.balanceOf(signers[0].address)).to.equal(gem2Remaining);
  });

  it("emits the right events", async function () {
    const { signers, gems, psi } = await initContracts();

    await psi.buy(pe(`10`), { value: pe(`10`), gasPrice: 0 });

    // FORGE
    await gems.forge(pe("1"));

    let events = await gems.queryFilter({
      address: gems.address,
    });
    events = events.filter((event) => event.event === "Forged");

    const forgedTokenId = events[0].args.tokenId;

    // REFORGE
    await gems.reforge(forgedTokenId);

    events = await gems.queryFilter({
      address: gems.address,
    });
    events = events.filter((event) => event.event === "Reforged");

    const oldTokenId = events[0].args.oldTokenId;
    const reforgedTokenId = events[0].args.newTokenId;

    console.log("REFORGE", events);

    expect(oldTokenId).to.equal(forgedTokenId);

    // ACTIVATE
    await gems.activate(reforgedTokenId);

    events = await gems.queryFilter({
      address: gems.address,
    });
    events = events.filter((event) => event.event === "Activated");

    const activatedTokenId = events[0].args.tokenId;

    console.log("ACTIVATE", events);

    expect(activatedTokenId).to.equal(reforgedTokenId);

    // BURN
    await gems.burn(reforgedTokenId);

    events = await gems.queryFilter({
      address: gems.address,
    });
    events = events.filter((event) => event.event === "Burned");

    const burnedTokenId = events[0].args.tokenId;

    console.log("BURN", events);

    expect(burnedTokenId).to.equal(reforgedTokenId);
  });

  it("generates the tokenId correctly", async function () {
    this.timeout(0);
    const { signers, gems, psi } = await initContracts();

    await psi.buy(pe(`1000`), { value: pe(`10`), gasPrice: 0 });

    for (let i = 0; i < 256; i++) {
      await gems.forge(pe("2"));
    }

    const events = await gems.queryFilter({
      address: gems.address,
      topics: [],
    });

    const minus1Hash = events[events.length - 2].blockHash;

    const minus255Hash = events[events.length - 256].blockHash;

    const blockhashEntropy = minus1Hash.slice(-1) + minus255Hash.slice(-2, -1);

    const tokenId = events[events.length - 1].args!.tokenId.toHexString();

    const psiInGem = pe("2").toHexString().slice(2).padStart(32, "0");

    const expectedTokenId =
      "0x" +
      // 256 to hex
      (256).toString(16) +
      blockhashEntropy +
      psiInGem.slice(-64);

    expect(BigNumber.from(tokenId)).to.equal(BigNumber.from(expectedTokenId));
  });
});
