var http = require("http");
import fetch from "make-fetch-happen";
import { ethers } from "ethers";
import fs from "fs";
import AWS from "aws-sdk";
import { DeepGems } from "../../solidity/typechain/DeepGems";
import { createNotEmittedStatement } from "typescript";
import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
const gemArtifact = require("../../solidity/artifacts/contracts/DeepGems.sol/DeepGems.json");

const {
  S3_JSON_CONTEXT_URL,
  GEMS_PER_FETCH,
  RENDERER_URL,
  S3_DATA_BUCKET,
  S3_IMAGE_BUCKET,
  LOOP_TIME,
  FORGED_EVENT_TOPIC,
  REFORGED_EVENT_TOPIC,
  BURNED_EVENT_TOPIC,
  ACTIVATED_EVENT_TOPIC,
  TRANSFERED_EVENT_TOPIC,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  INFURA_KEY,
  GEMS_CONTRACT,
  GRAPHQL_URL,
}: {
  S3_JSON_CONTEXT_URL: string;
  GEMS_PER_FETCH: string;
  RENDERER_URL: string;
  S3_DATA_BUCKET: string;
  S3_IMAGE_BUCKET: string;
  LOOP_TIME: string;
  FORGED_EVENT_TOPIC: string;
  REFORGED_EVENT_TOPIC: string;
  BURNED_EVENT_TOPIC: string;
  ACTIVATED_EVENT_TOPIC: string;
  TRANSFERED_EVENT_TOPIC: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  INFURA_KEY: string;
  GEMS_CONTRACT: string;
  GRAPHQL_URL: string;
} = process.env as any;

function loop() {
  try {
    run();
  } catch (e) {
    console.error(e);
  }
  setTimeout(() => {
    loop();
  }, parseInt(LOOP_TIME, 10));
}

// const provider = new ethers.providers.InfuraProvider("rinkeby", INFURA_KEY);
const provider = new ethers.providers.JsonRpcProvider();

const gems = new ethers.Contract(
  GEMS_CONTRACT,
  gemArtifact.abi,
  provider
) as DeepGems;

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

interface UserAccount {
  gems: { [key: string]: { activated: boolean } };
}

interface UserMapping {
  [key: string]: UserAccount;
}

interface Context {
  lastGemRetrieved: number;
  // userIndex: string[];
}

const query = `query GetGems($gt: Int!, $lte: Int!) {
  gems(where: {
    number_gt: $gt,
		number_lte: $lte
  }, orderBy: number, orderDirection: asc){
    id
    psi
    owner
    burned
    forgeTime
    forgeBlock
    number
  }
}`;

const highestGemQuery = `{
  gems(orderBy: number, orderDirection: desc, first:1){
    number
  }
}`;

async function getHighestGem() {
  const res = await (
    await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: highestGemQuery }),
    })
  ).json();

  return res.data.gems[0].number;
}

async function getForgedGems(gt: number, lte: number) {
  const res = await (
    await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables: { gt, lte } }),
    })
  ).json();
  return res.data.gems;
}

async function run() {
  const rawContext = await (await fetch(S3_JSON_CONTEXT_URL)).json();
  const { lastGemRetrieved }: Context = {
    lastGemRetrieved: parseInt(rawContext.lastGemRetrieved, 10),
  };

  const currentGem = await getHighestGem();

  console.log("lastGemRetrieved", lastGemRetrieved, "currentGem", currentGem);

  if (lastGemRetrieved > currentGem) {
    throw new Error(
      "Stored last gem retrieved is higher than current gem in graph index"
    );
  }

  const gems = await getForgedGems(
    lastGemRetrieved,
    lastGemRetrieved + parseInt(GEMS_PER_FETCH, 10)
  );

  console.log(`Got ${gems.length} events`);

  for (const gem of gems) {
    console.log("render gem: ", gem);
    await renderGem(gem.id);
  }

  // Upload context
  uploadToS3(
    Buffer.from(
      JSON.stringify({
        lastGemRetrieved:
          gems.length > 0 ? gems[gems.length - 1].number : lastGemRetrieved,
      })
    ),
    S3_DATA_BUCKET,
    `context.json`,
    "application/json"
  );
}

async function renderGem(tokenId: string) {
  // Get metadata
  let metadata = await gems.getGemMetadata(tokenId);

  // Render gem
  const img = await (
    await fetch(
      `${RENDERER_URL}/${JSON.stringify([
        metadata[0],
        metadata[1],
        metadata[2],
        metadata[3],
        metadata[4] / 100,
      ])}`
    )
  ).buffer();

  // Upload image to s3
  uploadToS3(img, S3_IMAGE_BUCKET, `${tokenId}.jpg`, "image/jpeg");
}

function uploadToS3(
  data: Buffer,
  bucket: string,
  key: string,
  contentType: string
) {
  // Setting up S3 upload parameters
  const params: AWS.S3.PutObjectRequest = {
    Body: data,
    Bucket: bucket,
    Key: key, // File name you want to save as in S3
    ContentType: contentType,
  };

  // Uploading files to the bucket
  s3.upload(params, function (err: Error, data: AWS.S3.ManagedUpload.SendData) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
}

loop();
