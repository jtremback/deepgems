import React, { CSSProperties, useEffect, useState, useRef } from "react";
import background from "./background.jpg";
import "./App.css";
import psi50example from "./images/00056-000032-0.5.jpg";
import psi100example from "./images/00056-000032-1.jpg";
import psi200example from "./images/00056-000032-2.jpg";
import psi300example from "./images/00056-000032-3.jpg";
import useAPIPolling from "use-api-polling";
import { BlockchainInteraction } from "./BlockchainInteraction";
import { LargeGem } from "./Shared";
import { connectProvider, getUserData, getRecentGems } from "./API";
import { Modal } from "./BlockchainInteraction";

import { Blockchain, UserData, GemData, ModalData } from "./Types";
import MyChart from "./BondingCurveChart";

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

const fontStyles: CSSProperties = {
  fontSize: 24,
  fontWeight: "lighter",
  color: "white",
  backgroundColor: "rgba(0,0,0,0.7)",
};

function App() {
  const [blockchain, setBlockchain] = useState<Blockchain>();
  const [userAddress, setUserAddress] = useState<string>();
  const [userData, setUserData] = useState<UserData>();
  const [modalData, setModalData] = useState<ModalData>();

  // TODO: get rid of this api polling hook thing cause
  // it sucks and do it yourself with useInterval
  const recentGems = useAPIPolling<GemData[]>({
    fetchFunc: getRecentGems,
    initialState: [],
    delay: 5000,
  });

  async function tryToGetuserData() {
    if (!blockchain || !userAddress) {
      return;
    }
    const userData = await getUserData(blockchain, userAddress);
    setUserData(userData);
  }

  useInterval(tryToGetuserData, 5000);

  async function triggerConnectProvider() {
    const blockchain = await connectProvider();
    const userAddress = await blockchain.provider.getSigner().getAddress();
    const userData = await getUserData(blockchain, userAddress);
    setUserData(userData);
    setBlockchain(blockchain);
    setUserAddress(userAddress);
  }

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
        <RecentGems gemData={recentGems} />
        <div
          style={{
            ...fontStyles,
            maxWidth: "1024px",
            padding: 30,
          }}
        >
          <ExplainerText />
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
      Deep Gems are completely unique AI-generated NFT gemstones. Some are
      beautiful, some are ugly. Nobody knows what a gem will look like until the
      moment it is forged. Deep Gems are powered by PSI. The more PSI you forge
      a gem with, the more interesting it becomes.
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
      When you forge a gem, only 95% of the PSI goes into the gem. The other 5%
      goes to the artists behind Deep Gems. You can get PSI on a bonding curve.
      The more people get into Deep Gems, the more it will cost you. If you
      don't like how a gem turned out, you can reforge it to try again, or burn
      it to get the PSI back out. To sell a gem on an NFT exchange, you can
      activate it to turn it into a transferable NFT.
      <MyChart />
      {/* <ReactChartJs /> */}
    </>
  );
}

export default App;
