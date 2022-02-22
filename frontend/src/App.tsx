import { CSSProperties, useEffect, useState } from "react";
import background from "./background.jpg";
import "./App.css";
// import psi50example from "./images/00056-000032-0.5.jpg";
// import psi100example from "./images/00056-000032-1.jpg";
// import psi200example from "./images/00056-000032-2.jpg";
// import psi300example from "./images/00056-000032-3.jpg";

import seed0127_8_1_0 from "./images/seed0127-8-1.0.png"
import seed0178_8_1_0 from "./images/seed0178-8-1.0.png"
import seed0221_8_1_2 from "./images/seed0221-8-1.2.png"
import seed0282_8_1_0 from "./images/seed0282-8-1.0.png"
import seed0468_8_0_8 from "./images/seed0468-8-0.8.png"
import seed0548_8_1_2 from "./images/seed0548-8-1.2.png"
import seed0793_8_1_0 from "./images/seed0793-8-1.0.png"
import seed0883_8_1_2 from "./images/seed0883-8-1.2.png"
import seed0885_8_0_8 from "./images/seed0885-8-0.8.png"
import seed0898_8_1_2 from "./images/seed0898-8-1.2.png"
import seed0910_8_1_2 from "./images/seed0910-8-1.2.png"
import seed0919_8_1_2 from "./images/seed0919-8-1.2.png"
import seed1088_8_1_0 from "./images/seed1088-8-1.0.png"
import seed1210_8_1_2 from "./images/seed1210-8-1.2.png"
import seed1294_8_1_0 from "./images/seed1294-8-1.0.png"
import seed1409_8_1_0 from "./images/seed1409-8-1.0.png"
import { BlockchainInteraction } from "./BlockchainInteraction";
import { LargeGem, useInterval, fontStyles, Modal } from "./Shared";
import {
  connectProvider,
  getUserData,
  getRecentGems,
  getCurrentPsiData,
} from "./API";

