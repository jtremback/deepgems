import { expect } from "chai";
import { readFileSync } from "fs";
import { ethers, network } from "hardhat";
import { Signer, BigNumber, BigNumberish } from "ethers";
import { PSI } from "../typechain/PSI";
import { DeepGems } from "../typechain/DeepGems";

const fe = ethers.utils.formatEther;
const pe = ethers.utils.parseEther;

describe("Deep gems NFT functionality", function () {
  beforeEach(async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [],
    });
  });

  it("concats", async function () {
    const signers = await ethers.getSigners();
    const DeepGemsContract = await ethers.getContractFactory("DeepGems");
    const gems = (await DeepGemsContract.deploy()) as DeepGems;

    const concatted = await gems.concat(12, 13);

    console.log(concatted.toHexString());

    const [a, b] = await gems.deconcat(concatted);

    console.log(a.toString(), b.toString());
  });

  it.only("gas test", async function () {
    const signers = await ethers.getSigners();
    const DeepGemsContract = await ethers.getContractFactory("DeepGems");
    const gems = (await DeepGemsContract.deploy()) as DeepGems;
    const PSIContract = await ethers.getContractFactory("PSI");
    const psi = (await PSIContract.deploy(gems.address)) as PSI;
    await gems.initialize(psi.address);

    await psi.mint(pe(`100`), { value: pe(`100`), gasPrice: 0 });

    await psi.approve(gems.address, pe(`100`));

    // forge one gem
    await gems.forge(pe("100"));

    // const events = await gems.queryFilter({
    //   address: gems.address,
    //   topics: [
    //     "0x7ad4b12ff4ce0fdd55b19da97f85fc9a091971912adda4a8bba51626c4cd5469",
    //   ],
    // });

    // const tokenId = events[0].args._id;

    // console.log(events);

    // console.log("RETRIEVED", await gems.state_unactivatedGems(tokenId));

    // await gems.reforge(tokenId);
  });

  it("happy path", async function () {
    const signers = await ethers.getSigners();
    const DeepGemsContract = await ethers.getContractFactory("DeepGems");
    const gems = (await DeepGemsContract.deploy()) as DeepGems;
    const PSIContract = await ethers.getContractFactory("PSI");
    const psi = (await PSIContract.deploy(gems.address)) as PSI;
    await gems.initialize(psi.address);

    await psi.mint(pe(`200`), { value: pe(`10`), gasPrice: 0 });

    // FORGE

    await gems.forge(pe("103"));

    // Takes money
    expect(fe(await psi.balanceOf(signers[0].address))).to.equal("97.0");

    // Not enough tokens
    expect(gems.forge(pe("100000"))).to.be.reverted;

    await gems.forge(pe("97.0"));

    let events = await gems.queryFilter({
      address: gems.address,
      topics: [
        "0x7ad4b12ff4ce0fdd55b19da97f85fc9a091971912adda4a8bba51626c4cd5469",
      ],
    });

    const forgedOwner = events[0].args.owner;
    const forgedTokenId = events[0].args.tokenId;
    const forgedTokenId2 = events[1].args.tokenId;

    expect(forgedOwner).to.equal(signers[0].address);

    const metadata = await gems.getGemMetadata(forgedTokenId);

    expect(metadata[4]).to.equal(103);

    console.log("METADATA", metadata);

    // REFORGE

    await gems.reforge(forgedTokenId);

    events = await gems.queryFilter({
      address: gems.address,
      topics: [
        "0x178d4bb17ec1a0b60cda63c27afeafa706c4f4fe9f1f9f3aba895836fd4b94c1",
      ],
    });

    const reforgedTokenId = events[0].args.newTokenId;

    // ACTIVATE

    await gems.activate(reforgedTokenId);

    // Doesn't exist
    expect(gems.activate(forgedTokenId)).to.be.reverted;

    // Already activated
    expect(gems.activate(reforgedTokenId)).to.be.reverted;

    // TRANSFER

    await gems.transferFrom(
      signers[0].address,
      signers[1].address,
      reforgedTokenId
    );

    events = await gems.queryFilter({
      address: gems.address,
      topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      ],
    });

    expect(events[0].args.tokenId).to.equal(reforgedTokenId);

    // BURN

    // Can't burn a gem you don't own
    expect(gems.burn(reforgedTokenId)).to.be.reverted;

    await gems.connect(signers[1]).burn(reforgedTokenId);

    // Already been burned
    expect(gems.connect(signers[1]).burn(reforgedTokenId)).to.be.reverted;

    // Should have gotten the money
    expect(fe(await psi.balanceOf(signers[1].address))).to.equal("103.0");

    // Burn unactivated gem

    await gems.burn(forgedTokenId2);

    expect(fe(await psi.balanceOf(signers[0].address))).to.equal("97.0");
  });

  it("emits the right events", async function () {
    const signers = await ethers.getSigners();
    const DeepGemsContract = await ethers.getContractFactory("DeepGems");
    const gems = (await DeepGemsContract.deploy()) as DeepGems;
    const PSIContract = await ethers.getContractFactory("PSI");
    const psi = (await PSIContract.deploy(gems.address)) as PSI;
    await gems.initialize(psi.address);

    await psi.mint(pe(`10`), { value: pe(`10`), gasPrice: 0 });

    // FORGE
    await gems.forge(pe("1"));

    let events = await gems.queryFilter({
      address: gems.address,
      topics: [
        "0x7ad4b12ff4ce0fdd55b19da97f85fc9a091971912adda4a8bba51626c4cd5469",
      ],
    });

    const forgedTokenId = events[0].args.tokenId;
    const forgedOwner = events[0].args.owner;

    console.log(forgedTokenId, forgedOwner);

    // REFORGE
    await gems.reforge(forgedTokenId);

    events = await gems.queryFilter({
      address: gems.address,
      topics: [
        "0x178d4bb17ec1a0b60cda63c27afeafa706c4f4fe9f1f9f3aba895836fd4b94c1",
      ],
    });

    const reforgedTokenId = events[0].args.tokenId;
    const reforgedOwner = events[0].args.owner;

    console.log("REFORGE", events);

    // ACTIVATE
    await gems.activate(forgedTokenId);

    events = await gems.queryFilter({
      address: gems.address,
      topics: [
        "0xcffdf6de62e8d9ae544ba4c36565fe4bcef3c1a96f174abbe6c56e25e2b220ed",
      ],
    });

    console.log("ACTIVATE", events);

    // BURN
    await gems.burn(forgedTokenId);

    events = await gems.queryFilter({
      address: gems.address,
      topics: [
        "0x696de425f79f4a40bc6d2122ca50507f0efbeabbff86a84871b7196ab8ea8df7",
      ],
    });

    console.log("BURN", events);
  });
});
