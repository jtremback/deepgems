import { expect } from "chai";
import { readFileSync } from "fs";
import { ethers, network } from "hardhat";
import { Signer, BigNumber, BigNumberish } from "ethers";
import { PSI } from "../typechain/PSI";
import { DeepGems } from "../typechain/DeepGems";
var fs = require("fs");
const curve: {
  [key: number]: { reservePool: string; price: string };
} = require("./bondingCurveData.json");

const ETHER_PRICE = 1700;

const fe = ethers.utils.formatEther;
const pe = ethers.utils.parseEther;

function almostEqual(a: BigNumber, b: BigNumber, within: BigNumber) {
  const delta = a.sub(b).abs();
  console.log("delta: ", delta.toString());
  return delta.lt(within);
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

  return { signers, gems, psi };
}

describe("Psi", function () {
  beforeEach(async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [],
    });
  });

  it("buys and sells tokens on correct curve", async function () {
    this.timeout(0);
    const { signers, gems, psi } = await initContracts();

    // Give signer 0 some extra ether

    async function buy(num: number, value: number) {
      let startingBalance = await psi.provider.getBalance(signers[0].address);

      console.log("startingBalance", startingBalance.toString());

      await psi.buy(pe(`${num}`), { value: pe(`${value}`), gasPrice: 0 });

      let newBalance = await psi.provider.getBalance(signers[0].address);

      let ethIn = startingBalance.sub(newBalance);

      return ethIn;
    }

    async function sell(num: number, minEth: number) {
      let startingBalance = await psi.provider.getBalance(signers[0].address);

      await psi.sell(pe(`${num}`), pe(`${minEth}`), { gasPrice: 0 });

      let newBalance = await psi.provider.getBalance(signers[0].address);

      let ethOut = newBalance.sub(startingBalance);

      return ethOut;
    }

    const almostEqualDelta = BigNumber.from(100000000);

    // Only works with whole tokenNumber
    async function buyCycle(tokensToBuy: number) {
      const tokenNumber = Number(fe(await psi.totalSupply())) + tokensToBuy;

      // We buy to get up to the desired level, and also check that quoteBuy
      // matches buy
      const quote = fe(await psi.quoteBuy(pe(`${tokensToBuy}`)));

      console.log(
        `buying ${tokensToBuy} tokens at ${tokenNumber} total will cost ${quote}`
      );

      expect(fe(await buy(tokensToBuy, 999999))).to.equal(quote);

      // We check the eth market cap
      expect(
        almostEqual(
          await psi.provider.getBalance(psi.address),
          BigNumber.from(curve[tokenNumber].reservePool),
          almostEqualDelta
        )
      ).to.be.true;

      // Check the psi balance of the signer
      expect(await psi.balanceOf(signers[0].address)).to.equal(
        pe(`${tokenNumber}`)
      );

      // Check the cost to buy one more
      expect(
        almostEqual(
          await psi.quoteBuy(pe("1")),
          BigNumber.from(curve[tokenNumber].price),
          almostEqualDelta
        )
      ).to.be.true;
    }

    async function sellCycle(tokensToSell: number) {
      const tokenNumber = Number(fe(await psi.totalSupply())) - tokensToSell;

      // We buy to get up to the desired level, and also check that quoteBuy
      // matches buy
      const quote = fe(await psi.quoteSell(pe(`${tokensToSell}`)));

      console.log(
        `selling ${tokensToSell} tokens at ${tokenNumber} total will return ${quote}`
      );

      expect(fe(await sell(tokensToSell, 0))).to.equal(quote);

      // We check the eth market cap
      expect(
        almostEqual(
          await psi.provider.getBalance(psi.address),
          BigNumber.from(curve[tokenNumber].reservePool),
          almostEqualDelta
        )
      ).to.be.true;

      // Check the psi balance of the signer
      expect(await psi.balanceOf(signers[0].address)).to.equal(
        pe(`${tokenNumber}`)
      );

      // Check the cost to buy one more
      expect(
        almostEqual(
          await psi.quoteBuy(pe("1")),
          BigNumber.from(curve[tokenNumber].price),
          almostEqualDelta
        )
      ).to.be.true;
    }

    // ------------------

    // await buyCycle(100);

    // // Going up to 1,000
    // await buyCycle(900);

    // Going up to 10,000
    await buyCycle(10000);

    // Going up to 20,000
    await buyCycle(10000);

    // Going up to 30,000
    await buyCycle(10000);

    // Going up to 50,000
    await buyCycle(20000);

    // Going up to 200,000
    await buyCycle(150000);

    // Going down to 30,000
    await sellCycle(170000);

    // Going up to 500,000
    await buyCycle(470000);

    // Going down to 30,000
    await sellCycle(470000);
  });

  it.skip("try to exploit numerical instability", async function () {
    this.timeout(0);
    const { signers, gems, psi } = await initContracts();

    const marketCap = async () =>
      fe(await psi.provider.getBalance(psi.address));

    const signerBalance = async () =>
      fe(await psi.balanceOf(signers[0].address));

    await psi.buy(pe(`100`), { value: pe(`10`), gasPrice: 0 });

    for (let i = 0; i < 40; i++) {
      const tobuy = 1;
      const cycles = 100;

      let tosell = 0;
      for (let i = 0; i < cycles; i++) {
        await psi.buy(pe(`${tobuy}`), { value: pe(`10`), gasPrice: 0 });
        tosell = tosell + tobuy;
      }

      console.log(await signerBalance(), await marketCap());
      await psi.sell(pe(`${tosell}`), pe(`0`), { gasPrice: 0 });
    }
  });

  it.skip("generate plotting curve", async function () {
    this.timeout(0);
    const { signers, gems, psi } = await initContracts();

    let curve = [];

    for (let i = 0; true; i++) {
      const costToBuy = Number(fe(await psi.quoteBuy(pe("1"))));
      const pool = Number(fe(await psi.provider.getBalance(psi.address)));
      const totalSupply = Number(fe(await psi.totalSupply()));
      const mcap = Number(costToBuy) * Number(totalSupply);

      const record = {
        reservePool: pool,
        price: costToBuy,
        totalSupply: totalSupply,
        marketCap: mcap,
      };

      console.log(record);

      curve[i] = record;

      let buyNumber = 50000;

      if (i === 4) {
        buyNumber = 49999;
      }

      if (i === 5) {
        buyNumber = 1;
      }

      try {
        await psi.buy(pe(`${buyNumber}`), {
          value: pe(`999999`),
          gasPrice: 0,
        });
      } catch (e) {
        console.log(e);
        break;
      }
    }

    console.log(JSON.stringify(curve));
    fs.writeFile("./curve-visuals/data.json", JSON.stringify(curve), () => {});
  });

  it.only("generate testing curve", async function () {
    this.timeout(0);
    const { signers, gems, psi } = await initContracts();

    let curve = {};

    for (let i = 0; true; i++) {
      const price = await psi.quoteBuy(pe("1"));
      const pool = await psi.provider.getBalance(psi.address);
      const totalSupply = await psi.totalSupply();

      const record = {
        reservePool: fe(pool),
        price: fe(price),
      };

      curve[Number(fe(totalSupply))] = record;

      let buyNumber = 10000;

      try {
        await psi.buy(pe(`${buyNumber}`), {
          value: pe(`999999`),
          gasPrice: 0,
        });
      } catch (e) {
        console.log(e);
        break;
      }
    }

    console.log(JSON.stringify(curve));
  });
});
