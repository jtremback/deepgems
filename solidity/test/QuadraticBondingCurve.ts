import { expect } from "chai";
import { readFileSync } from "fs";
import { ethers, network } from "hardhat";
import { Signer, BigNumber, BigNumberish } from "ethers";
import { PSI } from "../typechain/PSI";
import { DeepGems } from "../typechain/DeepGems";

const ETHER_PRICE = 1700;

const fe = ethers.utils.formatEther;
const pe = ethers.utils.parseEther;

function pe$(dollars: number) {
  return pe(`${dollars / ETHER_PRICE}`);
}

function etherToDollars(n: BigNumberish) {
  return Number(fe(n)) * ETHER_PRICE;
}

const curve = {
  100: {
    marketCap: "0.000000166666666667",
    costToMintOneMore: "0.000000005050166667",
  },
  1000: {
    marketCap: "0.000166666666666668",
    costToMintOneMore: "0.000000500500166667",
  },
  10000: {
    marketCap: "0.166666666666666669",
    costToMintOneMore: "0.000050005000166667",
  },
  20000: {
    marketCap: "1.333333333333333336",
    costToMintOneMore: "0.000200010000166667",
  },
  30000: {
    marketCap: "4.500000000000000003",
    costToMintOneMore: "0.000450015000166667",
  },
  50000: {
    marketCap: "20.833333333333333337",
    costToMintOneMore: "0.001250025000166667",
  },
  200000: {
    marketCap: "1333.333333333333333338",
    costToMintOneMore: "0.020000100000166667",
  },
  1000000: {
    marketCap: "166,666.666666667000000000",
    costToMintOneMore: "0.500000500032000000",
  },
  2000000: {
    marketCap: "1,333,333.333333330000000000",
    costToMintOneMore: "2.000000999936000000",
  },
};

describe("Psi", function () {
  beforeEach(async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [],
    });
  });

  it("mints tokens on correct curve", async function () {
    this.timeout(0);
    const signers = await ethers.getSigners();
    const DeepGemsContract = await ethers.getContractFactory("DeepGems");
    const gems = (await DeepGemsContract.deploy()) as DeepGems;
    const PSIContract = await ethers.getContractFactory("PSI");
    const psi = (await PSIContract.deploy(gems.address)) as PSI;

    async function mint(num: number, value: number) {
      let startingBalance = await psi.provider.getBalance(signers[0].address);

      await psi.mint(pe(`${num}`), { value: pe(`${value}`), gasPrice: 0 });

      let newBalance = await psi.provider.getBalance(signers[0].address);

      let ethIn = startingBalance.sub(newBalance);

      return ethIn;
    }

    const marketCap = async () =>
      fe(await psi.provider.getBalance(psi.address));

    const signerBalance = async () =>
      fe(await psi.balanceOf(signers[0].address));

    // Only works with whole tokenNumber
    async function mintCycle({
      additionalMint,
      tokenNumber,
    }: {
      additionalMint: number;
      tokenNumber: number;
    }) {
      // We mint to get up to the desired level, and also check that quoteMint
      // matches mint
      const additionalMintQuote = fe(
        await psi.quoteMint(pe(`${additionalMint}`))
      );

      console.log(
        `Minting ${additionalMint} tokens at ${tokenNumber} total will cost ${additionalMintQuote}`
      );

      expect(fe(await mint(additionalMint, 9000))).to.equal(
        additionalMintQuote
      );

      // We check the eth market cap
      expect(await marketCap()).to.equal(curve[tokenNumber].marketCap);

      // Check the psi balance of the signer
      expect(await signerBalance()).to.equal(`${tokenNumber}.0`);

      // Check the cost to mint one more
      expect(fe(await psi.quoteMint(pe("1")))).to.equal(
        curve[tokenNumber].costToMintOneMore
      );
    }

    // ------------------

    await mintCycle({ additionalMint: 100, tokenNumber: 100 });

    // Going up to 1,000
    await mintCycle({ additionalMint: 900, tokenNumber: 1000 });

    // Going up to 10,000
    await mintCycle({ additionalMint: 9000, tokenNumber: 10000 });

    // Going up to 20,000
    await mintCycle({ additionalMint: 10000, tokenNumber: 20000 });

    // Going up to 30,000
    await mintCycle({ additionalMint: 10000, tokenNumber: 30000 });

    // Going up to 50,000
    await mintCycle({ additionalMint: 20000, tokenNumber: 50000 });

    // Going up to 200,000
    await mintCycle({ additionalMint: 150000, tokenNumber: 200000 });

    // // Going up to 1,000,000
    // await mintCycle({ additionalMint: 800000, tokenNumber: 1000000 });

    // // Going up to 2,000,000
    // await mintCycle({ additionalMint: 1000000, tokenNumber: 2000000 });
  });

  it("exploit numerical instability", async function () {
    this.timeout(0);
    const signers = await ethers.getSigners();
    const DeepGemsContract = await ethers.getContractFactory("DeepGems");
    const gems = (await DeepGemsContract.deploy()) as DeepGems;
    const PSIContract = await ethers.getContractFactory("PSI");
    const psi = (await PSIContract.deploy(gems.address)) as PSI;

    const marketCap = async () =>
      fe(await psi.provider.getBalance(psi.address));

    const signerBalance = async () =>
      fe(await psi.balanceOf(signers[0].address));

    await psi.mint(pe(`100`), { value: pe(`10`), gasPrice: 0 });

    for (let i = 0; i < 40; i++) {
      const toMint = 1;
      const cycles = 10;

      let toBurn = 0;
      for (let i = 0; i < cycles; i++) {
        await psi.mint(pe(`${toMint}`), { value: pe(`10`), gasPrice: 0 });
        toBurn = toBurn + toMint;
      }

      console.log(await signerBalance(), await marketCap());
      await psi.burn(pe(`${toBurn}`), pe(`0`), { gasPrice: 0 });
    }
  });
});
