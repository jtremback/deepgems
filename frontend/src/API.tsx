import "./App.css";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers, BigNumber } from "ethers";
import Web3Modal from "web3modal";
import { DeepGems } from "../../solidity/typechain/DeepGems";
import { PSI } from "../../solidity/typechain/PSI";
import { Blockchain } from "./Types";

import gemArtifact from "./artifacts/contracts/DeepGems.sol/DeepGems.json";
import psiArtifact from "./artifacts/contracts/PSI.sol/PSI.json";
import { GRAPHQL_URL, GEMS_CONTRACT, PSI_CONTRACT } from "./Shared";

// TODO
// - Get buttons on gem modal to work
// - use more rigorous margin of error etc on buys and sells

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
  gems(orderBy: number, orderDirection: desc, first: 10, where: { burned: false }){
    id
    psi
    owner
    forgeTime
    forgeBlock
    number
    activated
  }
}`;

const userGemsQuery = `query UserGems($userAddress: Bytes!) {
  gems(orderBy:number, orderDirection: asc, where: { owner: $userAddress, burned: false }){
    id
    psi
    owner
    forgeTime
    forgeBlock
    number
    activated
  }
}`;

export async function getRecentGems() {
  const graphGems = (
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
  return graphGems;
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
