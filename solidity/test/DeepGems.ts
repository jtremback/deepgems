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

  it("gas test", async function () {
    const signers = await ethers.getSigners();
    const DeepGemsContract = await ethers.getContractFactory("DeepGems");
    const gems = (await DeepGemsContract.deploy()) as DeepGems;
    const PSIContract = await ethers.getContractFactory("PSI");
    const psi = (await PSIContract.deploy(gems.address)) as PSI;
    await gems.initialize(psi.address);

    await psi.mint(pe(`10`), { value: pe(`100`), gasPrice: 0 });

    await network.provider.request({
      method: "evm_mine",
      params: [],
    });

    // forge one gem
    await gems.forge(pe("1"));

    const events = await gems.queryFilter({
      address: gems.address,
      topics: [
        "0x7ad4b12ff4ce0fdd55b19da97f85fc9a091971912adda4a8bba51626c4cd5469",
      ],
    });

    const tokenId = events[0].args._id;

    console.log(events);

    console.log("RETRIEVED", await gems.state_unactivatedGems(tokenId));

    await gems.reforge(tokenId);
  });

  it("forges a gem", async function () {
    const signers = await ethers.getSigners();
    const DeepGemsContract = await ethers.getContractFactory("DeepGems");
    const gems = (await DeepGemsContract.deploy()) as DeepGems;
    const PSIContract = await ethers.getContractFactory("PSI");
    const psi = (await PSIContract.deploy(gems.address)) as PSI;
    await gems.initialize(psi.address);

    await psi.mint(pe(`100`), { value: pe(`10`), gasPrice: 0 });

    // FORGE
    await gems.forge(pe("103"));

    let events = await gems.queryFilter({
      address: gems.address,
      topics: [
        "0x7ad4b12ff4ce0fdd55b19da97f85fc9a091971912adda4a8bba51626c4cd5469",
      ],
    });

    console.log(events);

    const forgedTokenId = events[0].args.tokenId;
    const forgedOwner = events[0].args.owner;

    console.log(forgedTokenId, forgedOwner);

    console.log("METADATA", await gems.getGemMetadata(forgedTokenId));
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
