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

    await psi.mint(pe(`10`), { value: pe(`10`), gasPrice: 0 });

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

  // it("See if gems keep the same index", async function () {
  //   const signers = await ethers.getSigners();
  //   const DeepGemsContract = await ethers.getContractFactory("DeepGems");
  //   const gems = (await DeepGemsContract.deploy()) as DeepGems;
  //   const PSIContract = await ethers.getContractFactory("PSI");
  //   const psi = (await PSIContract.deploy(gems.address)) as PSI;
  //   await gems.initialize(psi.address);

  //   // Mint psi for both signer 0 and 1
  //   await psi.mint(pe(`10`), { value: pe(`10`), gasPrice: 0 });
  //   await psi
  //     .connect(signers[1])
  //     .mint(pe(`10`), { value: pe(`10`), gasPrice: 0 });

  //   // Mine one gem
  //   await gems.mineGem(pe("1"));

  //   // Mine another (with a different account since only one gem can be mined per block per account)
  //   await gems.connect(signers[1]).mineGem(pe("1"));

  //   // Look up gem at index
  //   const gemId1 = await gems.tokenByIndex(0);
  //   console.log("gemid 1", gemId1);

  //   // Burn gem
  //   await gems.burnGem(gemId1);

  //   // Look up gem at index 0 again
  //   const gemId2 = await gems.tokenByIndex(0);

  //   // Is different gem.
  //   console.log("gemid 2", gemId2);
  // });
});
