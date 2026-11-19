# token-launch-radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/HendrikSutisna/token-launch-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/HendrikSutisna/token-launch-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Which protocols with no token yet would be worth the most if they launched one — ranked from a sealed snapshot of every protocol DefiLlama tracks, by an implied value computed from that snapshot alone. Built by an AI agent for make.fun's "Build the best token launch radar" bounty, $1,325 in USDC.

## The model (radar-2)

No price, no revenue and no name is brought in from outside the snapshot. For each pre-token protocol:

```
implied = TVL × multiple × growth × maturity × chains
```

- **Multiple.** The median FDV/TVL of the live-token protocols in the same category, computed from the snapshot itself, with ratios above 10× dropped as residual-TVL data errors. A category with fewer than 3 live comparables falls back to the all-category median (0.191×), shrunk toward it with a prior of 8 and clamped to [0.02, 0.45].
- **Growth.** The 7-day TVL change, clamped to [-50, 100]%, weighted 0.40.
- **Maturity.** Days since listing, capped at 1,095: `0.55 + min(age, 1095) / 1095 × 0.45`. Unknown age counts as 365 days.
- **Chains.** `1 + min(chains − 1, 5) × 0.02` — at most a 10% uplift.

The board covers the snapshot's whole 40-protocol watchlist plus every other rankable pre-token protocol in the snapshot (197 rows in total), ranked by implied value. Excluded: exchanges, bridges, liquid-staking and restaking receipts, versioned pools, and wrapped or staked products — the same rule the watchlist uses. A protocol is "pre-token" when its snapshot entry records no market cap, no CoinGecko id and no symbol. Each row carries a six-step farm plan with a cost and a time, derived from its own category, chains, TVL and age.

Top of the board (snapshot as of 2026-11-14): Steakhouse Financial — $444,357,451 implied; Sentora Curator — $405,085,295; Gauntlet — $262,613,158. Implied value is a model claim from the sealed snapshot, not a prediction of a launch or a price — and the two biggest categories at the top, Risk Curators and Onchain Capital Allocator, have fewer than 3 live comparables each, so their multiples are the all-category median and their rows are marked low confidence on the page.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json
```

`main.ts` reads the sealed snapshot, writes `board.json`, `dashboard/data.js`, copies `dashboard/` and `screenshots/` into the output directory, and builds `dossier.json` with the kit's vendor code. Node 22.18 or later, standard library only — nothing is installed and nothing is fetched.

## The dashboard

`dashboard/` is a static page with no network: the ranked board (search, category and chain filters, watchlist-only toggle, sortable), a detail view for every protocol with the full arithmetic behind its implied value and its farm plan, the live-token protocols by market cap for comparison, and a Method tab with the comparables table.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
