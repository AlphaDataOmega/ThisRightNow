# ThisRightNow

Project Technical Documentation: https://alphas-personal-organization.gitbook.io/ado-dev-docs

Project User Documentation: https://alphas-personal-organization.gitbook.io/alphadataomega

## AI Moderation Utilities

The `ai` folder contains helper scripts for weighting community moderation
signals. `scorePost.ts` uses trust data from `indexer/output/trustIndex.json`
to score flagged posts and heavily favor flags from reputable contributors.

Appeal resolutions can further tweak reputation. Running `TrustScoreEngine.ts`
will generate a daily file under `trust/appealAdjustments-YYYY-MM-DD.json`
summarizing boosts or penalties from resolved appeals.
