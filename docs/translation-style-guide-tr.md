# Turkish translation rules

Rules for writing or generating Turkish (`tr`) copy for Bloom, in the app (`i18n/messages/`) and
in Storyblok. They come from Chayn's Turkish translators: their October 2026 review of the app
strings and the Storyblok pages, and the human-translated grounding exercises and activities.
When a rule here disagrees with older copy, the rule wins.

The Arabic rules are in [translation-style-guide-ar.md](translation-style-guide-ar.md).

## Where the rules apply

| Content                                                                             | Source                                                                      | Treat as                                                                                   |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| App strings (`i18n/messages/`)                                                      | AI, then reviewed by translators                                            | Follow this guide                                                                          |
| Storyblok pages (home, welcome, messaging, WhatsApp, therapy, meet the team, terms) | AI, reviewed by translators                                                 | Follow this guide                                                                          |
| Grounding exercise and activity **text and titles**                                 | Human translations of Chayn's source documents, matching the narrated audio | **Never retranslate or "fix" to this guide.** Only correct clear typos, with a translator. |
| Grounding exercise and activity **card descriptions**                               | AI, reviewed by translators                                                 | Follow this guide, but use formal `siz` to match the exercise text (see Register)          |
| Courses, sessions, videos, audio, written resources                                 | English only by design                                                      | Don't translate                                                                            |

## General rules

| Use                                                                                                                | Not                                                           | Why                                                        |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------- |
| One term per concept, everywhere (see the glossary)                                                                | Synonyms for variety                                          | Users meet the same word in the menu, cards and pages      |
| `Bloom`, `Chayn`, `WhatsApp`, partner names as written                                                             | Translated or respelled brand names                           | Brand names stay as written                                |
| Legal and business names as written: `BUMBLE HOLDING LTD`, `Chayn CIO`, `Sam Salenger Coaching`                    | Translated names (`Sam Salenger Koçluk`)                      | They're names, not descriptions                            |
| The partner named on its own page: Badoo on the Badoo page                                                         | Copying a sibling page (`Bumble ile Bloom` on the Badoo page) | A real error from copy-paste                               |
| Placeholders and tags exactly as in English: `{name}`, `{count}`, `<contactLink>…</contactLink>`, `<bold>…</bold>` | Dropping, translating or moving a tag outside its words       | Missing tags break formatting or links                     |
| An empty translation for an empty English string                                                                   | Placeholder words like `Boş` ("Empty")                        | They render on the page                                    |
| Short labels (menu, buttons, filters)                                                                              | A label plus an explanation                                   | Long labels break navigation                               |
| Translated UI terms                                                                                                | English words left in the sentence                            | Unless the user will see that exact English in another app |

### Storyblok rich text

- A sentence that wraps a link or bold text is split into several keys. **Translate the whole
  sentence first, then split it** so each piece still joins up: spaces at the edges, no doubled
  punctuation, the verb kept outside the link if the word order needs it.
- Translations of a rich-text field must keep **the same order of cards and blocks as the
  English**. Pieces are matched to the English by position.

## Register

| Use                                               | Not                                                     | Where                                                                                                |
| ------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Informal `sen` (`dene`, `hesabın`, `edebilirsin`) | Formal `siz` (`deneyin`, `hesabınız`)                   | App, Storyblok pages, legal and therapy agreement text                                               |
| Formal `siz`                                      | `sen`                                                   | Card descriptions of grounding exercises and activities, to match the human exercise text below them |
| One register per sentence                         | Mixed (`e-postanızdaki … kullanın … seansını … göster`) | Everywhere                                                                                           |

## Glossary

| English                         | Use                                 | Not                                |
| ------------------------------- | ----------------------------------- | ---------------------------------- |
| trauma-informed                 | travma bilgili                      | travmaya duyarlı                   |
| trauma-sensitive, trauma-aware  | travmaya duyarlı                    | travma bilgili                     |
| abuse                           | şiddet ve istismar                  | istismar alone                     |
| relationship abuse              | ilişki içi istismar                 | ilişki istismarı                   |
| gender-based violence           | toplumsal cinsiyete dayalı şiddet   | cinsiyet temelli şiddet            |
| survivors                       | hayatta kalanlar                    |                                    |
| healing journey / process       | iyileşme yolculuğu, iyileşme süreci |                                    |
| help (get help, immediate help) | destek: `Destek Al`, `Acil destek`  | yardım: `Yardım Al`, `Acil yardım` |
| course                          | kurs                                |                                    |
| session (in a course)           | bölüm                               | seans                              |
| therapy session                 | seans                               | bölüm                              |
| grounding                       | köklenme, köklen                    | topraklanma, topraklan             |
| Library                         | Kütüphane                           |                                    |
| Apply a code                    | Kodu uygula                         | Kod ekle                           |
| Reset password (button, title)  | Şifreyi yenile                      | Şifreyi sıfırla                    |
| Prefer not to say               | Belirtmemeyi tercih ederim          | Söylememeyi tercih ederim          |
| age group                       | yaş aralığı                         | yaş grubu                          |
| Funded by                       | Destekleyenler                      | Finanse eden, Mali destekleriyle   |
| Our partnerships                | İş birliklerimiz                    |                                    |
| partner (organisation)          | iş ortağı                           |                                    |
| charity                         | hayır kuruluşu                      | hayır kurumu                       |
| confidential, private           | mahrem, gizliliğini koruyan         | gizli                              |
| Relatable                       | Kendime yakın buldum                | Bana yakın                         |
| Not now                         | Daha sonra                          | Şimdi değil                        |
| script (technical)              | komut dosyası                       | betik                              |
| a person (image descriptions)   | insan                               | kişi                               |
| Current (session, course)       | Şu anki                             | Mevcut (reads as "available")      |

## Style

| Use                                                                                                | Not                                          |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Present continuous for ongoing facts: `yardımcı oluyor`                                            | Aorist: `yardımcı olur`                      |
| Short sentences: split long ones (`Daha sonra tekrar dene. Bu hatayı …`)                           | One long sentence joined with `ve`           |
| Double quotes for quoted labels and titles: `"Kodu uygula"`                                        | Single quotes                                |
| Apostrophe after proper names: `Bloom'a`, `WhatsApp'ına`                                           | `Bloom a`                                    |
| No apostrophe on common words: `Podcastler`                                                        | `Podcast'ler`                                |
| Lowercase weekdays in ranges: `pazartesiden cumaya`; time zone after the time: `10.00-22.00 (IST)` | `Pazartesiden Cumaya`, `IST ile 10.00-22.00` |
| A participle when a fragment runs into a name: `Florida'da yaşayan, Eliane …`                      | A full verb: `Florida'da yaşıyor, Eliane …`  |
| `birçok`                                                                                           | `bir çok`                                    |
