import React, { ReactNode, useState } from "react";
import background from "./background.jpg";
import "./App.css";
import psi0example from "./images/0psi.jpg";
import psi100example from "./images/100psi.jpg";
import psi300example from "./images/300psi.jpg";
import useAPIPolling, { APIPollingOptions } from "use-api-polling";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers, BigNumber } from "ethers";
import Web3Modal from "web3modal";
import { DeepGems } from "../../solidity/typechain/DeepGems";
import { PSI } from "../../solidity/typechain/PSI";
import { Blockchain, BlockchainInteraction } from "./BlockchainInteraction";
const gemArtifact = require("./DeepGems.json");
const psiArtifact = require("./PSI.json");

const GRAPHQL_URL = "http://localhost:8000/subgraphs/name/jtremback/deepgems";
const IMAGES_CDN = "https://deepgemscache.s3.us-west-2.amazonaws.com/";
const GEMS_CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PSI_CONTRACT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

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
  gems(orderBy: forgeTime, orderDirection: desc, first: 7){
    id
    psi
    owner
    forgeTime
    forgeBlock
  }
}`;

const userGemsQuery = `query UserGems($userAddress: Bytes!) {
  gems(orderBy:forgeTime, orderDirection: desc, first: 7, where: {owner: $userAddress}){
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

export async function getUserData(
  blockchain?: Blockchain,
  userAddress?: string
) {
  console.log("GETUSERDDDAATA", blockchain);
  if (!blockchain || !userAddress) {
    return;
  }

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
