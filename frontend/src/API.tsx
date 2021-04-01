import "./App.css";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers, BigNumber } from "ethers";
import Web3Modal from "web3modal";
import { DeepGems } from "../../solidity/typechain/DeepGems";
import { PSI } from "../../solidity/typechain/PSI";
import { Blockchain } from "./BlockchainInteraction";
const gemArtifact = require("./DeepGems.json");
const psiArtifact = require("./PSI.json");

// TODO
// - Add approve button before forging
// - Deal with timing (have to wait 5 seconds after connecting wallet etc)
// - Get buttons on gem modal to work
// - use more rigorous margin of error etc on buys and sells

const GRAPHQL_URL =
  "https://api.thegraph.com/subgraphs/name/jtremback/deepgems";
const GEMS_CONTRACT = "0xc5b323c98550D552d55b21d6dD370E5798373709";
const PSI_CONTRACT = "0xA041c8D7278690C5310cFc4849d0f11A4Adb19C5";

const fe = ethers.utils.formatEther;
const pe = ethers.utils.parseEther;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "INFURA_ID", // required
    },
  },
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

const recentGemsQuery = `{
  gems(orderBy: forgeTime, orderDirection: desc, first: 7, where: { burned: false }){
    id
    psi
    owner
    forgeTime
    forgeBlock
  }
}`;

const userGemsQuery = `query UserGems($userAddress: Bytes!) {
  gems(orderBy:forgeTime, orderDirection: asc, where: { owner: $userAddress, burned: false }){
    id
    psi
    owner
    forgeTime
    forgeBlock
  }
}`;

export async function getRecentGems() {
  return (
    await (
      await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: recentGemsQuery }),
      })
    ).json()
  ).data.gems;
}

export async function getUserData(blockchain: Blockchain, userAddress: string) {
  const gems = (
    await (
      await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: userGemsQuery,
          variables: {
            userAddress,
          },
        }),
      })
    ).json()
  ).data.gems;

  const psiBalance = await blockchain.psi.balanceOf(userAddress);

  return { gems, psiBalance };
}

export type GemData = {
  id: string;
};

export type UserData = {
  psiBalance: BigNumber;
  gems: GemData[];
};

export async function connectProvider() {
  //  Enable session (triggers QR Code modal)
  const provider = new ethers.providers.Web3Provider(await web3Modal.connect());
  const gems = (new ethers.Contract(
    GEMS_CONTRACT,
    gemArtifact.abi,
    provider.getSigner()
  ) as any) as DeepGems;

  const psi = (new ethers.Contract(
    PSI_CONTRACT,
    psiArtifact.abi,
    provider.getSigner()
  ) as any) as PSI;
  return { provider, gems, psi };
}
