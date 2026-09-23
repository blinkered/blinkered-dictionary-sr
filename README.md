# Blinkered dictionary: Serbian

The Serbian word list, and the evidence for every word in it.

Built by [`blinkered-attestation`](https://github.com/blinkered/blinkered-attestation). The rule,
the evidence format and the reasoning live there; what lives here is Serbian.

**82,665 of 109,513 candidates proved (75.5%)**, across 12 independent
families, 11 of which a stranger could check by fetching.

## What is in this repository

```
sources.mjs        which collections attest Serbian, and why those
attestations/      the evidence: every candidate, what saw it, and where
words.txt          what survived, in Blinkered's own format
dropped.tsv        what did not, and how close it came
searched.tsv       the publisher harvest: per page, which candidates it held and how often
SATURATION.md      what each family was worth, measured from the evidence
COLLECTIONS.md     every collection read, and where to get it again
status.json        the numbers, whether this ships, and what the list is under
```

The evidence is a **directory** rather than one file because this language's runs past the fifty
megabytes GitHub warns at. Each shard is a complete, independently valid evidence file with its
own header and digest; `readEvidence` puts them back together and refuses a repository that
somehow holds both layouts. Nothing reads them by globbing.

`.cache/` holds the downloaded collections and is not tracked. Everything here is regenerable
with `pnpm build`.

## Where the words come from

Candidates come from Blinkered's Serbian list, which lives in
[`blinkered-attestation/candidates/sr`](https://github.com/blinkered/blinkered-attestation/tree/main/candidates/sr).
The dictionaries that built it are demoted to **proposing words worth looking up**. What earns a
word its place here is evidence that it occurs in the world: three independent collections, each
recorded with a locator somebody else can fetch.

`SATURATION.md` says what each family was worth. `COLLECTIONS.md` names every collection read and
where to get it again, which is what makes the downloads disposable.

## What is particular to Serbian

**Cyrillic only, and every collection had to be measured for how much of it that leaves.** The
list is Cyrillic, as SCRIPTS.md decides, and Latin-script Serbian folds to keys no candidate has,
so it attests nothing. It does not contaminate; it is simply unusable, and the question per source
is how much.

```
  Leipzig srp-rs_web_2016_1M     99.9% of sentences mostly Cyrillic
  Leipzig srp-me_web_2016_300K   99.8%
  Wikipedia (raw dump)           86% of letters Cyrillic; the rest is markup, templates and
                                 quoted Latin; articles are stored in Cyrillic and converted
  Wikisource (raw dump)          90%
  Tatoeba                        47% of letters: about half the Serbian sentences are Latin
  eBible                         two Cyrillic translations chosen, 97% (the Latin 1865 and
                                 the Latin edition of the 2017 translation were left out)
  Internet Archive               368 books kept, 108 of them mostly Latin script; 189 clear
                                 the legibility floor
  Harvest                        Cyrillic publishers only; of fourteen Serbian news sites
                                 probed, three set their pages in Cyrillic
```

Leipzig's Serbian packages are both web crawls from 2016; there is no Serbian news package. The
eBible family is two Bibles, the 1868 Daničić-Karadžić and the 2017 New Serbian Translation, which
count once between them. No Croatian source is used anywhere, and Leipzig's `hbs_mixed` is left out
for that reason. The harvest read 2,451 pages from six publishers; RTS, RTV and `spc.rs` write in
Cyrillic but offer nothing the harvest can discover.

In the shipped list, 9,949 words (12.0%) are also in Russian's list, 9,384 (11.4%) in Bulgarian's
and 7,783 (9.4%) in Macedonian's: shared Slavic vocabulary, with the top of the list plainly
Serbian (ШТО, КАО, АЛИ, БИО). Old Serbian orthography writes Ъ, so the Archive screen that removes
Bulgarian books elsewhere was told not to remove Serbian ones for it; only one book (Ukrainian) was
removed.

**Where the ceiling is.** 75.5% of 109,513. Of the 19,823 words one family short, 16,248 were seen
only by the Archive and a Wikimedia project. A Common Crawl family is the obvious third opinion and
was not fetched for want of disk. Every letter of the Serbian alphabet spells some shipped word;
the rarest is Џ, in 199.

## Rebuilding

```
pnpm install
pnpm build        # reads whatever collections are in .cache/raw, reuses the record for the rest
pnpm conform      # the list says only what the evidence supports
pnpm saturation   # recomputes the curve and status.json
```

A collection that is not on disk is skipped with a warning and its recorded testimony is reused,
so a rebuild after more books arrive is short rather than a re-read of everything.

## Before this ships

Nobody has blessed this list. `status.json` says `"ships": "pending"`, which means built and
conforming but not yet checked against Blinkered's usability floor or looked at on a board.
`COMMON_CUT` in `sources.mjs` is carried over from Blinkered's old calibration against a
differently sized list and has to be re-measured before this list reaches the game.

## Licensing

Three kinds of thing live here and they do not share terms. The distinction is the project: a
licence that claimed more than we can support would undo the argument the evidence is here to
make. [NOTICE](NOTICE) is the authority; this is the summary.

| | terms | what |
| --- | --- | --- |
| **Code and docs** | [Apache-2.0](LICENSE) | `build.mjs`, `sources.mjs`, `harvest.mjs`, `conform.mjs`, `saturation.mjs`, and the Markdown |
| **The list and its evidence** | [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `words.txt`, the evidence, `status.json`, `SATURATION.md`, `COLLECTIONS.md`, `searched.tsv` |
| **The words we could not prove** | `LGPL-2.1-or-later` | `dropped.tsv`, which is **not ours to license** |

**Why the list is CC0.** A word ships because three independent collections of text were found to
contain it. The record of which collections, and where in them, is a statement of fact about those
texts rather than a copy of them, and nothing a licence governs was taken from the dictionary that
proposed the candidates.

**Why `dropped.tsv` is not.** It is the candidates that failed, and a candidate that failed is a
word we have nothing to say about except that somebody's dictionary proposed it. That makes the
file a subset of that dictionary and it carries that dictionary's terms: here `LGPL-2.1-or-later`.
