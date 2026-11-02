import MiniSearch, { type Query, type SearchOptions, type SearchResult } from 'minisearch';
import type { LibraryItem } from './libraryData';

// Transcript vocabulary, served per locale by /api/library-search/[locale] and fetched only once
// someone starts searching — it is far heavier than everything else the page needs.
export interface LibraryTranscripts {
  terms: Record<string, string>; // story uuid -> space-separated normalised terms
  stopwords: string[];
}

// Title and keyword matches must outrank any transcript mention: course intro transcripts are full
// of presenter small talk, so a transcript hit is a weak signal. A theme says what an item is about,
// so it counts as much as the description; the format only says what kind of item it is.
const BOOST = {
  title: 6,
  keywords: 4,
  description: 2,
  themes: 2,
  courseTitle: 1,
  format: 1,
  transcript: 0.4,
};

const MAIN_FIELDS = Object.keys(BOOST).filter((field) => field !== 'transcript');

// A term in more than this share of a locale's stories says nothing about any one of them.
const STOPWORD_DOC_SHARE = 0.4;

// Long transcripts keep only terms said at least twice, which drops passing mentions and keeps the
// payload small; short texts (activities, grounding) keep everything.
const LONG_TRANSCRIPT_TOKENS = 800;

const PLURAL_S_LOCALES = new Set(['en', 'es', 'pt', 'fr']);

const ARABIC_ARTICLE = /^(وال|بال|كال|فال|لل|ال)/;

// English -y, -ie and -ies all fold to -i, so "boundar", "boundari" and "boundaries" keep matching
// "boundary" as it is typed.
const EN_Y_ENDING = /(?<=\p{L}{2}[^aeiou])(?:y|ies?)$/u;

