import React, { useState } from "react";
import "./App.css";
import { BigNumber, ethers } from "ethers";
import {
  Button,
  TextInput,
  IMAGES_CDN,
  GemThumbnail,
  LargeGem,
  useInterval,
  fontStyles,
} from "./Shared";
import { GemData, UserData, Blockchain, ModalData } from "./Types";

const fe = ethers.utils.formatEther;
const pe = ethers.utils.parseEther;

export function BlockchainInteraction({
  connectProvider,
  blockchain,
  userData,
  setModalData,
}: {
  connectProvider: () => void;
  blockchain?: Blockchain;
  userData?: UserData;
  setModalData: (x: ModalData) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          paddingTop: 40,
          paddingBottom: 40,
        }}
      >
        <>
          <BuyPSIBox blockchain={blockchain} setModalData={setModalData} />
          {/* <ForgeAGemBox blockchain={blockchain} userData={userData} /> */}
        </>
      </div>
      {blockchain && (
        <YourGems
          blockchain={blockchain!}
          userData={userData!}
          setModalData={setModalData}
        />
      )}
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

function BuyPSIBox({
  blockchain,
  setModalData,
}: {
  blockchain?: Blockchain;
  setModalData: (x: ModalData) => void;
}) {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [formStates, setFormStates] = useState<{
    buy: string;
    sell: string;
  }>({
    buy: "",
    sell: "",
  });
  const [psiInputAmounts, setPsiInputAmounts] = useState<{
    buy?: BigNumber;
    sell?: BigNumber;
  }>({});
  const [ethEstimates, setEthEstimates] = useState<{
    buy?: BigNumber;
    sell?: BigNumber;
  }>({});
  const [debounceIDs, setDebounceIDs] = useState<{
    buy?: NodeJS.Timeout;
    sell?: NodeJS.Timeout;
  }>({});

  function setForm(type: "buy" | "sell", input: string) {
    // Set form state
    setFormStates({
      ...formStates,
      [type]: input,
    });

    const debounceID = debounceIDs[type];

    // Cancel previous request
    if (debounceID) {
      clearTimeout(debounceID);
    }

    let psiInputBigNum: BigNumber;
    // Try to parse input as bigNum.
    try {
      psiInputBigNum = pe(input);
    } catch (e) {
      // If it does not succeed, set the estimates and
      // the input amounts to undefined and exit
      setEthEstimates({
        ...ethEstimates,
        [type]: undefined,
      });
      setPsiInputAmounts({
        ...psiInputAmounts,
        [type]: undefined,
      });
      return;
    }

    // if it does succeed set the input amounts and prepare to make
    // delayed query
    setPsiInputAmounts({
      ...psiInputAmounts,
      [type]: psiInputBigNum,
    });

    // Set to undefined to get loading spinner
    setEthEstimates({ ...ethEstimates, [type]: undefined });

    // Set timeout to make request and set estimate
    const timeoutID = setTimeout(async () => {
      const estimate =
        type === "buy"
          ? await blockchain!.psi.quoteBuy(psiInputBigNum)
          : await blockchain!.psi.quoteSell(psiInputBigNum);
      setEthEstimates({
        ...ethEstimates,
        [type]: estimate,
      });
    }, 1000);

    setDebounceIDs({ ...debounceIDs, [type]: timeoutID });
  }

  async function formInterval(type: "buy" | "sell") {
    // If there is a correctly parsed psi input, get the estimate and
    // set it here. If the input did not parse correctly, this will be skipped
    if (psiInputAmounts[type]) {
      const estimate =
        type === "buy"
          ? await blockchain!.psi.quoteBuy(psiInputAmounts[type]!)
          : await blockchain!.psi.quoteSell(psiInputAmounts[type]!);
      setEthEstimates({
        ...ethEstimates,
        [type]: estimate,
      });
    }
  }

  useInterval(() => {
    if (mode === "buy") {
      formInterval("buy");
    } else {
      formInterval("sell");
    }
  }, 5000);

  return (
    <div style={{ background: "rgb(27,23,20)", padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2
          onClick={() => setMode("buy")}
          style={
            mode === "buy"
              ? { marginTop: 10 }
              : { color: "grey", cursor: "pointer", marginTop: 10 }
          }
        >
          Buy PSI
        </h2>
        <h2
          onClick={() => setMode("sell")}
          style={
            mode === "sell"
              ? { marginTop: 10 }
              : { color: "grey", cursor: "pointer", marginTop: 10 }
          }
        >
          Sell PSI
        </h2>
      </div>
      {mode === "buy" ? (
        <form>
          <p>Amount of PSI to buy:</p>
          <p>
            <TextInput
              input={formStates.buy}
              setInput={(input) => setForm("buy", input)}
            />
          </p>
          <p>Estimated ETH required:</p>
          <p style={{ fontFamily: "Inconsolata" }}>
            {ethEstimates.buy ? `${fe(ethEstimates.buy)} ETH` : "..."}
          </p>
          <Button
            active={!!psiInputAmounts.buy && !!ethEstimates.buy}
            onClick={() => {
              blockchain!.psi.buy(psiInputAmounts.buy!, {
                value: ethEstimates.buy!,
              });
            }}
          >
            Buy
          </Button>
        </form>
      ) : (
        <form>
          <p>Amount of PSI to sell:</p>
          <p>
            <TextInput
              input={formStates.sell}
              setInput={(input) => setForm("sell", input)}
            />
          </p>
          <p>Estimated ETH earned:</p>
          <p style={{ fontFamily: "Inconsolata" }}>
            {ethEstimates.sell ? `${fe(ethEstimates.sell)} ETH` : "..."}
          </p>
          <Button
            active={!!psiInputAmounts.sell && !!ethEstimates.sell}
            onClick={() => {
              blockchain!.psi.sell(psiInputAmounts.sell!, ethEstimates.sell!);
            }}
          >
            Sell
          </Button>
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
  const [psiForm, setPsiForm] = useState("");
  const [psiInputAmount, setPsiInputAmount] = useState<BigNumber>();

  function setForm(input: string) {
    // Set form state
    setPsiForm(input);
    let psiInputBigNum: BigNumber;
    // Try to parse input as bigNum.
    try {
      psiInputBigNum = pe(input);
    } catch (e) {
      // Set to undefined if it doesn't work
      setPsiInputAmount(undefined);
      return;
    }
    // Check if PSI is enough to forge a gem
    if (psiInputBigNum.lt(pe("0.1"))) {
      setPsiInputAmount(undefined);
      return;
    }
    setPsiInputAmount(psiInputBigNum);
  }

  return (
    <div style={{ background: "rgb(27,23,20)", padding: 40 }}>
      <h2 style={{ marginTop: 10 }}>Forge a Gem</h2>
      <form>
        <p style={{ marginBottom: 0 }}>Amount of PSI to forge the gem with:</p>
        <p style={{ marginTop: 0, fontSize: 16 }}>(must be 0.1 or greater)</p>
        <p>
          <TextInput input={psiForm} setInput={setForm} />
        </p>
        <p>Your PSI balance:</p>
        <p style={{ fontFamily: "Inconsolata" }}>
          {userData && fe(userData.psiBalance)} PSI
        </p>
        <Button
          onClick={() => {
            console.log("forging");
            psiInputAmount && blockchain!.gems.forge(psiInputAmount);
          }}
          active={!!psiInputAmount && psiInputAmount.lte(userData!.psiBalance)}
        >
          Forge
        </Button>
      </form>
    </div>
  );
}

function YourGems({
  userData,
  blockchain,
  setModalData,
}: {
  userData: UserData;
  blockchain: Blockchain;
  setModalData: (x: ModalData) => void;
}) {
  return (
    <>
      <h2>Your gems:</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {userData &&
          userData.gems.map((gem) => {
            return (
              <GemThumbnail
                style={{ margin: 5 }}
                gem={gem}
                setModalData={setModalData}
              />
            );
          })}
      </div>
    </>
  );
}
