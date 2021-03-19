import React, { ReactNode, useEffect, useState, useRef } from "react";
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
import {
  connectProvider,
  UserData,
  GemData,
  getUserData,
  getRecentGems,
} from "./API";
const gemArtifact = require("./DeepGems.json");
const psiArtifact = require("./PSI.json");

const GRAPHQL_URL = "http://localhost:8000/subgraphs/name/jtremback/deepgems";
const IMAGES_CDN = "https://deepgemscache.s3.us-west-2.amazonaws.com/";
const GEMS_CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PSI_CONTRACT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const fe = ethers.utils.formatEther;
const pe = ethers.utils.parseEther;

function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delay]);
}

function App() {
  const [blockchain, setBlockchain] = useState<Blockchain>();
  const [userAddress, setUserAddress] = useState<string>();
  const [userData, setUserData] = useState<UserData>();

  // TODO: get rid of this api polling hook thing cause
  // it sucks and do it yourself with useInterval
  const recentGems = useAPIPolling<GemData[]>({
    fetchFunc: getRecentGems,
    initialState: [],
    delay: 5000,
  });

  function getBlockchain() {
    return blockchain;
  }

  useInterval(async () => {
    const userData = await getUserData(blockchain, userAddress);
    setUserData(userData);
  }, 5000);

  async function triggerConnectProvider() {
    const blockchain = await connectProvider();
    setBlockchain(blockchain);
    setUserAddress(await blockchain.provider.getSigner().getAddress());
  }

  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
        backgroundPositionX: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "black",
        width: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <DigDeeper />
      <PageTitle />
      <RecentGems gemData={recentGems} />
      <div
        style={{
          maxWidth: "1024px",
          fontSize: 24,
          fontWeight: "lighter",
          color: "white",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: 30,
        }}
      >
        <ExplainerText />
        <BlockchainInteraction
          blockchain={blockchain}
          connectProvider={triggerConnectProvider}
          userData={userData}
        />
      </div>
    </div>
  );
}

function DigDeeper() {
  return (
    <div style={{ height: 1700, display: "flex", flexDirection: "column" }}>
      <div style={{ height: "80vh" }}></div>
      <div
        style={{
          background: "rgba(0,0,0,0.5)",
          padding: 20,
          paddingLeft: 30,
          paddingRight: 30,
        }}
      >
        <h1 style={{ color: "rgb(217,213,207)", margin: 0 }}>Dig deeper ↓</h1>
      </div>
    </div>
  );
}

function PageTitle() {
  return (
    <div style={{ maxWidth: "1202px" }}>
      <h1
        className="display-3"
        style={{
          color: "rgb(217,213,207)",
          fontSize: 150,
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        Deep Gems
      </h1>
    </div>
  );
}

function RecentGems({ gemData }: { gemData: GemData[] }) {
  return (
    <div style={{ overflow: "hidden", width: "100%", whiteSpace: "nowrap" }}>
      {gemData.map((gem) => (
        <RecentGem gem={gem} />
      ))}
    </div>
  );
}

function RecentGem({
  style,
  gem,
}: {
  style?: React.CSSProperties;
  gem: GemData;
}) {
  return (
    <div
      style={{
        width: 300,
        height: 300,
        backgroundImage: `url(${IMAGES_CDN}${gem.id}.jpg)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundColor: "black",
        borderRadius: 10000,
        marginRight: 40,
        marginBottom: 40,
        display: "inline-block",
        ...style,
      }}
    ></div>
  );
}

function ExplainerText() {
  return (
    <>
      Deep Gems are completely unique AI-generated NFT gemstones. Some are
      beautiful, some are ugly. Only one gem can be mined every block. Deep Gems
      are powered by PSI. You can mine a gem without any PSI, but it will be
      boring. Every PSI-less gem looks exactly the same. When you mine a gem
      with PSI, it takes on a more distinct color and form. You see that none of
      the other infinite possible Deep Gems is exactly like yours. The more PSI
      you add, the more interesting your gem becomes.
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          paddingTop: 40,
          paddingBottom: 40,
        }}
      >
        {[
          [psi0example, "0 PSI"],
          [psi100example, "100 PSI"],
          [psi300example, "300 PSI"],
        ].map((data) => {
          return (
            <div style={{ maxWidth: 200, textAlign: "center" }}>
              <img
                src={data[0]}
                style={{ paddingBottom: 20, width: "100%" }}
              ></img>
              {data[1]}
            </div>
          );
        })}
      </div>
      You can get PSI on a bonding curve. The more people get into Deep Gems,
      the more it will cost you. You can also burn an existing gem to get its
      PSI back out. But be careful! When you burn a gem you only get 99% of its
      PSI out. 1% is lost forever.
    </>
  );
}

export default App;