// Case, accents, apostrophes and script variants people type interchangeably. Folding ı and İ to i
// is what fixes Turkish searches typed with an auto-capitalised first letter.
export function normaliseForSearch(text: string, locale: string): string {
  return text
    .toLocaleLowerCase(locale)
    .replace(/['\u2019]/g, locale === 'fr' ? ' ' : '') // "can't" = "cant"; French "l'abus" = "abus"
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Latin combining accents
    .replace(/\u0131/g, 'i') // Turkish dotless i
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '') // Arabic harakat, hamza marks, tatweel
    .replace(/\u0671/g, '\u0627') // alef wasla
    .replace(/\u0649/g, '\u064a') // alef maqsura
    .replace(/\u0629/g, '\u0647') // ta marbuta
    .replace(/\u093c/g, ''); // Devanagari nukta
}

const segmenters = new Map<string, Intl.Segmenter>();

function words(text: string, locale: string): string[] {
  if (typeof Intl.Segmenter !== 'function') {
    return text.split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
  }
  let segmenter = segmenters.get(locale);
  if (!segmenter) {
    segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    segmenters.set(locale, segmenter);
  }
  return Array.from(segmenter.segment(text))
    .filter((segment) => segment.isWordLike)
    .map((segment) => segment.segment);
}

// Hyphenated words are indexed whole too, so "selfcare" finds "self-care".
export function tokenise(text: string, locale: string): string[] {
  const normalised = normaliseForSearch(text, locale);
  const joined = Array.from(normalised.matchAll(/[\p{L}\p{M}]+(?:-[\p{L}\p{M}]+)+/gu), (m) =>
    m[0].replace(/-/g, ''),
  );
  return [...words(normalised, locale), ...joined];
}

// A light stem shared by the index and the query: Arabic article prefixes, and plural -s/-y where
// it is regular. Prefix and fuzzy matching cover the rest of the inflection.
export function stem(term: string, locale: string): string | null {
  let t = term;
  if (t.length < 2) return null;
  if (locale === 'ar' && ARABIC_ARTICLE.test(t) && t.replace(ARABIC_ARTICLE, '').length >= 3) {
    t = t.replace(ARABIC_ARTICLE, '');
  }
  if (PLURAL_S_LOCALES.has(locale) && t.length > 3) {
    if (locale === 'en' && EN_Y_ENDING.test(t)) t = t.replace(EN_Y_ENDING, 'i');
    else if (/[^su]s$/.test(t)) t = t.slice(0, -1);
  }
  return t;
}

// Server-side: reduce each story's transcript text to the terms worth indexing.
export function buildTranscriptVocabulary(
  texts: Record<string, string>,
  locale: string,
): LibraryTranscripts {
  const counts = new Map<string, Map<string, number>>();
  const docFrequency = new Map<string, number>();
  const tokenTotals = new Map<string, number>();

  for (const [id, text] of Object.entries(texts)) {
    const termCounts = new Map<string, number>();
    const tokens = tokenise(text, locale);
    for (const token of tokens) {
      const term = stem(token, locale);
      if (term && term.length >= 3) termCounts.set(term, (termCounts.get(term) ?? 0) + 1);
    }
    termCounts.forEach((_, term) => docFrequency.set(term, (docFrequency.get(term) ?? 0) + 1));
    counts.set(id, termCounts);
    tokenTotals.set(id, tokens.length);
  }

  const docCount = counts.size;
  const stopwords = new Set(
    [...docFrequency]
      .filter(([, df]) => docCount >= 10 && df / docCount > STOPWORD_DOC_SHARE)
      .map(([term]) => term),
  );

  const terms: Record<string, string> = {};
  counts.forEach((termCounts, id) => {
    const minCount = (tokenTotals.get(id) ?? 0) > LONG_TRANSCRIPT_TOKENS ? 2 : 1;
    terms[id] = [...termCounts]
      .filter(([term, n]) => n >= minCount && !stopwords.has(term))
      .map(([term]) => term)
      .join(' ');
  });

  return { terms, stopwords: [...stopwords] };
}

interface SearchDocument {
  id: string;
  title: string;
  keywords: string;
  courseTitle: string;
  description: string;
  themes: string;
  format: string;
  transcript: string;
}

export type LibrarySearch = (keyword: string) => Map<string, number>;

interface LibrarySearchOptions {
  // Translated labels, so "Setting boundaries" or "Video" match in the visitor's language.
  labelsFor?: (item: LibraryItem) => { themes: string[]; format: string };
  transcripts?: LibraryTranscripts | null;
}

export function createLibrarySearch(
  items: LibraryItem[],
  locale: string,
  { labelsFor = () => ({ themes: [], format: '' }), transcripts }: LibrarySearchOptions = {},
): LibrarySearch {
  const processTerm = (term: string) => stem(term, locale);
  const index = new MiniSearch<SearchDocument>({
    fields: [...MAIN_FIELDS, 'transcript'],
    tokenize: (text) => tokenise(text, locale),
    processTerm,
  });
  index.addAll(
    items.map((item) => {
      const labels = labelsFor(item);
      return {
        id: item.id,
        title: item.title,
        keywords: item.keywords ?? '',
        courseTitle: item.courseTitle ?? '',
        description: [item.description, item.seoDescription].filter(Boolean).join(' '),
        themes: labels.themes.join(' '),
        format: labels.format,
        transcript: transcripts?.terms[item.id] ?? '',
      };
    }),
  );

  const stopwords = new Set(transcripts?.stopwords);
  // Token sequences padded with spaces, so phrase checks ignore punctuation and match whole words.
  const phraseOf = (text: string) =>
    ` ${words(normaliseForSearch(text, locale), locale).join(' ')} `;
  const courseIds = new Set(items.filter((item) => item.kind === 'course').map((item) => item.id));
  const titles = new Map(items.map((item) => [item.id, phraseOf(item.title)]));
  const keywordText = new Map(items.map((item) => [item.id, phraseOf(item.keywords ?? '')]));

  return (keyword) => {
    const terms = [
      ...new Set(
        tokenise(keyword, locale)
          .map(processTerm)
          .filter((t): t is string => Boolean(t)),
      ),
    ];
    if (!terms.length) return new Map();
    // Words in most transcripts ("how", "to", but also "trauma") still score, but needn't match.
    const required = terms.some((t) => !stopwords.has(t))
      ? terms.filter((t) => !stopwords.has(t))
      : terms;

    // Each term may match the main fields loosely (prefix, typos) or the transcript strictly:
    // fuzzy matching against a whole transcript vocabulary mostly finds unrelated words.
    const termQuery = (term: string): Query => ({
      combineWith: 'OR',
      queries: [
        {
          queries: [term],
          fields: MAIN_FIELDS,
          prefix: term.length >= 3,
          fuzzy: term.length >= 5 ? 0.2 : false,
        },
        { queries: [term], fields: ['transcript'], prefix: term.length >= 4, fuzzy: false },
      ],
    });
    // The terms are already tokenised and stemmed; MiniSearch would otherwise process them again,
    // and a second stem strips another "article" from Arabic words like الوالدين.
    const options: SearchOptions = {
      boost: BOOST,
      maxFuzzy: 2,
      combineWith: 'OR',
      tokenize: (term) => [term],
      processTerm: (term) => term,
    };
    const results: SearchResult[] = index.search(
      { combineWith: 'OR', queries: terms.map(termQuery) },
      options,
    );

    // Results matching every term when any do, otherwise the best partial matches — AND with a
    // graceful fallback when someone's wording doesn't all appear in one item.
    const matched = (result: SearchResult) =>
      required.filter((term) => result.queryTerms.includes(term)).length;
    const best = Math.max(0, ...results.map(matched));

    const phrase = phraseOf(keyword);
    const scores = new Map<string, number>();
    for (const result of results) {
      if (matched(result) < best) continue;
      const id = String(result.id);
      let score = result.score;
      if (titles.get(id) === phrase) score *= 2;
      else if (terms.length > 1 && titles.get(id)?.includes(phrase)) score *= 1.5;
      else if (terms.length > 1 && keywordText.get(id)?.includes(phrase)) score *= 1.25;
      // A course covers its topic most fully; short session titles would otherwise outrank it.
      if (courseIds.has(id)) score *= 1.25;
      scores.set(id, score);
    }
    return scores;
  };
}
