import React, { CSSProperties, useEffect, useState, useRef } from "react";
import background from "./background.jpg";
import "./App.css";
import psi50example from "./images/00056-000032-0.5.jpg";
import psi100example from "./images/00056-000032-1.jpg";
import psi200example from "./images/00056-000032-2.jpg";
import psi300example from "./images/00056-000032-3.jpg";
import { BlockchainInteraction } from "./BlockchainInteraction";
import { LargeGem, useInterval } from "./Shared";
import {
  connectProvider,
  getUserData,
  getRecentGems,
  getCurrentPsiData,
} from "./API";
import { Modal } from "./BlockchainInteraction";

import {
  Blockchain,
  UserData,
  GemData,
  ModalData,
  CurrentPsiData,
} from "./Types";
import MyChart from "./BondingCurveChart";

const fontStyles: CSSProperties = {
  fontSize: 24,
  fontWeight: "lighter",
  color: "white",
  backgroundColor: "rgba(0,0,0,0.7)",
};

function App() {
  const [blockchain, setBlockchain] = useState<Blockchain>();
  const [userAddress, setUserAddress] = useState<string>();
  const [recentGems, setRecentGems] = useState<GemData[]>();
  const [userData, setUserData] = useState<UserData>();
  const [currentPsiData, setCurrentPsiData] = useState<CurrentPsiData>();
  const [modalData, setModalData] = useState<ModalData>();

  // Get get recent gems from the graph
  async function retrieveRecentGems() {
    setRecentGems(await getRecentGems());
  }
  useEffect(() => {
    retrieveRecentGems();
  }, []);
  useInterval(retrieveRecentGems, 5000);

  // Get psi current data from cdn
  async function retrieveCurrentPsiData() {
    setCurrentPsiData(await getCurrentPsiData());
  }
  useEffect(() => {
    retrieveCurrentPsiData();
  }, []);
  useInterval(retrieveCurrentPsiData, 5000);

  // Connect the user and get user data the first time
  async function triggerConnectProvider() {
    const blockchain = await connectProvider();
    const userAddress = await blockchain.provider.getSigner().getAddress();
    const userData = await getUserData(blockchain, userAddress);
    setBlockchain(blockchain);
    setUserAddress(userAddress);
    setUserData(userData);
  }

  // Get user data on an interval if the user is connected
  useInterval(async () => {
    if (!blockchain || !userAddress) {
      return;
    }
    const userData = await getUserData(blockchain, userAddress);
    setUserData(userData);
  }, 5000);

  return (
    <>
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
        {recentGems && <RecentGems gemData={recentGems} />}
        <div
          style={{
            ...fontStyles,
            maxWidth: "1024px",
            padding: 30,
          }}
        >
          <ExplainerText />
          {currentPsiData && <MyChart pointerData={currentPsiData} />}
          <BlockchainInteraction
            blockchain={blockchain}
            connectProvider={triggerConnectProvider}
            userData={userData}
            setModalData={setModalData}
          />
        </div>
      </div>
      {modalData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
          onClick={() => setModalData(undefined)}
        >
          <div
            style={{
              ...fontStyles,
              margin: 40,
              overflow: "auto",
              padding: 20,
            }}
          >
            <Modal blockchain={blockchain!} modalData={modalData} />
          </div>
        </div>
      )}
    </>
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
    <div
      style={{
        width: "100%",
        whiteSpace: "nowrap",
        display: "flex",
        flexDirection: "row-reverse",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          display: "inline-block",
        }}
      ></div>
      {gemData.map((gem) => (
        <LargeGem gem={gem} />
      ))}
    </div>
  );
}

function ExplainerText() {
  return (
    <>
      Deep Gems is a GAN trained on a dataset of precious gemstones and hooked
      up to the blockchain. Deep Gems allows you to create and own completely
      unique virtual gemstones as NFTs. Nobody knows what a Deep Gem will look
      like before the moment you forge it. A GAN, or generative adversarial
      network, is a neural network that produces original art when trained on a
      large dataset of existing images.
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          paddingTop: 40,
          paddingBottom: 40,
        }}
      >
        {[
          [psi50example, "50 PSI"],
          [psi100example, "100 PSI"],
          [psi200example, "200 PSI"],
          [psi300example, "300 PSI"],
        ].map((data) => {
          return (
            <div style={{ maxWidth: 100, textAlign: "center" }}>
              <img
                src={data[0]}
                alt=""
                style={{ paddingBottom: 20, width: "100%" }}
              ></img>
              {data[1]}
            </div>
          );
        })}
      </div>
      <p>
        In a world of infinite reproducibility, the most precious asset is
        uniqueness. Deep Gems explores this concept by explicitly linking
        uniqueness to an increasingly scarce token, called PSI. When you forge a
        Deep Gem, you must supply PSI tokens. The more PSI a gem is forged with,
        the more unique it becomes. At higher levels of PSI, gems become
        increasingly chaotic and psychedelic. Forging a gem with a lot of PSI
        can result in a distorted mess of colors, or it can result in a
        masterpiece.
      </p>
      <p>
        Deep Gems invites you to explore and curate the neural network's
        creations. If you've forged a lackluster gem, you can burn it or reforge
        it to reuse its PSI tokens to create a new gem. This blurs the line
        between artist and viewer. As gems are forged, reforged, traded and
        sold, Deep Gems users will mine the depths of the neural network to find
        the rarest and most precious gems.
      </p>
    </>
  );
}

export default App;
