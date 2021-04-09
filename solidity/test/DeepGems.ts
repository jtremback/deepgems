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

async function getEvents(contract: Contract, topic: string) {
  return contract.queryFilter({
    address: contract.address,
    topics: [topic],
  });
}

async function initContracts() {
  const signers = await ethers.getSigners();

  const PSIContract = await ethers.getContractFactory("PSI");
  const psi = (await PSIContract.deploy()) as PSI;

  const DeepGemsContract = await ethers.getContractFactory("DeepGems");
  const gems = (await DeepGemsContract.deploy(
    psi.address,
    [signers[11].address, signers[12].address, signers[13].address],
    [94, 3, 3],
    "https://deepge.ms/tokenId/"
  )) as DeepGems;

  await psi.initialize(gems.address);

  // Would be very bad if you could initialize twice
  expect(psi.initialize(signers[0].address)).to.be.reverted;

  return { signers, gems, psi };
}

function takeCommission(x: BigNumber) {
  const commission = x.div(20);
  return [x.sub(commission), commission];
}

describe("Deep gems NFT functionality", function () {
  it.only("happy path", async function () {
    const { signers, gems, psi } = await initContracts();

    const gem1Input = 104;
    const gem2Input = 96;

    const gem1MetadataPsi = Math.floor(gem1Input * 0.95);
    const gem2MetadataPsi = Math.floor(gem2Input * 0.95);

    const [gem1Remaining1, gem1commission1] = takeCommission(
      pe(`${gem1Input}`)
    );
    const [gem1Remaining2, gem1commission2] = takeCommission(gem1Remaining1); // it gets reforged and so has a second 5% commission

    const [gem2Remaining, gem2commission] = takeCommission(pe(`${gem2Input}`));

    const totalCommission = gem1commission1
      .add(gem1commission2)
      .add(gem2commission);

    await psi.buy(pe(`200`), { value: pe(`10`), gasPrice: 0 });

    // Make sure that transferToDeepGems can only be called by deepgems
    expect(psi.transferToDeepGems(signers[0].address, pe("1"))).to.be.reverted;

    // FORGE

    await gems.forge(pe("104"));

    // Takes money
    expect(await psi.balanceOf(signers[0].address)).to.equal(
      pe(`${200 - gem1Input}`)
    );

    // Not enough tokens
    expect(gems.forge(pe("100000"))).to.be.reverted;

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
    console.log("gem 1 METADATA", metadata1);

    const metadata2 = await gems.getGemMetadata(forgedTokenId2);
    console.log("gem 2 METADATA", metadata2);

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
    expect(gems.activate(forgedTokenId1)).to.be.reverted;

    // Already activated
    expect(gems.activate(reforgedTokenId)).to.be.reverted;

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
    expect(gems.burn(reforgedTokenId)).to.be.reverted;

    await gems.connect(signers[1]).burn(reforgedTokenId);

    // Already been burned
    expect(gems.connect(signers[1]).burn(reforgedTokenId)).to.be.reverted;

    // Should have gotten the money
    expect(await psi.balanceOf(signers[1].address)).to.equal(
      gem1Remaining2,
      "shatner"
    );

    // Burn unactivated gem

    await gems.burn(forgedTokenId2);

    expect(await psi.balanceOf(signers[0].address)).to.equal(gem2Remaining);

    // ARTIST COMMISSION

    expect(
      (await gems.state_commissionCollected()).sub(
        await gems.state_commissionPaid()
      )
    ).to.equal(totalCommission);

    await gems.artistWithdraw();

    expect(await psi.balanceOf(signers[11].address)).to.equal(
      totalCommission.div(100).mul(94)
    );
    expect(await psi.balanceOf(signers[12].address)).to.equal(
      totalCommission.div(100).mul(3)
    );
    expect(await psi.balanceOf(signers[13].address)).to.equal(
      totalCommission.div(100).mul(3)
    );
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

  it.skip("generates the tokenId correctly", async function () {
    const { signers, gems, psi } = await initContracts();

    await psi.buy(pe(`100`), { value: pe(`10`), gasPrice: 0 });

    await psi.approve(gems.address, MAXUINT256);

    await gems.forge(pe("1"));
    await gems.forge(pe("1"));
    await gems.forge(pe("1"));
    await gems.forge(pe("1"));
    await gems.forge(pe("1"));
    await gems.forge(pe("1"));

    const events = await gems.queryFilter({
      address: gems.address,
      topics: [],
    });

    const event5BlocksAgo = events[0];
    const currentEvent = events[5];
    expect(event5BlocksAgo.blockNumber).to.equal(currentEvent.blockNumber - 5);

    const tokenId = currentEvent.args!.tokenId.toHexString();

    const blockHash5BlocksAgo = event5BlocksAgo.blockHash;
    const creatorAddress = signers[0].address;
    const psiInGem = takeCommission(pe("1"))[0]
      .toHexString()
      .slice(2)
      .padStart(32, "0");

    const expectedTokenId =
      "0x" +
      creatorAddress.toLowerCase().slice(-16) +
      blockHash5BlocksAgo.slice(-16) +
      psiInGem.slice(-64);

    expect(tokenId).to.equal(expectedTokenId);
  });
});
