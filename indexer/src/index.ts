import fetch from "make-fetch-happen";
import { BigNumber } from "ethers";
import AWS from "aws-sdk";

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
  try {
    run();
  } catch (e) {
    console.error(e);
  }
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
  let metadata = parseGemMetadata(tokenId);

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
