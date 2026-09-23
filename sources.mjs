/**
 * The collections that attest Serbian, and where each comes from.
 *
 * Serbian is written in two alphabets and this list is Cyrillic only (SCRIPTS.md says why). Every
 * collection here mixes the two to some degree, and Latin text folds to keys no candidate has, so
 * it simply attests nothing: it costs reading time and adds tokens to nobody's rate but its own
 * collection's. How much of each collection was usable is in the README.
 *
 * Its families are a Wikipedia, Leipzig's `.rs` and `.me` web, Tatoeba, two Cyrillic Bibles on
 * eBible (the 1868 Daničić-Karadžić and the 2017 New Serbian Translation, one family between
 * them), three Gutenberg texts and the Internet Archive's Serbian books. No Croatian source is
 * used, and Leipzig's `hbs_mixed` is left out for that reason.
 *
 * Every URL here was probed before it was written down. A collection that 404s does not fail
 * loudly; the build skips it with a warning and reports a healthy number over fewer families.
 */
import { createReadStream, existsSync, readFileSync, readdirSync } from 'node:fs'
import { createInterface } from 'node:readline'
import {
  fileDocuments,
  gutenbergBody,
  harvestDocuments,
  leipzigLocators,
  leipzigSentences,
  tatoebaDocuments,
  verseDocuments,
  wikiDocuments,
} from '@blinkered/attestation'

export const LANGUAGE = 'sr'

const CACHE = new URL('.cache/raw/', import.meta.url).pathname

/** A Leipzig package, with its sentence-to-URL index resolved up front. */
function leipzig(pkg) {
  const base = `${CACHE}${pkg}/${pkg}`
  const locators = leipzigLocators(
    readFileSync(`${base}-inv_so.txt`, 'utf8'),
    readFileSync(`${base}-sources.txt`, 'utf8'),
  )
  const lines = createInterface({
    input: createReadStream(`${base}-sentences.txt`),
    crlfDelay: Infinity,
  })
  return leipzigSentences(lines, locators)
}

// Leipzig has no Serbian news package at all, so both of these are web crawls from 2016. The
// Leipzig Wikipedia packages are deliberately absent: they are Wikipedia text wearing a Leipzig
// label, so including one would corroborate `wiki:sr` while looking like another family.
const LEIPZIG = ['srp-rs_web_2016_1M', 'srp-me_web_2016_300K']

