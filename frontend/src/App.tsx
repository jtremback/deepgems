import React, { ReactNode } from "react";
import background from "./background.jpg";
import "./App.css";
import psi0example from "./images/0psi.jpg";
import psi100example from "./images/100psi.jpg";
import psi300example from "./images/300psi.jpg";

function App() {
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

      <div style={{ overflow: "hidden", width: "100%", whiteSpace: "nowrap" }}>
        {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => {
          return (
            <div
              style={{
                width: 300,
                height: 300,
                background: "white",
                borderRadius: 10000,
                marginRight: 40,
                marginBottom: 40,
                display: "inline-block",
              }}
            ></div>
          );
        })}
      </div>
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          <BuyPSIBox />
          <MineAGemBox />
        </div>
        <YourGems />
      </div>
    </div>
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

function BuyPSIBox() {
  return (
    <div style={{ background: "rgb(27,23,20)", padding: 40 }}>
      <h2>Buy PSI</h2>
      <form>
        <p>Amount of PSI to buy:</p>
        <p>
          <TextInput />
        </p>
        <p>Estimated ETH required:</p>
        <p style={{ fontFamily: "Inconsolata" }}>0.003 ETH</p>
        <Button>Buy</Button>
      </form>
    </div>
  );
}

function MineAGemBox() {
  return (
    <div style={{ background: "rgb(27,23,20)", padding: 40 }}>
      <h2>Mine a Gem</h2>
      <form>
        <p>Amount of PSI to put in the gem:</p>
        <p>
          <TextInput />
        </p>
        <p>Your PSI balance:</p>
        <p style={{ fontFamily: "Inconsolata" }}>104.32930302 PSI</p>
        <Button>Mine</Button>
      </form>
    </div>
  );
}

function StatusBar() {
  return (
    <div
      style={{
        width: "100%",
        background: "rgb(27,23,20)",
        padding: 10,
        fontFamily: "Inconsolata",
      }}
    >
      Your PSI balance: 0.0022
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
          <Spinner />
        </div>
      </div>
    </div>
  );
}

function TextInput({ style }: { style?: React.CSSProperties }) {
  return (
    <input
      style={{
        backgroundColor: "grey",
        paddingLeft: 10,
        paddingRight: 10,
        display: "block",
        fontFamily: "Inconsolata",
        ...style,
      }}
      type="text"
    />
  );
}

function Button({ children }: { children: ReactNode }) {
  return (
    <button
      style={{
        fontFamily: "Bebas Neue",
        background: "blue",
        display: "block",
        padding: "10px 20px",
      }}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      width="100px"
      height="100px"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <g transform="translate(50 50)">
        <g transform="scale(0.7)">
          <g transform="translate(-50 -50)">
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                repeatCount="indefinite"
                values="0 50 50;360 50 50"
                keyTimes="0;1"
                dur="0.7575757575757576s"
              ></animateTransform>
              <path
                fill-opacity="0.8"
                fill="#ea3f34"
                d="M50 50L50 0A50 50 0 0 1 100 50Z"
              ></path>
            </g>
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                repeatCount="indefinite"
                values="0 50 50;360 50 50"
                keyTimes="0;1"
                dur="1.0101010101010102s"
              ></animateTransform>
              <path
                fill-opacity="0.8"
                fill="#f2982c"
                d="M50 50L50 0A50 50 0 0 1 100 50Z"
                transform="rotate(90 50 50)"
              ></path>
            </g>
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                repeatCount="indefinite"
                values="0 50 50;360 50 50"
                keyTimes="0;1"
                dur="1.5151515151515151s"
              ></animateTransform>
              <path
                fill-opacity="0.8"
                fill="#52a360"
                d="M50 50L50 0A50 50 0 0 1 100 50Z"
                transform="rotate(180 50 50)"
              ></path>
            </g>
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                repeatCount="indefinite"
                values="0 50 50;360 50 50"
                keyTimes="0;1"
                dur="3.0303030303030303s"
              ></animateTransform>
              <path
                fill-opacity="0.8"
                fill="#674794"
                d="M50 50L50 0A50 50 0 0 1 100 50Z"
                transform="rotate(270 50 50)"
              ></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default App;
