import type { LibraryItem } from './libraryData';
import {
  buildTranscriptVocabulary,
  createLibrarySearch,
  normaliseForSearch,
  stem,
  tokenise,
} from './librarySearch';

const item = (overrides: Partial<LibraryItem>): LibraryItem => ({
  id: 'uuid',
  kind: 'session',
  themes: ['healing-journey'],
  title: 'A session',
  description: '',
  href: '/video/a-session',
  format: 'video',
  requiresAccount: false,
  ...overrides,
});

// Ids in ranked order, the way filterLibraryItems sorts them.
const ranked = (scores: Map<string, number>) =>
  [...scores].sort((a, b) => b[1] - a[1]).map(([id]) => id);

describe('normaliseForSearch', () => {
  it('folds a capital Turkish İ, which phones type at the start of a search', () => {
    expect(normaliseForSearch('İlişki', 'tr')).toBe(normaliseForSearch('ilişki', 'tr'));
    expect(normaliseForSearch('İlişki', 'en')).toBe('iliski');
  });

  it('ignores accents and apostrophes people often leave out', () => {
    expect(normaliseForSearch('Límites', 'es')).toBe('limites');
    expect(normaliseForSearch('şiddet', 'tr')).toBe('siddet');
    expect(normaliseForSearch('can’t', 'en')).toBe('cant');
  });

  it('treats Arabic letter variants as the same letter', () => {
    expect(normaliseForSearch('الصدمة', 'ar')).toBe(normaliseForSearch('الصدمه', 'ar'));
    expect(normaliseForSearch('أمان', 'ar')).toBe(normaliseForSearch('امان', 'ar'));
  });
});

describe('tokenise and stem', () => {
  it('also indexes hyphenated words whole', () => {
    expect(tokenise('self-care', 'en')).toEqual(['self', 'care', 'selfcare']);
  });

  it('folds regular plurals so singular and plural searches meet', () => {
    expect(stem('boundaries', 'en')).toBe(stem('boundary', 'en'));
    expect(stem('relationships', 'en')).toBe('relationship');
    expect(stem('stress', 'en')).toBe('stress');
  });

  it('drops the Arabic article, but not from a short word', () => {
    expect(stem('الحدود', 'ar')).toBe('حدود');
    expect(stem('الم', 'ar')).toBe('الم');
  });

  it('folds English -y, -ie and -ies together, so a word keeps matching as it is typed', () => {
    expect(['boundary', 'boundaries', 'boundarie'].map((w) => stem(w, 'en'))).toEqual([
      'boundari',
      'boundari',
      'boundari',
    ]);
    expect(stem('movie', 'en')).toBe(stem('movies', 'en'));
    expect(stem('lies', 'en')).toBe(stem('lie', 'en'));
    expect(stem('days', 'en')).toBe('day');
  });
});

