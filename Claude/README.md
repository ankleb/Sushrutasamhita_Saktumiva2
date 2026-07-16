# Suśruta editorial pipeline — Stage 2a: learning the normalization rules

This directory holds the first script of the machine-assisted editorial
pipeline for the Nepalese *Suśrutasaṃhitā*. Its job is narrow and deliberate:
to **discover, from the chapters your team has already critically edited, the
orthographic normalization conventions those chapters embody**, and to present
them as a reviewable table. That approved table later drives deterministic
normalization of the ~163 not-yet-edited chapters, so a large part of what
looks like "editing" becomes auditable rule application rather than fresh
judgement.

Nothing here alters any edition file. The script only reads.

## Why this stage exists

The pipeline separates work that is *deterministic and reproducible* from the
one part that needs *scholarly judgement*, and shrinks the judgement part to
the smallest reviewable set of real decisions. Orthographic normalization
(va→ba, ś/s, anusvāra↔homorganic nasal, degemination after *r*, avagraha,
daṇḍa regularization, …) is deterministic **once the conventions are written
down**. They were never written down; they live implicitly in the edited
chapters. This script reconstructs them empirically so they can be approved
once and applied everywhere.

## What it does

For every apparatus locus in the **edited** chapters (listed in
`edited_chapters.txt`), it compares the edition reading (the `<lem>`) with the
readings of the Nepalese witnesses **K, N, H** (ac/pc folded onto the base
siglum). Where the difference is small enough to be orthographic rather than a
choice between substantively different readings (a character-level size gate),
it records the change, classifies it (ba-va, sibilant, nasal-anusvara,
gemination, degemination, avagraha, punctuation, vowel-length, visarga,
vocalic-r, insertion, deletion, other), and aggregates the evidence into
candidate rules.

Two kinds of apparatus entry supply evidence:

- **grouped-minor** — a witness spelling the aligner already grouped with the
  lemma as a trivial variant (`<rdg type="minor">` inside a lemma
  `<rdgGrp>`). Highest-grade evidence.
- **editorial-surface** — a lemma with *no* `@wit`, i.e. an edition surface
  form matching no witness exactly; compared against the closest Nepalese
  reading.

The printed vulgate (**A / A1938 / A1931**) is **never** used as the source
side of a rule: these rules describe how *Nepalese manuscript* spellings map to
edition spellings. Where A happens to coincide with the normalized form, that
coincidence is not evidence about manuscript orthography.

Substantive variants are kept out by the size gate; anything larger than a few
changed characters is treated as an editorial *choice* (a different pipeline
stage), not a normalization.

## Running it

```bash
python3 learn_normalization_rules.py --root /path/to/project/tree
```

Options:

- `--root` (required) — root of your file tree; it is walked recursively.
- `--config` — the edited-chapters list (default `edited_chapters.txt` beside
  the script). **Keep this current** as chapters are finished.
- `--outdir` — where to write outputs (default `<root>/pipeline/output`).

Dependencies: Python 3.8+ and `lxml` (`pip install lxml`).

Run the tests after any change to the classifier or gates:

```bash
python3 test_learn_normalization_rules.py     # or: pytest
```

## File discovery

Uses every `provisional-edition*.xml` under `--root` **except** files whose
name contains `new` or `copy` (working duplicates, per project convention).
Witness (`kl_*`, `nak_*`, …) and vulgate (`0*-vulgate-*`) files are not needed
at this stage: the provisional-edition files already embed both the edition
text and the collation in stand-off `<standOff>` apparatus.

## Outputs (written to `--outdir`)

- **`normalization-rules.tsv`** — the candidate rule table, one row per
  `(category, from, to)`. Columns:
  `rule_id, category, from, to, count, n_chapters, n_contexts,
  reverse_count, witnesses, examples, status, comment`.
  `reverse_count` is how often the *opposite* change occurs; a high value
  (e.g. `ṃ→m` and `m→ṃ` both frequent) flags a context-conditioned rule you
  should inspect rather than approve as a blanket rewrite. `status` is
  pre-filled `proposed`.
- **`normalization-evidence.tsv`** — the full audit trail: every extracted
  change, one row per (locus, witness), quoting both strings verbatim. Every
  rule is traceable here. To see all contexts behind a rule, filter this file
  on its `category/from/to`.
- **`chapter-inventory.tsv`** — every chapter found, whether it is listed as
  edited, and its apparatus-entry count. A Stage-0 by-product useful for
  planning the remaining work.

## The review workflow (the human checkpoint)

1. Open `normalization-rules.tsv` in a spreadsheet.
2. For each rule set `status` to `approved`, `rejected`, or `restricted`
   (and use `comment` to note any context restriction, e.g. "only after r").
   Pay special attention to rows with a high `reverse_count` and to the whole
   `other` category, which collects composite/sandhi/near-substantive changes
   that genuinely need an editor's eye.
3. Save the reviewed file as **`normalization-rules.reviewed.tsv`**.

That reviewed file is the hand-off to Stage 2b (the applier), which will use
only `approved`/`restricted` rules and will mark each application in the
generated TEI (silently, or visibly via `<choice>`, per your preference — as
in the chapter-6 sample already produced).

## Suggested repository layout

Keep the tooling with the project so it is versioned and citable, and keep
generated artifacts separate from reviewed ones:

```
<project root>/
├── 01-su.su-1-31/                       # your existing text directories
│   └── provisional-edition_*.xml
├── 05-su.ka/
│   └── provisional-edition_*.xml
├── ...
└── pipeline/
    ├── learn_normalization_rules.py     # this stage (Stage 2a)
    ├── test_learn_normalization_rules.py
    ├── edited_chapters.txt              # config — keep current
    ├── README.md                        # this file
    ├── output/                          # GENERATED; safe to delete & rebuild
    │   ├── normalization-rules.tsv
    │   ├── normalization-evidence.tsv
    │   └── chapter-inventory.tsv
    └── reviewed/                         # HUMAN-CURATED; commit to version control
        └── normalization-rules.reviewed.tsv
```

Recommendation: commit `pipeline/` (scripts, config, README, and the
`reviewed/` table) to version control; treat `pipeline/output/` as
regenerable and either git-ignore it or commit periodic snapshots for the
record. The generated files are cheap to reproduce — rerun the script — so the
thing worth protecting is the human review captured in `reviewed/`.

## Scope and honest limits

- The size gate cannot perfectly separate orthographic from substantive
  change; a few near-substantive pairs will land in `other`. That is by
  design — they surface for review rather than being silently normalized.
- Rules are learned only from the currently edited chapters; as more chapters
  are finished and added to `edited_chapters.txt`, rerun to strengthen the
  evidence base.
- This stage learns *orthography*. Editorial choices between substantively
  different readings, and conjecture, are deliberately out of scope and belong
  to the judgement stage, under human review on both sides.

---

*Drafted 2026-07-16 by Claude (Anthropic) under the direction of Dominik
Wujastyk, as part of the machine-assisted pipeline for the Nepalese
Suśrutasaṃhitā. Tested against the Sūtrasthāna 1–31 and Kalpasthāna
provisional-edition files.*
