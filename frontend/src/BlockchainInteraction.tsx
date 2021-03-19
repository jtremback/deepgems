import React, { ReactNode, useState } from "react";
import background from "./background.jpg";
import "./App.css";
import psi0example from "./images/0psi.jpg";
import psi100example from "./images/100psi.jpg";
import psi300example from "./images/300psi.jpg";
import useAPIPolling, { APIPollingOptions } from "use-api-polling";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { DeepGems } from "../../solidity/typechain/DeepGems";
import { PSI } from "../../solidity/typechain/PSI";
import { Button, TextInput, GemSpinner } from "./GenericComponents";
import { UserData } from "./API";
const gemArtifact = require("./DeepGems.json");
const psiArtifact = require("./PSI.json");

const GRAPHQL_URL = "http://localhost:8000/subgraphs/name/jtremback/deepgems";
const IMAGES_CDN = "https://deepgemscache.s3.us-west-2.amazonaws.com/";
const GEMS_CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PSI_CONTRACT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const fe = ethers.utils.formatEther;
const pe = ethers.utils.parseEther;

export type Blockchain = {
  provider: ethers.providers.Web3Provider;
  gems: DeepGems;
  psi: PSI;
};

export function BlockchainInteraction({
  connectProvider,
  blockchain,
  userData,
}: {
  connectProvider: () => void;
  blockchain?: Blockchain;
  userData?: UserData;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          paddingTop: 40,
          paddingBottom: 40,
        }}
      >
        <>
          <BuyPSIBox blockchain={blockchain} />
          <ForgeAGemBox userData={userData} />
        </>
      </div>
      {blockchain && <YourGems />}
      {!blockchain && (
        <div
          style={{
            position: "absolute",
            background: "rgba(0,0,0,0.8)",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button onClick={connectProvider}>Connect Wallet</Button>
        </div>
      )}
    </div>
  );
}

function BuyPSIBox({ blockchain }: { blockchain?: Blockchain }) {
  const [state, setState] = useState<{
    mode: "buy" | "sell";
    buyForm: string;
    sellForm: string;
  }>({
    mode: "buy",
    buyForm: "",
    sellForm: "",
  });
  const [psiEstimates, setPsiEstimates] = useState<{
    estimatedBuyEth?: string;
    estimatedSellEth?: string;
  }>({});
  const [debounceIDs, setDebounceIDs] = useState<{
    buyFormDebounceID?: NodeJS.Timeout;
    sellFormDebounceID?: NodeJS.Timeout;
  }>({});

  function setFormFactory(
    estimatedKey: string,
    inputKey: string,
    debounceKey: "buyFormDebounceID" | "sellFormDebounceID",
    blockchainFunctionKey: string
  ) {
    return (input: string) => {
      // Set form state
      setState({
        ...state,
        [inputKey]: input,
      });

      const debounceID = debounceIDs[debounceKey];

      // Cancel previous request
      if (debounceID) {
        clearTimeout(debounceID);
      }

      const toBuy = parseInt(input, 10);
      console.log("toBuy", toBuy);
      if (isNaN(toBuy)) {
        // Set it to NaN without making the query
        setPsiEstimates({
          ...psiEstimates,
          [estimatedKey]: undefined,
        });
        return;
      }

      // Set to undefined to get loading spinner
      setPsiEstimates({ ...psiEstimates, [estimatedKey]: undefined });

      const timeoutID = setTimeout(async () => {
        const toBuyBigNum = pe(`${toBuy}`);
        setPsiEstimates({
          ...psiEstimates,
          [estimatedKey]:
            fe(await blockchain!.psi[blockchainFunctionKey](toBuyBigNum)) +
            " ETH",
        });
      }, 1000);

      setDebounceIDs({ ...debounceIDs, [debounceKey]: timeoutID });
    };
  }

  const setBuyForm = setFormFactory(
    "estimatedBuyEth",
    "buyForm",
    "buyFormDebounceID",
    "quoteMint"
  );

  const setSellForm = setFormFactory(
    "estimatedSellEth",
    "sellForm",
    "sellFormDebounceID",
    "quoteBurn"
  );

  return (
    <div style={{ background: "rgb(27,23,20)", padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2
          onClick={() => setState({ ...state, mode: "buy" })}
          style={
            state.mode == "buy" ? {} : { color: "grey", cursor: "pointer" }
          }
        >
          Buy PSI
        </h2>
        <h2
          onClick={() => setState({ ...state, mode: "sell" })}
          style={
            state.mode == "sell" ? {} : { color: "grey", cursor: "pointer" }
          }
        >
          Sell PSI
        </h2>
      </div>
      {state.mode == "buy" ? (
        <form>
          <p>Amount of PSI to buy:</p>
          <p>
            <TextInput input={state.buyForm} setInput={setBuyForm} />
          </p>
          <p>Estimated ETH required:</p>
          <p style={{ fontFamily: "Inconsolata" }}>
            {psiEstimates.estimatedBuyEth
              ? psiEstimates.estimatedBuyEth
              : "..."}
          </p>
          <Button>Buy</Button>
        </form>
      ) : (
        <form>
          <p>Amount of PSI to sell:</p>
          <p>
            <TextInput input={state.sellForm} setInput={setSellForm} />
          </p>
          <p>Estimated ETH earned:</p>
          <p style={{ fontFamily: "Inconsolata" }}>
            {psiEstimates.estimatedSellEth
              ? psiEstimates.estimatedSellEth
              : "..."}
          </p>
          <Button>Sell</Button>
        </form>
      )}
    </div>
  );
}

function ForgeAGemBox({
  userData,
  blockchain,
}: {
  userData?: UserData;
  blockchain?: Blockchain;
}) {
  const [state, setState] = useState<{
    psiForm: string;
  }>({
    psiForm: "",
  });

  function setPsiForm(input: string) {
    setState({ ...state, psiForm: input });
  }

  return (
    <div style={{ background: "rgb(27,23,20)", padding: 40 }}>
      <h2>Forge a Gem</h2>
      <form>
        <p>Amount of PSI to forge the gem with:</p>
        <p>
          <TextInput input={state.psiForm} setInput={setPsiForm} />
        </p>
        <p>Your PSI balance:</p>
        <p style={{ fontFamily: "Inconsolata" }}>
          {userData && fe(userData.psiBalance)} PSI
        </p>
        <Button onClick={() => blockchain!.gems.forge(pe(state.psiForm))}>
          Forge
        </Button>
      </form>
    </div>
  );
}

function YourGems() {
  return (
    <>
      <h2>Your gems:</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => {
          return <PendingGem style={{ margin: 5 }} />;
        })}
      </div>
    </>
  );
}

function PendingGem({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "grey",
        borderRadius: 1000,
        width: 100,
        height: 100,
        ...style,
      }}
    >
      <div
        style={{
          filter: "blur(15px)",
          overflow: "hidden",
        }}
      >
        <div className="hue-rotate">
          <GemSpinner />
        </div>
      </div>
    </div>
  );
}
