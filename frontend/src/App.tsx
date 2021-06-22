import { CSSProperties, useEffect, useState } from "react";
import background from "./background.jpg";
import "./App.css";
import psi50example from "./images/00056-000032-0.5.jpg";
import psi100example from "./images/00056-000032-1.jpg";
import psi200example from "./images/00056-000032-2.jpg";
import psi300example from "./images/00056-000032-3.jpg";
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
        {recentGems && (
          <RecentGems gemData={recentGems} setModalData={setModalData} />
        )}
        <div
          style={{
            ...fontStyles,
            maxWidth: "1024px",
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
          <FAQ />
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
          alignContent: "flex-end",
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
        In a world of infinite reproducibility, the most precious asset is
        uniqueness. Deep Gems is a GAN trained on a dataset of precious
        gemstones and hooked up to the blockchain. Deep Gems allows you to
        create and own completely unique virtual gemstones as NFTs. Nobody knows
        what a Deep Gem will look like before the moment you forge it.
      </p>
      <h2>Forging gems with PSI</h2>
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
        PSI can be bought on a bonding curve. The more PSI gets bought, the
        higher the price goes. At the 2,500,000 PSI supply cap, the curve stops,
        and no more PSI can be bought. At this point, you'll have to try to buy
        it on the open market. Every time anyone reforges or burns a gem, 5% of
        the PSI in that gem is locked forever, permanently reducing the
        circulating supply. 250,000 PSI has been pre-minted by the artist.
      </p>
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
        [psi50example, "50 PSI"],
        [psi100example, "100 PSI"],
        [psi200example, "400 PSI"],
        [psi300example, "900 PSI"],
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
        The Deep Gems bonding curve exists to bootstrap liquidity, and it will
        not last forever. It is a true bonding curve, meaning that you can not
        only buy PSI from it, but also sell PSI back to it with no fee. The
        supply is capped at 2,500,000 PSI. After this, no more PSI can be bought
        from the curve. After this point, people wanting to buy PSI will have to
        buy it from an exchange, such as Uniswap.
      </p>
      <p>250,000 PSI (10%) has been allocated to the artist.</p>
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
