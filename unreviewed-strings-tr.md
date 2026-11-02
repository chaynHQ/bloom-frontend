# Bloom: Turkish strings for review

## What we carried over from your review

- Informal "sen" throughout.
- "Kurs" for course, "bölüm" for a session in a course, "seans" for a therapy session.
- "Abuse" as "şiddet ve istismar", as in your `Account.applyCode.introduction`.
- "Tehlike" for harm, as in your `Courses.sessionDetail.chat.detailImmediateHelp`.

## Questions

1. **Dismiss:** the Fruitz banner now says "Reddet" ("Reject"), while the new redesign banner uses "Kapat" ("Close"). Which do you prefer for closing a banner?
2. **Formal vs informal:** the reviewed footer and site description use formal "hizmetinize sunuluyor", and `Auth.form.contactPermissionLabel` uses "görüşlerinizi". The rest of the app uses "sen". Is the formal wording intentional there?
3. **"Abuse":** you changed "istismar" to "şiddet ve istismar" in `Account.applyCode.introduction`. We did the same in the Library themes below (e.g. "Şiddet ve istismarı fark etmek"). Right everywhere, or should some use "istismar" alone?

## Strings to review

### Library page

**1.** `Library.noResults.title`

- No matches for those filters
- Bu filtreler için sonuç yok

**2.** `Library.noResults.body`

- Try removing a filter or two, or explore a different theme — there’s more waiting in the library.
- Bir iki filtreyi kaldırmayı ya da başka bir temayı keşfetmeyi dene — kütüphanede seni bekleyen daha çok şey var.

**3. Theme: Recognising abuse** (`Library.themes.recognising-abuse`)

- _label_ — Recognising abuse
  - Şiddet ve istismarı fark etmek
  - _Note: See question 3 ("abuse" → "şiddet ve istismar")._
- _blurb_ — Naming abuse in relationships and everyday life
  - İlişkilerde ve gündelik hayatta şiddet ve istismarı adlandırmak
- _description_ — Abuse isn’t always obvious. Explore what it can look like in relationships and everyday life, and find language for experiences that have been hard to name.
  - Şiddet ve istismar her zaman açıkça görünmez. İlişkilerde ve gündelik hayatta nasıl görünebileceğini keşfet; adlandırması zor olan deneyimler için kelimeler bul.

**4. Theme: Why abuse happens** (`Library.themes.why-abuse-happens`)

- _label_ — Why abuse happens
  - Şiddet ve istismar neden yaşanır
- _blurb_ — Learn about the social and systemic forces behind abuse
  - Şiddet ve istismarın ardındaki toplumsal ve sistemsel güçleri öğren
- _description_ — Abuse is shaped by more than one person’s choices. Understand the social, cultural, and systemic forces that allow abuse to happen — and why none of it is your fault.
  - Şiddet ve istismar, tek bir kişinin seçimlerinden ibaret değildir. Şiddet ve istismarın yaşanmasına zemin hazırlayan toplumsal, kültürel ve sistemsel güçleri anla. Bunların hiçbiri senin suçun değil.

**5. Theme: Your body after trauma** (`Library.themes.body-after-trauma`)

- _label_ — Your body after trauma
  - Travma sonrası bedenin
- _blurb_ — How trauma lives in the body
  - Travma bedende nasıl yaşar
- _description_ — Trauma lives in the body as much as the mind. Learn how your nervous system responds to what you’ve been through, and gentle, body-based ways to feel safer.
  - Travma zihinde olduğu kadar bedende de yaşar. Sinir sisteminin yaşadıklarına nasıl tepki verdiğini ve kendini daha güvende hissetmenin nazik, bedene dayalı yollarını öğren.

**6. Theme: Setting boundaries** (`Library.themes.setting-boundaries`)

- _label_ — Setting boundaries
  - Sınır koymak
- _blurb_ — Emotional, physical, sexual, and digital boundaries
  - Duygusal, fiziksel, cinsel ve dijital sınırlar
- _description_ — Boundaries protect your wellbeing across every part of life. Explore how to recognise, set, and hold emotional, physical, sexual, and digital boundaries.
  - Sınırlar hayatın her alanında iyilik halini korur. Duygusal, fiziksel, cinsel ve dijital sınırları nasıl fark edeceğini, koyacağını ve koruyacağını keşfet.

**7. Theme: Your healing journey** (`Library.themes.healing-journey`)

- _label_ — Your healing journey
  - İyileşme yolculuğun
- _blurb_ — Finding your way through grief, growth, and recovery
  - Yas, büyüme ve iyileşme içinde kendi yolunu bulmak
- _description_ — Healing isn’t linear. Find companionship and tools for moving through grief, growth, and recovery at whatever pace feels right for you.
  - İyileşme doğrusal değildir. Yas, büyüme ve iyileşme süreçlerinde sana eşlik edecek kaynakları ve araçları, sana uygun gelen hızda keşfet.

**8. Theme: Staying safe now** (`Library.themes.staying-safe`)

- _label_ — Staying safe now
  - Şimdi güvende kalmak