describe('createLibrarySearch', () => {
  it('matches each word wherever it appears, in any order', () => {
    const search = createLibrarySearch(
      [item({ id: 'a', title: 'Healing from sexual trauma' })],
      'en',
    );

    expect(ranked(search('trauma sexual'))).toEqual(['a']);
  });

  it('finds a word from its start, its plural and a small typo', () => {
    const search = createLibrarySearch([item({ id: 'a', title: 'What are boundaries?' })], 'en');

    expect(ranked(search('boundary'))).toEqual(['a']);
    expect(ranked(search('bound'))).toEqual(['a']);
    expect(ranked(search('boundries'))).toEqual(['a']);
  });

  it('finds a word at every point while typing it', () => {
    const search = createLibrarySearch([item({ id: 'a', title: 'What are boundaries?' })], 'en');

    for (const typed of ['bou', 'boundar', 'boundari', 'boundarie', 'boundaries']) {
      expect(ranked(search(typed))).toEqual(['a']);
    }
  });

  it('stems an Arabic search only once', () => {
    // A second stem would turn الوالدين into دين, which no longer matches.
    const search = createLibrarySearch([item({ id: 'a', title: 'الوالدين' })], 'ar');

    expect(ranked(search('الوالدين'))).toEqual(['a']);
  });

  it('finds the Turkish İ whichever way it is typed', () => {
    const search = createLibrarySearch([item({ id: 'a', title: 'Sağlıklı ilişkiler' })], 'tr');

    expect(ranked(search('İlişki'))).toEqual(['a']);
    expect(ranked(search('saglikli'))).toEqual(['a']);
  });

  it('ranks title over keywords over description over course name', () => {
    const search = createLibrarySearch(
      [
        item({ id: 'course-name', courseTitle: 'Coercive control' }),
        item({ id: 'description', description: 'On coercive control' }),
        item({ id: 'keywords', keywords: 'coercive control, isolation' }),
        item({ id: 'title', title: 'Coercive control' }),
      ],
      'en',
    );

    expect(ranked(search('coercive control'))).toEqual([
      'title',
      'keywords',
      'description',
      'course-name',
    ]);
  });

  it('searches theme and format labels, counting a theme as the stronger hint', () => {
    const labels: Record<string, { themes: string[]; format: string }> = {
      theme: { themes: ['Grounding and calm'], format: 'Video' },
      format: { themes: ['Your healing journey'], format: 'Grounding' },
    };
    const search = createLibrarySearch([item({ id: 'format' }), item({ id: 'theme' })], 'en', {
      labelsFor: (i) => labels[i.id],
    });

    expect(ranked(search('video'))).toEqual(['theme']);
    expect(ranked(search('grounding'))).toEqual(['theme', 'format']);
  });

  it('puts a transcript mention last, and never matches a transcript loosely', () => {
    const search = createLibrarySearch(
      [item({ id: 'title', title: 'Gaslighting' }), item({ id: 'transcript' })],
      'en',
      { transcripts: { terms: { transcript: 'gaslighting danger' }, stopwords: [] } },
    );

    expect(ranked(search('gaslighting'))).toEqual(['title', 'transcript']);
    // "anger" is one letter from "danger"; that is fine for a title, not for a transcript.
    expect(search('anger').size).toBe(0);
  });

  it('wants every word matched, but falls back to the best partial matches', () => {
    const search = createLibrarySearch(
      [
        item({ id: 'both', title: 'Anger and shame' }),
        item({ id: 'anger', title: 'Anger' }),
        item({ id: 'shame', title: 'Shame' }),
      ],
      'en',
    );

    expect(ranked(search('anger shame'))).toEqual(['both']);
    expect(ranked(search('anger qigong')).sort()).toEqual(['anger', 'both']);
  });

  it('does not require words that appear in most transcripts', () => {
    const search = createLibrarySearch([item({ id: 'a', title: 'Setting boundaries' })], 'en', {
      transcripts: { terms: {}, stopwords: ['how', 'to'] },
    });

    expect(ranked(search('how to set boundaries'))).toEqual(['a']);
  });

  it('lifts a title containing a hyphenated search as a phrase', () => {
    const search = createLibrarySearch(
      [
        item({ id: 'apart', title: 'Care of self, selfcare' }),
        item({ id: 'phrase', title: 'Your self-care routine' }),
      ],
      'en',
    );

    expect(ranked(search('self-care'))[0]).toBe('phrase');
  });

  it('lifts an exact title match and a course over close calls', () => {
    const search = createLibrarySearch(
      [
        item({ id: 'longer', title: 'Anger is not the same as aggression' }),
        item({ id: 'exact', title: 'Anger' }),
        item({ id: 'session', title: 'Dating boundaries' }),
        item({ id: 'course', kind: 'course', title: 'Dating, boundaries, and relationships' }),
      ],
      'en',
    );

    expect(ranked(search('anger'))[0]).toBe('exact');
    expect(ranked(search('dating'))[0]).toBe('course');
  });

  it('returns nothing for a query with no words', () => {
    expect(createLibrarySearch([item({})], 'en')('  ?! ').size).toBe(0);
  });
});

describe('buildTranscriptVocabulary', () => {
  it('keeps passing mentions in short texts but drops them from long ones', () => {
    const long = `${'healing '.repeat(500)}${'grounding '.repeat(400)}football`;
    const { terms } = buildTranscriptVocabulary({ long, short: 'box breathing' }, 'en');

    expect(terms.long.split(' ')).toEqual(['healing', 'grounding']);
    expect(terms.short.split(' ')).toEqual(['box', 'breathing']);
  });

  it('treats a term in most stories as a stopword, once there are enough stories', () => {
    const texts = Object.fromEntries(
      Array.from({ length: 10 }, (_, n) => [
        `s${n}`,
        n < 5 ? 'trauma healing' : `trauma topic${n}`,
      ]),
    );
    const { terms, stopwords } = buildTranscriptVocabulary(texts, 'en');

    expect(stopwords).toEqual(['trauma', 'healing']);
    expect(terms.s9).toBe('topic9');
  });
});