const ALL = [
  {
    id: 'wiki:sr',
    what: 'Serbian Wikipedia; modern encyclopedic prose',
    needs: `${CACHE}srwiki.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}srwiki.xml.bz2`),
  },
  {
    id: 'wikisource:sr',
    what: 'Serbian Wikisource; same Wikimedia family, so it corroborates rather than counts',
    needs: `${CACHE}srwikisource.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}srwikisource.xml.bz2`),
  },
  ...LEIPZIG.map((pkg) => ({
    id: `lz:${pkg}`,
    from: `https://downloads.wortschatz-leipzig.de/corpora/${pkg}.tar.gz`,
    what: `Leipzig ${pkg}; news and web, cited by the page each sentence came from`,
    needs: `${CACHE}${pkg}`,
    documents: () => leipzig(pkg),
  })),
  {
    id: 'tat',
    from: 'https://downloads.tatoeba.org/exports/per_language/srp/srp_sentences.tsv.bz2',
    what: 'Tatoeba Serbian; contemporary and conversational',
    needs: `${CACHE}srp_sentences.tsv`,
    documents: () => tatoebaDocuments(`${CACHE}srp_sentences.tsv`),
  },
  {
    id: 'ebible:srp1868',
    from: 'https://ebible.org/Scriptures/srp1868_vpl.zip',
    what: 'The Daničić-Karadžić Bible of 1868, in Cyrillic; a family nothing else here belongs to',
    needs: `${CACHE}ebible-srp1868/srp1868_vpl.txt`,
    documents: () => verseDocuments(`${CACHE}ebible-srp1868/srp1868_vpl.txt`),
  },
  {
    id: 'ebible:srponspc',
    from: 'https://ebible.org/Scriptures/srponspc_vpl.zip',
    what: 'Biblica New Serbian Translation, 2017, in Cyrillic; the same eBible family as the 1868',
    needs: `${CACHE}ebible-srponspc/srponspc_vpl.txt`,
    documents: () => verseDocuments(`${CACHE}ebible-srponspc/srponspc_vpl.txt`),
  },
  {
    id: 'gut',
    from: 'https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv',
    what: 'Project Gutenberg Serbian, 3 texts',
    needs: `${CACHE}gutenberg-sr`,
    documents: () => {
      const dir = `${CACHE}gutenberg-sr`
      const books = readdirSync(dir)
        .filter((file) => file.endsWith('.txt'))
        .map((file) => ({ locator: file.replace('.txt', ''), path: `${dir}/${file}` }))
      return fileDocuments(books, async (path) => gutenbergBody(readFileSync(path, 'utf8')))
    },
  },
  {
    id: 'ia',
    // Scanned books are OCR, and OCR fails in a way that looks like text. Clean Gutenberg scores
    // a median 52% known words and never below 36%; the worst Archive scans score 1%. Below this
    // floor a book is not legible enough to attest anything.
    legible: 0.35,
    what: 'Internet Archive Serbian books; literature, and the register a newspaper never reaches',
    needs: `${CACHE}archive-sr`,
    from: 'https://archive.org/search?query=mediatype%3Atexts+AND+%28language%3A%22Serbian%22+OR+language%3Asrp+OR+language%3Ascc%29',
    documents: () => {
      const dir = `${CACHE}archive-sr`
      // A locator names the text, not the item: the catalogue page holds no word of the book.
      const named = new Map(
        readFileSync(`${dir}/files.tsv`, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((line) => line.split('\t')),
      )
      const books = readdirSync(dir)
        .filter((file) => file.endsWith('.txt'))
        .map((file) => file.replace('.txt', ''))
        .filter((id) => named.has(id))
        // Percent-encoded: two thirds of Archive filenames contain spaces, and the evidence
        // format spends spaces as separators.
        .map((id) => ({
          locator: `${id}/${encodeURIComponent(named.get(id))}`,
          path: `${dir}/${id}.txt`,
        }))
      return fileDocuments(books, async (path) => readFileSync(path, 'utf8'))
    },
  },
]

export const SOURCES = ALL.filter((source) => {
  if (source.needs === undefined || existsSync(source.needs)) return true
  process.stderr.write(`  (skipping ${source.id}: ${source.needs} is not in .cache/raw)\n`)
  return false
})

/**
 * Serbian publishers, for the harvest.
 *
 * Chosen because they publish in Cyrillic, which rules out most of the Serbian web: of fourteen
 * news sites probed, only RTS, Politika and RTV set their pages in it. A page in Latin script
 * attests nothing here, so a Latin-script publisher would cost a harvest its time and give
 * nothing back. Project Rastko, a library of Serbian literature and scholarship, goes first for
 * the register the news never reaches. Domains under `.org.rs`, `.co.rs` and `.gov.rs` are left
 * out because the family rule would name them after the suffix rather than the publisher. RTS,
 * RTV and the Serbian Orthodox Church (`spc.rs`) write in Cyrillic too, but offer no sitemap or
 * feed the harvest can find, so they gave no pages and are not listed.
 */
export const DOMAINS = [
  'rastko.rs',
  'politika.rs', 'rtrs.tv', 'standard.rs', 'nspm.rs', 'pravda.rs',
]

export const HARVEST = existsSync(new URL('searched.tsv', import.meta.url).pathname)
  ? () => harvestDocuments(new URL('searched.tsv', import.meta.url).pathname)
  : undefined

/** Carried over from Blinkered's calibration; must be re-measured before anything ships. */
export const COMMON_CUT = 17000