- _blurb_ — Safety planning and coping with ongoing abuse
  - Güvenlik planlaması ve süregelen şiddet ve istismarla baş etmek
- _description_ — If you’re still in or near harm, safety comes first. Find practical support for safety planning and for coping when things feel unsafe right now.
  - Hâlâ tehlike altındaysan ya da tehlikeye yakınsan, önce güvenliğin gelir. Güvenlik planı yapmak ve şu an kendini güvende hissetmediğin anlarla baş etmek için pratik destek bul.

**9.** `Shared.librarySections.continueLearning.heading`

- Pick up where you left off
- Kaldığın yerden devam et

**10.** `Shared.librarySections.sessions.introduction`

- Sessions on understanding abuse, setting boundaries, healing, and more.
- Şiddet ve istismarı anlama, sınır koyma, iyileşme ve daha fazlası üzerine bölümler.

**11.** `Shared.librarySections.courses.introduction`

- A guided place to begin. Each course takes you through a set of sessions at your own pace.
- Başlamak için rehberli bir yer. Her kurs seni kendi hızında bir dizi bölümden geçirir.

### Home page, sign-up and support sections

**12.** `Auth.register.description`

- Join Bloom, always free. Our courses combine insights on trauma and gender-based violence with therapeutic practices to help us heal.
- Bloom'a katıl, her zaman ücretsiz. Kurslarımız, travma ve toplumsal cinsiyete dayalı şiddete dair bilgileri iyileşmemize yardımcı olan terapötik uygulamalarla birleştirir.

**13.** `Home.hero.joinCta`

- Join Bloom, always free
- Bloom'a katıl, her zaman ücretsiz

**14.** `Shared.supportSection.introduction`

- Prefer to talk to someone? Bloom’s support services are here whenever you need them.
- Biriyle konuşmayı mı tercih edersin? Bloom'un destek hizmetleri ihtiyaç duyduğun her an burada.

**15.** `Shared.supportSection.messaging.description`

- Thoughtful replies to your questions and reflections, from our multilingual team, within 1–2 days.
- Sorularına ve düşüncelerine, çok dilli ekibimizden 1–2 gün içinde özenli yanıtlar.

**16.** `Shared.supportSection.notes.description`

- Support from Bloom, delivered to your WhatsApp twice a week.
- Bloom'dan destek, haftada iki kez doğrudan WhatsApp'ına.

**17.** `Shared.signUpSection.title`

- Built with you in mind
- Seni düşünerek tasarlandı

**18.** `Shared.signUpSection.introduction`

- Bloom is here for you, whoever and wherever you are.
- Bloom senin için burada; kim olursan ol, nerede olursan ol.

**19.** `Shared.signUpSection.freeAndAnonymous`

- Free and anonymous
- Ücretsiz ve anonim

### Session and resource pages

**20.** `Resources.moment.title`

- Do you need a moment?
- Bir mola ister misin?

**21.** `Resources.moment.subtitle`

- If at any point during the session you need a moment, use our groundings below.
- Bölüm sırasında herhangi bir anda mola vermeye ihtiyaç duyarsan, aşağıdaki köklenme egzersizlerimizi kullan.

**22.** `Resources.complete.body`

- You showed up today. Take a moment before moving on.
- Bugün kendin için buradaydın. Devam etmeden önce bir an dur.

**23.** `Resources.relatedContent.title`

- Want to explore more?
- Daha fazlasını keşfetmek ister misin?
- _English when you last reviewed: "Related content" — your translation: İlgili içerik(ler)_

**24.** `Resources.relatedContent.subtitle`

- Have a look at our related sessions below, to help your healing journey.
- İyileşme yolculuğunda sana yardımcı olması için aşağıdaki ilgili bölümlerimize göz at.

**25.** `Resources.languageUnavailable.title`

- This resource isn't available in your language yet
- Bu kaynak henüz senin dilinde mevcut değil

**26.** `Resources.languageUnavailable.introduction`

- We're working on bringing Bloom's resources to more languages. In the meantime, explore what's available in your language in the &lt;contactLink&gt;library&lt;/contactLink&gt;.
- Bloom kaynaklarını daha fazla dile taşımak için çalışıyoruz. Bu sırada, kendi dilinde neler olduğunu &lt;contactLink&gt;kütüphanede&lt;/contactLink&gt; keşfedebilirsin.

### Course pages

**27.** `Courses.courseDetail.accessCard.body`

- Create a free account to unlock all sessions and log your progress.
- Tüm bölümlerin kilidini açmak ve ilerlemeni kaydetmek için ücretsiz bir hesap oluştur.

### Menu and "Bloom had a makeover!" banner

**28.** `RedesignBanner.headline`

- Bloom had a makeover!
- Bloom yenilendi!

**29.** `RedesignBanner.supportingText`

- Courses, sessions and activities now live together in the Library, so they’re easier to browse and filter 💜
- Kurslar, bölümler ve etkinlikler artık Kütüphane’de bir arada; böylece göz atmak ve filtrelemek daha kolay 💜
