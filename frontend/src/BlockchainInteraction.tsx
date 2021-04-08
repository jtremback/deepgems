import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { BigNumber, ethers } from "ethers";
import {
  Button,
  TextInput,
  IMAGES_CDN,
  GemThumbnail,
  LargeGem,
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
          paddingTop: 40,
          paddingBottom: 40,
        }}
      >
        <>
          <BuyPSIBox blockchain={blockchain} setModalData={setModalData} />
          <ForgeAGemBox blockchain={blockchain} userData={userData} />
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

// If there is a number entered into the buy or sell box, the blockchain should be polled to get the current price
//

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
          style={mode === "buy" ? {} : { color: "grey", cursor: "pointer" }}
        >
          Buy PSI
        </h2>
        <h2
          onClick={() => setMode("sell")}
          style={mode === "sell" ? {} : { color: "grey", cursor: "pointer" }}
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

export function Modal({
  modalData,
  blockchain,
}: {
  modalData: ModalData;
  blockchain: Blockchain;
}) {
  switch (modalData.type) {
    case "GemModal":
      return (
        <div
          style={{
            width: 384,
          }}
        >
          <div
            style={{
              width: 384,
              height: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LargeGem gem={modalData.gem} />
          </div>
          <div
            style={{
              display: modalData.gem.activated ? "none" : "flex",
              marginBottom: 10,
            }}
          >
            <div style={{ marginRight: 10 }}>
              <Button
                onClick={() => {
                  blockchain!.gems.reforge(modalData.gem.id);
                }}
              >
                Reforge
              </Button>
            </div>
            <div style={{ fontSize: 16 }}>
              Reforging a gem creates a new gem using this gem's PSI.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginBottom: 10,
            }}
          >
            <div style={{ marginRight: 10 }}>
              <Button
                onClick={() => {
                  blockchain!.gems.burn(modalData.gem.id);
                }}
              >
                Burn
              </Button>
            </div>
            <div style={{ fontSize: 16 }}>
              Burning a gem destroys the gem and adds the PSI to your account.
            </div>
          </div>

          <div
            style={{
              marginBottom: 10,
              display: modalData.gem.activated ? "none" : "flex",
            }}
          >
            <div style={{ marginRight: 10 }}>
              <Button
                onClick={() => {
                  blockchain!.gems.activate(modalData.gem.id);
                }}
              >
                Activate
              </Button>
            </div>
            <div style={{ fontSize: 16 }}>
              Activating a gem turns it into a full NFT and allows you to
              transfer it and trade it on NFT exchanges.
            </div>
          </div>
          <div
            style={{
              fontSize: 16,
              display: modalData.gem.activated ? "flex" : "none",
            }}
          >
            This gem has been activated and can be transferred to other accounts
            and traded on NFT exchanges.
          </div>
        </div>
      );
  }
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
    setPsiInputAmount(psiInputBigNum);
  }

  return (
    <div style={{ background: "rgb(27,23,20)", padding: 40 }}>
      <h2>Forge a Gem</h2>
      <form>
        <p>Amount of PSI to forge the gem with:</p>
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
