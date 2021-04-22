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
    marketCap: "0.000000500000000000",
    costToBuyOneMore: "0.000000010050000000",
  },
  1000: {
    marketCap: "0.000050000000000000",
    costToBuyOneMore: "0.000000100050000000",
  },
  10000: {
    marketCap: "0.005000000000000000",
    costToBuyOneMore: "0.000001000050000000",
  },
  20000: {
    marketCap: "0.020000000000000000",
    costToBuyOneMore: "0.000002000050000000",
  },
  30000: {
    marketCap: "0.045000000000000000",
    costToBuyOneMore: "0.000003000050000000",
  },
  50000: {
    marketCap: "0.125000000000000000",
    costToBuyOneMore: "0.000005000050000000",
  },
  200000: {
    marketCap: "2.000000000000000000",
    costToBuyOneMore: "0.000020000050000000",
  },
  1000000: {
    marketCap: "50.000000000000000000",
    costToBuyOneMore: "0.000100000050000000",
  },
  2000000: {
    marketCap: "200.000000000000000000",
    costToBuyOneMore: "0.000200000050000000",
  },
  10000000: {
    marketCap: "5000.000000000000000000",
    costToBuyOneMore: "0.001000000050000000",
  },
  50000000: {
    marketCap: "125000.000000000000000000",
    costToBuyOneMore: "0.005000000050000000",
  },
};

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
      ).to.be.that.which.is.true;

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
      ).to.be.that.which.is.true;
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
          pe(curve[tokenNumber].marketCap),
          pe("0.0000000001")
        )
      ).to.be.that.which.is.true;

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
      ).to.be.that.which.is.true;
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

    // Going down to 30,000
    await sellCycle(170000);

    // Going up to 10,000,000
    await buyCycle(9970000);

    // Going down to 30,000
    await sellCycle(9970000);
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

  it.only("generate plot", async function () {
    this.timeout(0);
    const { signers, gems, psi } = await initContracts();

    const costToBuyOneMore = async () => fe(await psi.quoteBuy(pe("1")));

    const marketCap = async () =>
      fe(await psi.provider.getBalance(psi.address));

    const signerBalance = async () =>
      fe(await psi.balanceOf(signers[0].address));

    let graph = [];

    console.log("buy number, cost to buy one, market cap, number bought");

    for (let i = 0; true; i++) {
      const costToBuy = Number(await costToBuyOneMore());
      const pool = Number(await marketCap());
      const totalSupply = Number(fe(await psi.totalSupply()));
      const mcap = Number(costToBuy) * Number(totalSupply);

      const record = {
        reservePool: pool * 2000,
        price: costToBuy * 2000,
        totalSupply: totalSupply,
        marketCap: mcap * 2000,
      };

      console.log(record);

      graph[i] = record;

      const buyNumber = 10000;
      try {
        let foo = await psi.buy(pe(`${buyNumber}`), {
          value: pe(`999999`),
          gasPrice: 0,
        });
      } catch (e) {
        console.log(e);
        break;
      }
    }

    console.log(JSON.stringify(graph));
  });
});
