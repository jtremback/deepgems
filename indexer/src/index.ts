import fetch from "node-fetch";
import { ethers } from "ethers";
import fs from "fs";
import AWS from "aws-sdk";
import { DeepGems } from "../../solidity/typechain/DeepGems";
const gemArtifact = require("../../solidity/artifacts/contracts/DeepGems.sol/DeepGems.json");

const {
  S3_JSON_CONTEXT_URL,
  BLOCKS_PER_FETCH,
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
}: {
  S3_JSON_CONTEXT_URL: string;
  BLOCKS_PER_FETCH: string;
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

const provider = new ethers.providers.InfuraProvider("rinkeby", INFURA_KEY);

const gems = new ethers.Contract(
  GEMS_CONTRACT,
  gemArtifact.abi,
  provider
) as DeepGems;

console.log("Foo", provider);

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
  lastBlockRetrieved: number;
  userIndex: string[];
}

async function run() {
  const rawContext = await (await fetch(S3_JSON_CONTEXT_URL)).json();
  const context: Context = {
    lastBlockRetrieved: parseInt(rawContext.lastBlockRetrieved, 10),
    userIndex: rawContext.userIndex,
  };

  // Populate users mapping
  const userMapping: UserMapping = {};
  for (const userAddr of context.userIndex) {
    userMapping[userAddr] = await getUserGems(userAddr);
  }

  console.log(
    `Getting events from ${context.lastBlockRetrieved} to ${
      context.lastBlockRetrieved + parseInt(BLOCKS_PER_FETCH, 10)
    }`
  );

  console.log("gems.address", gems.address);

  const currentBlock = 42069;

  const highestBlockToGet = Math.max(
    currentBlock,
    context.lastBlockRetrieved + parseInt(BLOCKS_PER_FETCH, 10)
  );

  // Get events
  const events = await gems.queryFilter(
    {
      address: gems.address,
      topics: [
        FORGED_EVENT_TOPIC,
        REFORGED_EVENT_TOPIC,
        BURNED_EVENT_TOPIC,
        ACTIVATED_EVENT_TOPIC,
        // TRANSFERED_EVENT_TOPIC,
      ],
    },
    context.lastBlockRetrieved,
    highestBlockToGet
  );

  console.log(`Got ${events.length} events`);
  console.log(`Events: ${JSON.stringify(events)}`);

  // Index events
  const highestBlockInEvents = await indexEvents(context, userMapping, events);

  // Save state
  // Upload each user
  for (const userAddr of Object.keys(userMapping)) {
    uploadToS3(
      Buffer.from(JSON.stringify(userMapping[userAddr])),
      S3_DATA_BUCKET,
      `${userAddr}.json`
    );
  }

  // Upload context
  context.lastBlockRetrieved = highestBlock;
  context.userIndex = Object.keys(userMapping);

  uploadToS3(
    Buffer.from(JSON.stringify(context)),
    S3_DATA_BUCKET,
    `context.json`
  );
}

async function indexEvents(
  context: Context,
  userMapping: UserMapping,
  events: ethers.Event[]
) {
  let highestBlock = 0;
  for (const event of events) {
    if (event.blockNumber > highestBlock) {
      highestBlock = event.blockNumber;
    }

    switch (event.event) {
      case "Forged":
        await indexForgedEvent(context, userMapping, event);
        break;

      case "Reforged":
        await indexReforgedEvent(context, userMapping, event);
        break;

      case "Activated":
        await indexActivatedEvent(context, userMapping, event);
        break;

      case "Burned":
        await indexBurnedEvent(context, userMapping, event);
        break;

      case "Transfer":
        await indexTransferEvent(context, userMapping, event);
        break;

      default:
        throw new Error("Unknown event");
    }
  }
  return highestBlock;
}

async function indexForgedEvent(
  context: Context,
  userMapping: UserMapping,
  event: ethers.Event
) {
  const tokenId = event.args!._id;
  const owner = event.args!._owner;

  // It is impossible for a gem to already exist
  if (userMapping[owner].gems[tokenId]) {
    throw new Error("Found exisiting gem during forged event index");
  }

  if (!userMapping[owner]) {
    // Update user entry
    userMapping[owner] = { gems: {} };
  }

  userMapping[owner].gems[tokenId] = { activated: false };
  await renderGem(tokenId);
}

async function indexReforgedEvent(
  context: Context,
  userMapping: UserMapping,
  event: ethers.Event
) {
  const owner = event.args!.owner;
  const oldTokenId = event.args!.oldTokenId;
  const newTokenId = event.args!.newTokenId;

  // It is impossible for the old gem not to exist
  if (!userMapping[owner].gems[oldTokenId]) {
    throw new Error(
      "Did not find existing old gem during reforged event index"
    );
  }

  // It is impossible for the new gem to already exist
  if (userMapping[owner].gems[newTokenId]) {
    throw new Error("Found exisiting new gem during reforged event index");
  }

  // Update user entry
  delete userMapping[owner].gems[oldTokenId];
  userMapping[owner].gems[newTokenId] = { activated: false };
  await renderGem(newTokenId);
}

async function renderGem(tokenId: string) {
  // Get metadata
  const metdata = await gems.getGemMetadata(tokenId);
  // Upload image to s3
  const img = await (
    await fetch(`${RENDERER_URL}/${JSON.stringify(metdata)}`)
  ).buffer();

  uploadToS3(img, S3_IMAGE_BUCKET, `${tokenId}.jpg`);
}

async function indexActivatedEvent(
  context: Context,
  userMapping: UserMapping,
  event: ethers.Event
) {
  const tokenId = event.args!._id;
  const owner = event.args!._owner;

  // It is impossible for the unactivated gem not to exist
  if (!userMapping[owner].gems[tokenId]) {
    throw new Error("Did not find existing gem during activated event index");
  }

  // It is impossible for the unactivated gem to be activated
  if (userMapping[owner].gems[tokenId].activated) {
    throw new Error("Gem was already activated during activated event index");
  }

  // Update user entry
  userMapping[owner].gems[tokenId].activated = true;
}

async function indexTransferEvent(
  context: Context,
  userMapping: UserMapping,
  event: ethers.Event
) {
  const from = event.args!.from;
  const to = event.args!.to;
  const tokenId = event.args!.tokenId;

  // Gem must exist
  if (!userMapping[from].gems[tokenId]) {
    throw new Error("Gem did not exist during transfer event index");
  }

  // Gem must be activated
  if (!userMapping[from].gems[tokenId].activated) {
    throw new Error("Gem was not activated during transfer event index");
  }

  // Update user entries
  userMapping[to].gems[tokenId] = userMapping[from].gems[tokenId];
  delete userMapping[from].gems[tokenId];
}

async function indexBurnedEvent(
  context: Context,
  userMapping: UserMapping,
  event: ethers.Event
) {
  const owner = event.args!.owner;
  const tokenId = event.args!.tokenId;

  // Update user entry
  delete userMapping[owner].gems[tokenId];
}

function getUserGems(addr: string) {
  return { gems: { foo: { activated: true } } };
}

function uploadToS3(data: Buffer, bucket: string, key: string) {
  // Read content from the file
  // const fileContent = fs.readFileSync("f");

  // Setting up S3 upload parameters
  const params = {
    Body: data,
    Bucket: bucket,
    Key: key, // File name you want to save as in S3
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
