# ThisRightNow

Project Technical Documentation: https://alphas-personal-organization.gitbook.io/ado-dev-docs

Project User Documentation: https://alphas-personal-organization.gitbook.io/alphadataomega

## AI Moderation Utilities

The `ai` folder contains helper scripts for weighting community moderation
signals. `scorePost.ts` uses trust data from `indexer/output/trustIndex.json`
to score flagged posts and heavily favor flags from reputable contributors.
