// Every tick, poll for newly mined gems
// // Get their ids and render gems for them,
// // Upload rendered gems to cache s3
// // Store metadata such as time, id, etc

// Polling
// Every tick, request all erc721 mint events since last one

// Rebuilding image cache
// Iterate over all gems on erc20, check if any are missing

import fetch from "node-fetch";
import ethers from "ethers";
import fs from "fs";
import AWS from "aws-sdk";
const gemAbi = require("../solidity/artifacts/contracts/DeepGems.sol/DeepGems.json");

const S3_JSON_CONTEXT_URL = "";
const BLOCKS_PER_FETCH = 10;
const RENDERER_URL = "";
const TEMP_IMG_FILE = "";
const S3_DATA_BUCKET = "";
const S3_IMAGE_BUCKET = "";
const TIMEOUT = 10000;

function loop() {
  run();
  setTimeout(() => {
    loop();
  }, TIMEOUT);
}

const provider = ethers.getDefaultProvider("homestead", {
  infura: "28b587d8cdde4eea926069342c002e01",
});

const gems = new ethers.Contract(
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  gemAbi,
  provider
);

const s3 = new AWS.S3({
  accessKeyId: "",
  secretAccessKey: "",
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
  const context: Context = await (await fetch(S3_JSON_CONTEXT_URL)).json();

  // Populate users mapping
  const userMapping: UserMapping = {};
  for (const userAddr of context.userIndex) {
    userMapping[userAddr] = await getUserGems(userAddr);
  }

  // Get events
  const events = await gems.queryFilter(
    {
      address: gems.address,
      topics: [
        "0x7ad4b12ff4ce0fdd55b19da97f85fc9a091971912adda4a8bba51626c4cd5469",
        "0x7ad4b12ff4ce0fdd55b19da97f85fc9a091971912adda4a8bba51626c4cd5469",
        "0x7ad4b12ff4ce0fdd55b19da97f85fc9a091971912adda4a8bba51626c4cd5469",
      ],
    },
    context.lastBlockRetrieved,
    context.lastBlockRetrieved + BLOCKS_PER_FETCH
  );

  // Index events
  indexEvents(context, userMapping, events);

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
  context.lastBlockRetrieved = context.lastBlockRetrieved + BLOCKS_PER_FETCH;
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
  events: ethers.ethers.Event[]
) {
  for (const event of events) {
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

      case "Transfer":
        await indexTransferEvent(context, userMapping, event);
        break;

      default:
        throw new Error("Unknown event");
    }
  }
}

async function indexForgedEvent(
  context: Context,
  userMapping: UserMapping,
  event: ethers.ethers.Event
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
  event: ethers.ethers.Event
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
  // Upload image to s3
  const img = await (
    await fetch(`${RENDERER_URL}/${JSON.stringify([])}`)
  ).buffer();

  uploadToS3(img, S3_IMAGE_BUCKET, `${tokenId}.jpg`);
}

async function indexActivatedEvent(
  context: Context,
  userMapping: UserMapping,
  event: ethers.ethers.Event
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
  event: ethers.ethers.Event
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

async function indexBurnEvent(
  context: Context,
  userMapping: UserMapping,
  event: ethers.ethers.Event
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