import {
  Blockchain,
  UserData,
  GemData,
  ModalData,
  CurrentPsiData,
} from "./Types";
import MyChart from "./BondingCurveChart";
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
          backgroundPositionY: "70%",
          backgroundRepeat: "no-repeat",
          backgroundColor: "black",
          width: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          // justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {/* <DigDeeper /> */}
        <PageTitle />
        {/* {recentGems && (
          <RecentGems gemData={recentGems} setModalData={setModalData} />
        )} */}
        <div
          style={{
            ...fontStyles,
            maxWidth: "1024px",
            width: "100vw",
            padding: 30,
          }}
        >
          <ExplainerText currentPsiData={currentPsiData} />

          <BlockchainInteraction
            blockchain={blockchain}
            connectProvider={triggerConnectProvider}
            userData={userData}
            setModalData={setModalData}
          />
          {/* <FAQ /> */}
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
        >
          <div
            style={{
              ...fontStyles,
              margin: 40,
              overflow: "auto",
              padding: 20,
            }}
          >
            <Modal
              blockchain={blockchain!}
              modalData={modalData}
              setModalData={setModalData}
            />
          </div>
          <div
            style={{
              position: "absolute",
              zIndex: -1,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            onClick={() => setModalData(undefined)}
          ></div>
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

function RecentGems({
  gemData,
  setModalData,
}: {
  gemData: GemData[];
  setModalData: (modalData: ModalData) => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 20,
          height: 500,
          alignContent: "flex-start",
        }}
        className="gem-slide"
      >
        {gemData.map((gem, i) => (
          <div
            key={i}
            onClick={() => setModalData({ type: "TheirGemModal", gem })}
          >
            <LargeGem gem={gem} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExplainerText({
  currentPsiData,
}: {
  currentPsiData: CurrentPsiData | undefined;
}) {
  return (
    <>
      <p>
        Due to high Ethereum gas prices, Deep Gems is relaunching, with better art, on <a href="http://stargaze.zone">Stargaze.</a>
      </p>


      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 40,
          paddingBottom: 0,
        }}
      >
        {[
          [seed0178_8_1_0, ""],
          [seed0282_8_1_0, ""],
          [seed0548_8_1_2, ""],
          [seed0910_8_1_2, ""],
        ].map((data, i) => {
          return (
            <div key={i} style={{ maxWidth: 200, textAlign: "center" }}>
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 40,
          paddingBottom: 40,
        }}
      >
        {[
          [seed0919_8_1_2, ""],
          [seed1088_8_1_0, ""],
          [seed1210_8_1_2, ""],
          [seed1294_8_1_0, ""],
        ].map((data, i) => {
          return (
            <div key={i} style={{ maxWidth: 200, textAlign: "center" }}>
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


      <p>Come join our community, and maybe get some free gems, in #deep-gems on the <a href="https://discord.gg/stargaze">Stargaze Discord server</a>.</p>
      <br/>
      <br/>
      <br/>
      <br />
      <p>
        <h3>What this means for holders of Deep Gems:</h3> Your NFT will continue to work exactly the same on Ethereum, and will continue to display. Nothing will change.
      </p>
      <p>
        <h3>What this means for holders of PSI:</h3> We will be turning off the GAN on 2/2/22, after which point newly forged gems will no longer automatically have an image generated for display on NFT exchanges and wallets. Gems that were already forged will continue displaying on exchanges and wallets. The images of gems forged after the GAN server is shut off will still be viewable <a href="https://colab.research.google.com/drive/1yh7C_GND4nV_VTiL-vl6I9twxNdCzdui">
          here
        </a>. PSI can still be bought and sold through the bonding curve at the bottom of this page.
      </p>
      <p>
      <h3>Get a Deep Gem on Stargaze:</h3>
        We will redeem any Deep Gem on Ethereum that was forged before 2/2/22 for one Deep Gem on Stargaze. We will also redeem any PSI that was bought before 2/2/22 for Deep Gems on Stargaze, at an exchange rate of 1000 PSI for 1 Gem. Email deepgems69@gmail.com for details. Offer good until 1/1/23.
      </p>
      {/* <h2>Forging gems with PSI</h2>
      <p>
        Deep Gems explores the concept of uniqueness with an increasingly scarce
        token, called PSI. When you forge a Deep Gem, you must supply PSI
        tokens. The more PSI a gem is forged with, the more unique it becomes.
        At higher levels of PSI, gems become increasingly chaotic and
        psychedelic. Forging a gem with a lot of PSI can result in a distorted
        mess of colors, or it can result in a masterpiece.
      </p>
      <PSIDiagram />
      <p>
        Deep Gems invites you to explore and curate the neural network's
        creations. If you've forged a lackluster gem, you can burn it or reforge
        it to reuse its PSI tokens to create a new gem. This blurs the line
        between artist and viewer. As gems are forged, reforged, traded and
        sold, Deep Gems users will mine the depths of the neural network to find
        the rarest and most precious gems.
      </p>
      <h2>PSI tokenomics</h2>
      <div style={{ marginTop: 30, marginBottom: 30 }}>
        {currentPsiData && <MyChart pointerData={currentPsiData} />}
      </div>
      <p>
        2,500,000 PSI has been created, and is available for purchase on a
        bonding curve. You can also sell PSI back to the curve. The more PSI is
        bought, the higher the price goes. Every time anyone reforges or burns a
        gem, 5% of the PSI in that gem is burned forever, permanently reducing
        the supply.
      </p>
      <p>
        <p>
          Here are the{" "}
          <a href="https://etherscan.io/address/0x6A746B25b240518cf26bdA877A969De85Db492b7#code">
            Deep Gems
          </a>{" "}
          and{" "}
          <a href="https://etherscan.io/address/0x70d626dFE4BACaD28994469b6baC702979bdeB09#code">
            PSI
          </a>{" "}
          contracts. Be aware that they are completely unaudited, and you
          interact with them at your own risk.
        </p>
      </p> */}
    </>
  );
}

function PSIDiagram() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        paddingTop: 40,
        paddingBottom: 40,
      }}
    >
      {[
        // [psi50example, "50 PSI"],
        // [psi100example, "100 PSI"],
        // [psi200example, "400 PSI"],
        // [psi300example, "900 PSI"],
      ].map((data, i) => {
        return (
          <div key={i} style={{ maxWidth: 100, textAlign: "center" }}>
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
  );
}

function FAQ() {
  return (
    <div style={{ marginTop: 100 }}>
      <h1>FAQ</h1>
      <h2>How does the bonding curve work?</h2>
      <p>
        The Deep Gems bonding curve is a true bonding curve, meaning that you
        can not only buy PSI from it, but also sell PSI back to it with no fee
        beyond the Ethereum gas fee. The supply is capped at 2,500,000 PSI.
        After this, no more PSI can be bought from the curve. After this point,
        people wanting to buy PSI will have to buy it from an exchange, such as
        Uniswap.
      </p>

      <h2>What do "forge", "reforge", "activate", and "burn" do?</h2>
      <p>
        Because we want people to be able to explore the neural network as much
        as possible, we've engineered the forging process to use as little gas
        as possible. When you forge a gem, you own it on the blockchain, but it
        is not yet a full-fledged NFT. You can reforge it as often as you want,
        while paying as little gas as possible, but each time you reforge, 5% of
        the PSI in the gem is burned. Once you activate it, the gem becomes a
        full NFT. It can no longer be reforged, but it can be transfered and
        sold on NFT exchanges. Burning a gem refunds the PSI tokens that were in
        it, minus 5%. You can burn a gem whether it is activated or not.
      </p>
      <h2>How are the gem images rendered and stored?</h2>
      <p>
        When you forge a gem, an event is emitted by the Deep Gems contract
        which is picked up by a server running the neural network. You can get
        the trained neural network{" "}
        <a href="https://colab.research.google.com/drive/1yh7C_GND4nV_VTiL-vl6I9twxNdCzdui">
          here
        </a>
        . The server parses the gem's seed and PSI level out of the tokenId, and
        feeds this information into the neural net to render the gem image. It
        then uploads the image to another server which serves it when you view
        it on this site, an NFT exchange, or any other site.
      </p>
      <p>
        This sounds kind of centralized, but it's not. When you forge or buy a
        gem, you are taking ownership of that gem's seed, which is irrevocably
        stored on the Ethereum blockchain. If this server were to ever go down,
        you could always recreate the gem image using the neural network that we
        have open sourced. You can even try it yourself right now. Copy a gem's
        tokenId from this site or an NFT exchange, and paste it into this{" "}
        <a href="https://colab.research.google.com/drive/1yh7C_GND4nV_VTiL-vl6I9twxNdCzdui">
          notebook
        </a>
        . The open source neural network will let you view the gem.
      </p>
      <h2>What is a GAN?</h2>
      <p>
        A GAN (or Generative Adversarial Network) is a neural network that is
        able to generate unique images from a random value called a "seed".
        We've trained our GAN (using the StyleGAN2-ADA architecure) on a dataset
        of 15,000 gemstones collected from around the internet, cleaned,
        cropped, and curated to keep only the finest specimens. The trained
        neural network is available{" "}
        <a href="https://colab.research.google.com/drive/1yh7C_GND4nV_VTiL-vl6I9twxNdCzdui">
          here
        </a>
        .
      </p>
      <h2>How does PSI work?</h2>
      <p>
        The StyleGAN2-ADA architecure takes a parameter called "truncation_psi",
        which determines how far from the average image in the dataset a result
        will be. This is the basis for the PSI token. Forging a gem with higher
        PSI increases this parameter, making the gem more unique. Forging a gem
        with 0 PSI outputs the average gemstone, and will always look the same.
      </p>
      <h2>How are the gem seeds generated? How random are they really?</h2>
      <p>
        Gems are intended to be random. However, we are using the Ethereum block
        hash as a random number, and this can be manipulated by miners. But
        given that a gem's value is only determined by how attractive it is,
        there isn't much harm in letting miners choose which gem they will mine.
        The only possible attack is one where a miner is able to forge a gem
        that looks exactly like another one that has already been forged (for
        example, a gem that sold for a lot of money). We take various steps to
        prevent this kind of attack.
      </p>
      <p>
        When you hit the "Forge" button, a gem's 128 bit seed is generated from
        3 different elements. The first is a counter of all gems (the "edition
        number"). This takes up the vast majority of the seed, 120 bits. Then we
        take 4 bits of the block hash of the block one block ago, and 4 bits of
        the block hash 255 blocks ago. So a malicious miner can at most choose
        between 256 (2^8) different gems at each counter number. A malicious
        miner could also try to manipulate the counter, by forging a large
        number of gems in a block (remember, if they mine the block themselves,
        they don't have to pay gas for each forging). We constrain this by
        making the minimum amount of PSI that you can forge a gem with 0.1 PSI.
        A miner would have to spend a lot of money buying PSI to be able to
        search for an identical-looking gem.
      </p>
    </div>
  );
}

export default App;
