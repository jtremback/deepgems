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
  1: {
    costToMintOneMore: "0.000002333333333333",
    marketCap: "0.000000333333333333",
  },
  10: {
    costToMintOneMore: "0.000110333333333333",
    marketCap: "0.000333333333333332",
  },
  100: {
    costToMintOneMore: "0.010100333333333333",
    marketCap: "0.333333333333333331",
  },
  200: {
    costToMintOneMore: "0.040200333333333333",
    marketCap: "2.66666666666666665",
  },
  300: {
    costToMintOneMore: "0.090300333333334000",
    marketCap: "9.000000000000000000",
  },
  2000: {
    costToMintOneMore: "4.002000333333490000",
    marketCap: "2,666.666666666670000000",
  },
  9000: {
    costToMintOneMore: "81.009000333343500000",
    marketCap: "243,000.000000000000000000",
  },
  10000: {
    costToMintOneMore: "100.010000333374000000",
    marketCap: "333,333.333333333000000000",
  },
};

describe("Psi", function () {
  beforeEach(async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [],
    });
  });

  it("mints and burns tokens on correct curve", async function () {
    this.timeout(0);
    const signers = await ethers.getSigners();
    const DeepGemsContract = await ethers.getContractFactory("DeepGems");
    const gems = (await DeepGemsContract.deploy()) as DeepGems;
    const PSIContract = await ethers.getContractFactory("PSI");
    const psi = (await PSIContract.deploy(gems.address)) as PSI;

    let startingBalance;
    let newBalance;
    // let marketCap = pe("0");

    async function mint(num: number, value: number) {
      let startingBalance = await psi.provider.getBalance(signers[0].address);

      await psi.mint(pe(`${num}`), { value: pe(`${value}`), gasPrice: 0 });

      let newBalance = await psi.provider.getBalance(signers[0].address);

      let ethIn = startingBalance.sub(newBalance);

      return ethIn;
    }

    async function burn(num: number, minEth: number) {
      let startingBalance = await psi.provider.getBalance(signers[0].address);

      await psi.burn(pe(`${num}`), pe(`${minEth}`), { gasPrice: 0 });

      let newBalance = await psi.provider.getBalance(signers[0].address);

      let ethOut = newBalance.sub(startingBalance);

      return ethOut;
    }

    const marketCap = async () =>
      fe(await psi.provider.getBalance(psi.address));

    const signerBalance = async () =>
      fe(await psi.balanceOf(signers[0].address));

    // ------------------

    await mint(1, 100);

    expect(await marketCap()).to.equal(curve[1].marketCap);

    expect(await signerBalance()).to.equal("1.0");

    expect(fe(await psi.quoteMint(pe("1")))).to.equal(
      curve[1].costToMintOneMore
    );

    expect(fe(await mint(1, 100))).to.equal(curve[1].costToMintOneMore);

    expect(await signerBalance()).to.equal("2.0");

    // ------------------
    // Going up to 10

    await mint(8, 100);

    expect(await marketCap()).to.equal(curve[10].marketCap);

    expect(await signerBalance()).to.equal("10.0");

    expect(fe(await psi.quoteMint(pe("1")))).to.equal(
      curve[10].costToMintOneMore
    );

    expect(fe(await mint(1, 100))).to.equal(curve[10].costToMintOneMore);

    expect(await signerBalance()).to.equal("11.0");

    // ------------------
    // Going up to 100

    await mint(89, 100);

    expect(await marketCap()).to.equal(curve[100].marketCap);

    expect(await signerBalance()).to.equal("100.0");

    expect(fe(await psi.quoteMint(pe("1")))).to.equal(
      curve[100].costToMintOneMore
    );

    expect(fe(await mint(1, 100))).to.equal(curve[100].costToMintOneMore);

    expect(await signerBalance()).to.equal("101.0");

    // ------------------
    // Going up to 111 by quarters of a token just for fun

    for (let i = 0; i < 40; i++) {
      await mint(0.25, 100);
    }

    // Going up to 200

    await mint(89, 100);

    expect(await marketCap()).to.equal(curve[200].marketCap);

    expect(await signerBalance()).to.equal("200.0");

    expect(fe(await psi.quoteMint(pe("1")))).to.equal(
      curve[200].costToMintOneMore
    );

    expect(fe(await mint(1, 100))).to.equal(curve[200].costToMintOneMore);

    expect(await signerBalance()).to.equal("201.0");

    // ------------------
    // Going down to 100

    await burn(101, 0);

    // TODO: figure out numerical instability
    expect(await marketCap()).to.equal(curve[100].marketCap);

    expect(await signerBalance()).to.equal("100.0");

    expect(fe(await psi.quoteMint(pe("1")))).to.equal(
      curve[100].costToMintOneMore
    );

    expect(fe(await mint(1, 100))).to.equal(curve[100].costToMintOneMore);

    expect(await signerBalance()).to.equal("101.0");
  });

  it("experiment with numerical instability", async function () {
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

    console.log(await signerBalance(), await marketCap());

    await psi.burn(pe(`100`), pe(`0`), { gasPrice: 0 });

    console.log(await signerBalance(), await marketCap());

    await psi.mint(pe(`100`), { value: pe(`10`), gasPrice: 0 });
    await psi.mint(pe(`100`), { value: pe(`10`), gasPrice: 0 });

    for (let i = 0; i < 40; i++) {
      await psi.mint(pe(`0.25`), { value: pe(`10`), gasPrice: 0 });
    }

    await psi.mint(pe(`90`), { value: pe(`10`), gasPrice: 0 });

    await psi.burn(pe(`100`), pe(`0`), { gasPrice: 0 });
    await psi.burn(pe(`100`), pe(`0`), { gasPrice: 0 });

    console.log(await signerBalance(), await marketCap());

    for (let i = 0; i < 40; i++) {
      await psi.mint(pe(`0.25`), { value: pe(`10`), gasPrice: 0 });
    }

    await psi.burn(pe(`10`), pe(`0`), { gasPrice: 0 });

    console.log(await signerBalance(), await marketCap());

    for (let i = 0; i < 40; i++) {
      await psi.mint(pe(`0.25`), { value: pe(`10`), gasPrice: 0 });
    }

    await psi.burn(pe(`10`), pe(`0`), { gasPrice: 0 });

    console.log(await signerBalance(), await marketCap());
  });

  it.only("exploit numerical instability", async function () {
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
      for (let i = 0; i < 2; i++) {
        await psi.mint(pe(`5`), { value: pe(`10`), gasPrice: 0 });
      }
      // await psi.mint(pe(`90`), { value: pe(`10`), gasPrice: 0 });
      console.log(await signerBalance(), await marketCap());
      await psi.burn(pe(`10`), pe(`0`), { gasPrice: 0 });
    }
  });
});
