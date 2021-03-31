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

function almostEqual(a: BigNumber, b: BigNumber, within: BigNumber) {
  return a.lt(b.add(within)) && a.gt(b.sub(within));
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

  return { signers, gems, psi };
}

const curve: {
  [key: number]: { marketCap: string; costToBuyOneMore: string };
} = {
  100: {
    marketCap: "0.000000166666666667",
    costToBuyOneMore: "0.000000005050166667",
  },
  1000: {
    marketCap: "0.000166666666666668",
    costToBuyOneMore: "0.000000500500166667",
  },
  10000: {
    marketCap: "0.166666666666666669",
    costToBuyOneMore: "0.000050005000166667",
  },
  20000: {
    marketCap: "1.333333333333333336",
    costToBuyOneMore: "0.000200010000166667",
  },
  30000: {
    marketCap: "4.500000000000000003",
    costToBuyOneMore: "0.000450015000166667",
  },
  50000: {
    marketCap: "20.833333333333333337",
    costToBuyOneMore: "0.001250025000166667",
  },
  200000: {
    marketCap: "1333.333333333333333338",
    costToBuyOneMore: "0.020000100000166667",
  },
  1000000: {
    marketCap: "166,666.666666667000000000",
    costToBuyOneMore: "0.500000500032000000",
  },
  2000000: {
    marketCap: "1,333,333.333333330000000000",
    costToBuyOneMore: "2.000000999936000000",
  },
};

describe("Psi", function () {
  beforeEach(async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [],
    });
  });

  it.only("buys tokens on correct curve", async function () {
    this.timeout(0);
    const { signers, gems, psi } = await initContracts();

    async function buy(num: number, value: number) {
      let startingBalance = await psi.provider.getBalance(signers[0].address);

      await psi.buy(pe(`${num}`), { value: pe(`${value}`), gasPrice: 0 });

      let newBalance = await psi.provider.getBalance(signers[0].address);

      let ethIn = startingBalance.sub(newBalance);

      return ethIn;
    }

    const marketCap = async () =>
      fe(await psi.provider.getBalance(psi.address));

    const signerBalance = async () =>
      fe(await psi.balanceOf(signers[0].address));

    // Only works with whole tokenNumber
    async function buyCycle(tokensToBuy: number) {
      const tokenNumber = Number(fe(await psi.totalSupply())) + tokensToBuy;

      // We buy to get up to the desired level, and also check that quoteBuy
      // matches buy
      const quote = fe(await psi.quoteBuy(pe(`${tokensToBuy}`)));

      console.log(
        `buying ${tokensToBuy} tokens at ${tokenNumber} total will cost ${quote}`
      );

      expect(fe(await buy(tokensToBuy, 9000))).to.equal(quote);

      // We check the eth market cap
      expect(
        almostEqual(
          await psi.provider.getBalance(psi.address),
          pe(curve[tokenNumber].marketCap),
          pe("0.0000000001")
        )
      );

      // Check the psi balance of the signer
      expect(await psi.balanceOf(signers[0].address)).to.equal(
        pe(`${tokenNumber}`)
      );

      // Check the cost to buy one more
      expect(
        almostEqual(
          await psi.quoteBuy(pe("1")),
          pe(curve[tokenNumber].costToBuyOneMore),
          pe("0.0000000001")
        )
      );
    }

    // ------------------

    await buyCycle(100);

    // Going up to 1,000
    await buyCycle(900);

    // Going up to 10,000
    await buyCycle(9000);

    // Going up to 20,000
    await buyCycle(10000);

    // Going up to 30,000
    await buyCycle(10000);

    // Going up to 50,000
    await buyCycle(20000);

    // Going up to 200,000
    await buyCycle(150000);
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
