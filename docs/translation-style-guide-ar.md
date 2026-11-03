# Arabic translation rules

Rules for writing or generating Arabic (`ar`) copy for Bloom, in the app (`i18n/messages/`) and in
Storyblok. They come from Chayn's Arabic translators (their October 2026 review of the app
strings), the human-translated grounding exercises and activities, and decisions agreed in
October 2026. When a rule here disagrees with older copy, the rule wins.

Rules marked **(confirm)** are what the translators did most often but haven't been agreed
explicitly. Follow them until a translator says otherwise.

The Turkish rules are in [translation-style-guide-tr.md](translation-style-guide-tr.md).

## Where the rules apply

| Content                                                                             | Source                                                                      | Treat as                                                                                   |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| App strings (`i18n/messages/`)                                                      | AI, then reviewed by translators                                            | Follow this guide                                                                          |
| Storyblok pages (home, welcome, messaging, WhatsApp, therapy, meet the team, terms) | AI, rewritten to this guide in October 2026                                 | Follow this guide                                                                          |
| Grounding exercise and activity **text and titles**                                 | Human translations of Chayn's source documents, matching the narrated audio | **Never retranslate or "fix" to this guide.** Only correct clear typos, with a translator. |
| Grounding exercise and activity **card descriptions**                               | AI                                                                          | Follow this guide                                                                          |
| Courses, sessions, videos, audio, written resources                                 | English only by design                                                      | Don't translate                                                                            |

## General rules

| Use                                                                                                                            | Not                                                     | Why                                                        |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------- |
| One term per concept, everywhere (see the glossary)                                                                            | Synonyms for variety                                    | Users meet the same word in the menu, cards and pages      |
| `Bloom`, `Chayn`, `WhatsApp`, partner names in Latin script                                                                    | Transliterations (`بلوم`)                               | Brand names stay as written                                |
| Legal and business names as written: `BUMBLE HOLDING LTD`, `Chayn CIO`                                                         | Translated names (`شركة بامبل القابضة المحدودة`)        | They're names, not descriptions                            |
| The partner named on its own page: Badoo on the Badoo page                                                                     | Copying a sibling page                                  | A real error from copy-paste                               |
| Placeholders and tags exactly as in English: `{name}`, `{count}`, `<contactLink>…</contactLink>`, `<bold>…</bold>`             | Dropping, translating or moving a tag outside its words | Missing tags break formatting or links                     |
| An empty translation for an empty English string                                                                               | Placeholder words like `فارغ` ("Empty")                 | They render on the page                                    |
| Short labels (menu, buttons, filters)                                                                                          | A label plus an explanation                             | Long labels break navigation                               |
| Translated UI terms, even for things like "junk folder"                                                                        | English words left in the sentence **(confirm)**        | Unless the user will see that exact English in another app |
| ICU plural forms for counts, with all six Arabic forms: `{count, plural, zero {…} one {…} two {…} few {…} many {…} other {…}}` | A fixed noun after a number                             | Arabic agreement changes with the number                   |

### Storyblok rich text

- A sentence that wraps a link or bold text is split into several keys. **Translate the whole
  sentence first, then split it** so each piece still joins up: spaces at the edges, no doubled
  punctuation, the verb kept outside the link if the word order needs it.
- Translations of a rich-text field must keep **the same order of cards and blocks as the
  English**. Right-to-left layout mirrors columns automatically, so don't reverse them in the
  content. Pieces are matched to the English by position.

## Register and form of address

| Use                                                                                                  | Not                                                         | Where                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Modern Standard Arabic                                                                               | Dialect                                                     | App and Storyblok pages                                                               |
| The narrator's own dialect                                                                           | MSA rewrites                                                | Grounding exercise text (matches the audio)                                           |
| Plural, gender-inclusive address: `يمكنكم`، `أرسلوا`، `رسائلكم`                                      | Singular, masculine or feminine (`يمكنك`، `أرسل`، `تتلقّي`) | Everywhere (agreed October 2026). The human exercise text uses the plural throughout. |
| Doublets for groups of people: `الناجيات والناجين`، `المعالِجة أو المعالِج`، `المستخدمة أو المستخدم` | Masculine plural only                                       | Everywhere                                                                            |
| Bloom as feminine: `تعمل Bloom`، `تقدّمها`، `فهي مجانية`                                             | `يعمل Bloom`                                                | Everywhere. Partner apps stay masculine (`Badoo هو التطبيق`).                         |

## Glossary

| English                  | Use                             | Not                                       |
| ------------------------ | ------------------------------- | ----------------------------------------- |
| course                   | دورة تدريبية، الدورات التدريبية | دورة on its own                           |
| partner (organisation)   | الجهة الشريكة، الجهات الشريكة   | الشريك (a heading like `شركاؤنا` is fine) |
| abuse                    | الإساءة                         | سوء المعاملة                              |
| relationship abuse       | الإساءة في العلاقات             | إساءة العلاقات                            |
| healing                  | التعافي                         | الشفاء                                    |
| grounding                | تثبيت الذات                     | التأريض                                   |
| Notes from Bloom         | «رسائل من Bloom»                | ملاحظات من Bloom                          |
| Prefer not to say        | أفضّل عدم الإجابة               | أفضّل عدم الإفصاح                         |
| upload                   | تحميل                           | رفع                                       |
| problems                 | مشاكل                           | مشكلات                                    |
| affects                  | يؤثّر على                       | يؤثّر في                                  |
| USA                      | الولايات المتحدة الأمريكية      |                                           |
| psychologist             | أخصائية نفسية / أخصائي نفسي     | طبيبة نفسية (that's a psychiatrist)       |
| Expand / read the full … | عرض … كاملاً                    | توسيع                                     |

## Style

| Use                                                                                              | Not                                                    |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Imperatives in instructions and descriptions: `استكشفوا`، `تعرّفوا`، `اشتركوا`، `ثبّتوا التطبيق` | Verbal nouns: `الاستكشاف`، `الاشتراك`، `تثبيت التطبيق` |
| Verbal nouns on short buttons: `إنشاء حساب`، `تسجيل الدخول`، `إرسال`                             |                                                        |
| `ستحتاجون إلى` / `تحتاجون إلى`                                                                   | `سيلزم` / `يلزم`                                       |
| Polite questions: `هل ترغبون في المتابعة؟`                                                       | `هل نتابع؟`                                            |
| Tanween before the alef: `لاحقاً`، `دائماً`، `شكراً`                                             | On the alef: `لاحقًا`                                  |
| `التحقق`، `التأكد` without shadda                                                                | `التحقّق`، `التأكّد`                                   |
| Guillemets for quoted labels and titles: `«إضافة رمز»`                                           | Single or double quotes                                |
| Arabic comma `،` and question mark `؟`                                                           | Latin `,` `?`                                          |
| Western digits: `6 ساعات`، `24 ساعة`                                                             | Arabic-Indic digits                                    |
| Number-noun agreement: `10 ثوانٍ`، `15 ثانية`، `ساعتان`                                          | One noun form for every number                         |
| Named organisations with a noun: `شركة Meta`                                                     | `Meta` alone                                           |
| MSA verb forms: `رددنا`                                                                          | Colloquial forms: `ردّينا`                             |
