import fetch from "make-fetch-happen";
import AWS from "aws-sdk";
import { BigNumber } from "ethers";
import dotenv from "dotenv";

if (dotenv.config().error) {
  throw new Error("could not read .env");
}

const {
  S3_JSON_CONTEXT_URL,
  GEMS_PER_FETCH,
  RENDERER_URL,
  S3_DATA_BUCKET,
  S3_IMAGE_BUCKET,
  LOOP_TIME,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  GRAPHQL_URL,
}: {
  S3_JSON_CONTEXT_URL: string;
  GEMS_PER_FETCH: string;
  RENDERER_URL: string;
  S3_DATA_BUCKET: string;
  S3_IMAGE_BUCKET: string;
  LOOP_TIME: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  GRAPHQL_URL: string;
} = process.env as any;

function loop() {
  run();
  setTimeout(() => {
    loop();
  }, parseInt(LOOP_TIME, 10));
}

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

interface Context {
  lastGemRetrieved: number;
}

interface Gem {
  burned: boolean;
  forgeBlock: string;
  forgeTime: string;
  id: string;
  number: string;
  owner: string;
  psi: string;
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

async function getHighestGem(): Promise<number | undefined> {
  const text = await (
    await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: highestGemQuery }),
    })
  ).text();

  let json;

  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(e.message + " " + text);
  }

  return json.data.gems[0]?.number;
}

async function getForgedGems(gt: number, lte: number): Promise<Gem[]> {
  const text = await (
    await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables: { gt, lte } }),
    })
  ).text();

  let json;

  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(e.message + " " + text);
  }

  return json.data.gems;
}

function parseGemMetadata(tokenId: string) {
  // Remove 0x
  tokenId = tokenId.slice(2);

  // Get latents
  const latent1 = BigNumber.from("0x" + tokenId.slice(0, 8)).toNumber();
  const latent2 = BigNumber.from("0x" + tokenId.slice(8, 16)).toNumber();
  const latent3 = BigNumber.from("0x" + tokenId.slice(16, 24)).toNumber();
  const latent4 = BigNumber.from("0x" + tokenId.slice(24, 32)).toNumber();

  // Get PSI
  const psi = BigNumber.from("0x" + tokenId.slice(32, 64))
    .div(BigNumber.from("1000000000000000000"))
    .toNumber();

  return [latent1, latent2, latent3, latent4, psi];
}

async function run() {
  const currentGem = await getHighestGem();

  if (!currentGem) {
    throw new Error("No gems currently indexed by the graph");
  }

  const rawContext = await (await fetch(S3_JSON_CONTEXT_URL)).json();
  const { lastGemRetrieved }: Context = {
    lastGemRetrieved: parseInt(rawContext.lastGemRetrieved, 10),
  };

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
    await renderGem(gem);
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

async function renderGem(gem: Gem) {
  // Get metadata
  let metadata = parseGemMetadata(gem.id);

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

  uploadImageAndMetadata(gem, img);
}

async function uploadImageAndMetadata(gem: Gem, img: Buffer) {
  // Upload image to s3
  let res = await uploadToS3(
    img,
    S3_IMAGE_BUCKET,
    `${gem.id}.jpg`,
    "image/jpeg"
  );
  console.log(`image uploaded successfully. ${res.Location}`);

  // Upload metadata to s3
  res = await uploadToS3(
    Buffer.from(
      JSON.stringify({
        name: `#${gem.number} - ${gem.psi}PSI`,
        image: `https://cdn.deepge.ms/${gem.id}.jpg`,
      })
    ),
    S3_DATA_BUCKET,
    `${gem.id}.json`,
    "application/json"
  );
  console.log(`metadata uploaded successfully. ${res.Location}`);
}

function uploadToS3(
  data: Buffer,
  bucket: string,
  key: string,
  contentType: string
): Promise<AWS.S3.ManagedUpload.SendData> {
  return new Promise((resolve, reject) => {
    // Setting up S3 upload parameters
    const params: AWS.S3.PutObjectRequest = {
      Body: data,
      Bucket: bucket,
      Key: key, // File name you want to save as in S3
      ContentType: contentType,
    };

    // Uploading files to the bucket
    s3.upload(
      params,
      function (err: Error, data: AWS.S3.ManagedUpload.SendData) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
}

loop();
