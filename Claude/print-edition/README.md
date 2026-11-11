# Print edition (prototype)

Turns the Saktumiva `provisional-edition_*.xml` files (not the `_new` ones) into a
typeset critical edition with Devanagari text, made with XeLaTeX + reledmac.

- `tei2reledmac.py` — TEI → LaTeX body. It reads each `<lg>` and the
  `<standOff type="apparatus">` block that goes with it. `@loc` offsets count
  non-whitespace characters and skip the tags marked "ignore" (the same rule
  Saktumiva's `apparatus.mjs` uses). English notes become numbered footnotes.
- `translit.mjs` — IAST → Devanagari, using the project's own
  `lib/util/sanscript.mjs` (with e/o mapped to long vowels).
- `edition.tex` — a single-volume test (`body.tex`); `edition-full.tex` — the whole
  text (`all-bodies.tex` → `body-NN.tex`).

## Build

```bash
python3 tei2reledmac.py ../../01-su.su-1-31/provisional-edition_sutrasthana-1-31.xml body.tex --adhyaya 1
xelatex edition.tex && xelatex edition.tex && xelatex edition.tex
```

Use `--script iast` to keep the text in transliteration.

## Known limitations

- Apparatus entries whose span crosses a verse half (`<caesura/>`) or overlaps
  another entry are anchored at the end of the passage with an explicit lemma.
- `warnings.txt` lists entries where the lemma text does not match the text at
  `@loc`. These are probably stale alignments and should be checked in the data.
- Readings are printed in their normalized (`type="main"`) form. Minor
  orthographic variants of individual witnesses are left out.
## Word joining

The Devanagari follows traditional practice. A word ending in a consonant is
written together with the next word (अथातो वेदोत्पत्तिमध्यायं), and an avagraha
attaches to the preceding word (प्राप्तोऽस्मि). The virāma stays only before a
daṇḍa or other punctuation, at a verse break, or at the end of a passage.
Readings in the apparatus are joined the same way. If a lemma becomes part of a
larger joined unit, the whole unit is marked in the text, and the lemma itself is
printed in the apparatus (`\lemma{अध्यायं}`).

## Line breaking

Joined units are long and have few spaces. TeX also won't hyphenate a word that
comes right after a reledmac apparatus marker. So the converter adds its own
break points at akṣara boundaries in words of 7 or more akṣaras, keeping at least
2 akṣaras together at each end. Conjuncts, mātrās, anusvāra and visarga are
never split.

- In the main text the break point is `\-`, so a break shows a hyphen.
- In the apparatus it is `\appbrk` (zero-width glue), so a break shows no
  hyphen. reledmac's paragraphed footnotes throw away discretionaries and
  penalties, so only glue works there.
- `\tolerance=1000 \emergencystretch=3em` lets lines loosen, so they don't run
  into the margin.
- A daṇḍa is tied to the word before it, so it never starts a line.
- Each adhyāya is its own reledmac numbering section, which keeps TeX's memory
  use bounded. `<pc>` separators
between compound members (each one a single space) are closed up in both text and
readings. An English note anchored inside a joined unit is moved to the end of
that unit. `--no-join` turns joining off and keeps the `<pc>` spaces.
