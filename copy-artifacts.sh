#! /bin/bash
# Copies solidity artifacts to frontend and indexer repos to consume them

cp -rf solidity/artifacts frontend/src/artifacts
cp -rf solidity/artifacts indexer/src/artifacts
cp -rf solidity/typechain frontend/src/typechain
cp -rf solidity/typechain indexer/src/typechain
