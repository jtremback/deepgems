import React, { ReactNode, useEffect, useState, useRef } from "react";
import "./App.css";
import { GemData, ModalData } from "./Types";

export const IMAGES_CDN = "https://cdn.deepge.ms/";
export const METADATA_CDN = "https://cdn.deepge.ms/metadata/";
export const GRAPHQL_URL =
  "https://api.thegraph.com/subgraphs/name/jtremback/deepgems";
export const GEMS_CONTRACT = "0x8d471020BAD1903e3532604f42F107C4d80a930F";
export const PSI_CONTRACT = "0xC088Ce086712e54b7c6010398D183f150e126Da1";
export const PSI_STATS_URL =
  "https://s3-us-west-2.amazonaws.com/cdn.deepge.ms/psiStats.json";

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
        display: "inline-block",
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
          src={`${IMAGES_CDN}${gem.id}.jpg`}
          onError={onImageError}
        />
      ) : (
        <CheapGemSpinner size={200} />
      )}
      <div
        style={{ color: "white", textAlign: "center", fontSize: 16 }}
      >{`#${gem.number} - ${gem.psi} PSI`}</div>
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
            type: "GemModal",
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
