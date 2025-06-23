# ThisRightNow Documentation

## Overview
ThisRightNow is a prototype decentralized social network powered by TRN tokens and on‑chain moderation. Posts are stored on IPFS and registered on chain. Community actions such as blessing, burning, flagging or boosting interact with smart contracts under `ado-core/`.

A set of indexer and AI scripts in `indexer/` and `ai/` maintain trust scores and automate moderation. The frontend React components live in `thisrightnow/src`.

## Using the App
1. **Connect a wallet** – all actions are performed on chain.
2. **Create a post** using the form on the homepage. Content is uploaded to IPFS then `ViewIndex` registers the hash and category.
3. **Interact with posts** from the feed:
   - **Bless** – registers positive engagement.
   - **Burn** – permanently hides content through `BurnRegistry`.
   - **Retrn** – shares the post and increases its trust‑weighted reach using `RetrnIndex`.
   - **Boost** – locks TRN to promote the post via `BoostingModule`.
4. **Flag inappropriate content**. Flags accumulate in `FlagEscalator`; high counts escalate automatically.
5. **Appeal moderation** decisions through the appeal form. Appeals are logged to `ModerationLog` and can be approved, denied or escalated by moderators.
6. **View earnings** and vault balances from the dashboard pages. TRN payouts are tracked by `TRNUsageOracle` and distributed through various vaults.

## Money Flow
- Revenue from posts enters `PostVaultSplitter` which sends 50% to the contributor vault, 20% to the investor vault, 10% to a country vault and 20% to the DAO vault.
- Vault contracts (e.g. `MockContributorVault.sol`, `MockInvestorVault.sol`) call `TRNUsageOracle` when users claim rewards so balances update on chain.
- Boost deposits can be refunded if a boosted post gets burned via `recordBoostRefund` on the oracle.
- Merkle drops and country specific payouts use `MerkleDropDistributor` and related vault logic.

## Developer Setup
1. **Install dependencies** for the contracts:
   ```bash
   cd ado-core
   npm install
   ```
2. **Run the Hardhat test suite**:
   ```bash
   npx hardhat test
   ```
3. **Run indexer or AI scripts** directly with `ts-node` or `node`:
   ```bash
   npx ts-node indexer/TrustScoreEngine.ts
   ```
4. **Frontend** – the React source is under `thisrightnow/src`. Create a Vite (or similar) React project and copy this folder in, then supply environment variables such as `VITE_VIEW_INDEX`, `VITE_BURN_REGISTRY`, `VITE_FLAG_ESCALATOR`, etc. A `.env` file is required with the deployed contract addresses.

The project relies on Node.js 18+ and a local Ethereum RPC (e.g. Hardhat node) for contract calls. OPENAI_API_KEY is needed for the AI scripts.
