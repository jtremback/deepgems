import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useState,
  useRef,
} from "react";
import "./App.css";
import { GemData, ModalData, Blockchain } from "./Types";

export const IMAGES_CDN = "https://cdn.deepge.ms/";
export const METADATA_CDN = "https://cdn.deepge.ms/metadata/";
export const GRAPHQL_URL =
  "https://api.thegraph.com/subgraphs/name/jtremback/deepgems";
export const GEMS_CONTRACT = "0xDCD459D3075Af74A6C420E16F191b59a174Fc887";
export const PSI_CONTRACT = "0xc5E5757Bdb6B2B7160b5fEF8571671DD7042F38A";
export const PSI_STATS_URL =
  "https://s3-us-west-2.amazonaws.com/cdn.deepge.ms/psiStats.json";

export const fontStyles: CSSProperties = {
  fontSize: 24,
  fontWeight: "lighter",
  color: "white",
  backgroundColor: "rgba(0,0,0,0.7)",
};

export function Modal({
  modalData,
  blockchain,
  setModalData,
}: {
  modalData: ModalData;
  blockchain: Blockchain;
  setModalData: (x?: ModalData) => void;
}) {
  return (
    modalData && (
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
          {" "}
          {(() => {
            switch (modalData.type) {
              case "MyGemModal":
                return (
                  <MyGemModal blockchain={blockchain!} modalData={modalData} />
                );
              case "TheirGemModal":
                return (
                  <TheirGemModal
                    blockchain={blockchain!}
                    modalData={modalData}
                  />
                );
            }
          })()}
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
    )
  );
}

export function MyGemModal({
  modalData,
  blockchain,
}: {
  modalData: ModalData;
  blockchain: Blockchain;
}) {
  return (
    <div
      style={{
        width: 384,
      }}
    >
      <div
        style={{
          width: 384,
          // height: 280,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LargeGem gem={modalData.gem} />
      </div>
      <div
        style={{
          color: "white",
          textAlign: "center",
          fontSize: 16,
          marginTop: 20,
          marginBottom: 20,
          display: "flex",
        }}
      >
        <div>tokenId:</div>
        <input
          style={{
            backgroundColor: "grey",
            marginLeft: 5,
            fontSize: 14,
            width: "22em",
            display: "block",
            fontFamily: "Inconsolata",
          }}
          type="text"
          value={modalData.gem.id}
        />
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
          Activating a gem turns it into a full NFT and allows you to transfer
          it and trade it on NFT exchanges.
        </div>
      </div>
      <div
        style={{
          fontSize: 16,
          display: modalData.gem.activated ? "flex" : "none",
        }}
      >
        This gem has been activated and can be transferred to other accounts and
        traded on NFT exchanges.
      </div>
    </div>
  );
}

export function TheirGemModal({
  modalData,
  blockchain,
}: {
  modalData: ModalData;
  blockchain: Blockchain;
}) {
  return (
    <div
      style={{
        width: 384,
      }}
    >
      <div
        style={{
          width: 384,
          // height: 280,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LargeGem gem={modalData.gem} />
      </div>
      <div
        style={{
          color: "white",
          textAlign: "center",
          fontSize: 16,
          marginTop: 20,
          marginBottom: 20,
          display: "flex",
        }}
      >
        <div>tokenId:</div>
        <input
          style={{
            backgroundColor: "grey",
            marginLeft: 5,
            fontSize: 14,
            width: "22em",
            display: "block",
            fontFamily: "Inconsolata",
          }}
          type="text"
          value={modalData.gem.id}
        />
      </div>
    </div>
  );
}

export function TextInput({
  style,
  setInput,
  input,
}: {
  style?: React.CSSProperties;
  setInput: (x: string) => void;
  input: string;
}) {
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
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  );
}

export function Button({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick?: React.MouseEventHandler;
  active?: boolean;
}) {
  if (active === undefined) {
    active = true;
  }
  return (
    <button
      onClick={active ? onClick : undefined}
      type="button"
      style={{
        fontFamily: "Bebas Neue",
        background: active ? "blue" : "gray",
        display: "block",
        padding: "10px 20px",
        cursor: active ? "pointer" : "auto",
      }}
    >
      {children}
    </button>
  );
}

export function LargeGem({
  style,
  gem,
}: {
  style?: React.CSSProperties;
  gem: GemData;
}) {
  const imageLink = `${IMAGES_CDN}${gem.id}.jpg`;
  const [showImage, setShowImage] = useState(true);

  // const forgeTime = formatDistanceToNowStrict(new Date(gem.forgeTime * 1000), {
  //   addSuffix: true,
  // });

  function onImageError() {
    setShowImage(false);
    setTimeout(() => {
      setShowImage(true);
    }, 1000);
  }
  return (
    <div
      style={{
        // display: "inline-block",
        background: "rgba(0,0,0,0.7)",
        margin: 5,
        ...style,
      }}
    >
      {showImage ? (
        <img
          style={{
            width: 200,
            height: 200,
          }}
          alt=""
          src={imageLink}
          onError={onImageError}
        />
      ) : (
        <CheapGemSpinner size={200} />
      )}
      <div style={{ color: "white", textAlign: "center", fontSize: 16 }}>
        {`#${gem.number} - ${gem.psi} PSI`}
      </div>
    </div>
  );
}

export function CheapGemSpinner({ size }: { size: number }) {
  return (
    <svg width={`${size}px`} height={`${size}px`} viewBox="0 0 128 128">
      <g>
        <path
          d="M64 128A64 64 0 0 1 18.34 19.16L21.16 22a60 60 0 1 0 52.8-17.17l.62-3.95A64 64 0 0 1 64 128z"
          fill="#ffffff"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 64 64"
          to="360 64 64"
          dur="2400ms"
          repeatCount="indefinite"
        ></animateTransform>
      </g>
    </svg>
  );
}

export function GemThumbnail({
  style,
  gem,
  setModalData,
}: {
  style?: React.CSSProperties;
  gem: GemData;
  setModalData: (x: ModalData) => void;
}) {
  const [showImage, setShowImage] = useState(true);

  function onImageError() {
    setShowImage(false);
    setTimeout(() => {
      setShowImage(true);
    }, 1000);
  }

  return (
    <div
      style={{
        width: 100,
        height: 100,
        overflow: "hidden",
        cursor: "pointer",
        ...style,
      }}
    >
      <div
        style={{
          overflow: "hidden",
        }}
        onClick={() =>
          setModalData({
            type: "MyGemModal",
            gem,
          })
        }
      >
        {showImage ? (
          <img
            style={{
              width: 100,
              height: 100,
            }}
            alt=""
            src={`${IMAGES_CDN}${gem.id}.jpg`}
            onError={onImageError}
          />
        ) : (
          <CheapGemSpinner size={100} />
        )}
      </div>
    </div>
  );
}

export function GemSpinner() {
  return (
    <svg
      width="100px"
      height="100px"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <defs>
        <filter id="f1" x="0" y="0">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
        </filter>
      </defs>
      <g transform="translate(50 50)" filter="url(#f1)">
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

export function useInterval(callback: () => void, delay: number) {
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
