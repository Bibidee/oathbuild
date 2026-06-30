# Oath — The Ledger Court

A public promise accountability layer on GenLayer StudioNet. Users lock plain-English commitments on-chain with a deadline, success criteria, and accepted evidence sources. Anyone can submit public URLs as witness evidence. GenLayer validators independently fetch the sources, weigh the evidence, and reach consensus on a verdict — fulfilled, partial, missed, or excluded. Settled oaths produce a verifiable on-chain receipt. Disputed verdicts can be appealed and re-judged by validators with new evidence.

**Live:** https://oath-build.vercel.app  
**GitHub:** https://github.com/Bibidee/oathbuild

---

## Why GenLayer

A normal deterministic smart contract cannot answer:
- Did the shipped product match the promised scope?
- Is the submitted evidence credible or cherry-picked?
- Does the failure fall under a stated exclusion?
- Was fulfilment partial or complete?

GenLayer Intelligent Contracts process natural language, unstructured evidence, and live public URLs through decentralized AI-validator consensus — making natural-language promise verification possible on-chain.

---

## Stack

- **Contract:** Python Intelligent Contract (`contracts/oath.py`) on GenLayer StudioNet
- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS v4 + Framer Motion
- **Chain interaction:** genlayer-js
- **State:** TanStack Query
- **Network:** StudioNet (chain ID 61999)

---

## Contract Methods

| Method | Description |
|---|---|
| `create_oath` | Lock a promise on-chain with criteria, deadline, and evidence sources |
| `submit_evidence` | Submit a public URL as fulfilment, challenge, context, or exclusion evidence |
| `request_verdict` | Trigger GenLayer validator consensus to judge the oath |
| `submit_appeal` | File an appeal against a settled verdict |
| `request_appeal_verdict` | Trigger validator re-review of a filed appeal |

**Deployed contract:** `0xc7eda6D8D46F52E206688716c22f21D520244E76`

---

## Pages

| Route | Name | Description |
|---|---|---|
| `/` | Court Entrance | Hero + how it works |
| `/create` | Promise Chamber | 6-step guided oath builder |
| `/oaths` | The Oath Ledger | All oaths table view |
| `/oaths/[id]` | Oath Detail | Seal, timeline, evidence wall, verdict receipt, appeals |
| `/arena` | Judgment Arena | Live status feed by stage |
| `/receipts` | Settlement Archive | All settled oaths with receipts |

---

## Setup

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_OATH_CONTRACT_ADDRESS in .env.local
npm run dev
```

## Tests

```bash
genlayer test tests/direct/test_oath_contract.py
```
