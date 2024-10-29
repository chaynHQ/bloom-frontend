const HOME_PAGE_URL = '/';

describe('Home page should display', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  beforeEach(() => {
    cy.visit(HOME_PAGE_URL);
  });

  it('join us section', () => {
    cy.get('h1').should('contain', 'Join us on your healing journey');
    cy.get('p').should(
      'contain',
      'Bloom is here for you to learn, heal and grow towards a confident future.',
    );
    cy.checkImage(
      'Person sitting crossed legged with symbols floating around such as a video icon, flower, message icon and a persons head with a flower',
      'landing_page_illustration',
    );
    cy.checkLink('/auth/register', 'Get started');
  });

  it('our free services section', () => {
    cy.get('h2').should('contain', 'Our free services');

    cy.checkImage('coursesIcon', 'icon_courses');
    cy.get('h3').should('contain', 'Online video courses');
    cy.checkLink('/courses', '');

    cy.checkImage('chatIcon', 'icon_chat');
    cy.get('h3').should('contain', '1-to-1 Messaging');
    cy.checkLink('/messaging', '');

    cy.checkImage('activityIcon', 'icon_activities');
    cy.get('h3').should('contain', 'Reflective activities');
    cy.checkLink('/activities', '');

    cy.checkImage('groundingIcon', 'icon_grounding');
    cy.get('h3').should('contain', 'Guided grounding activities');
    cy.checkLink('/grounding', '');

    cy.checkImage('notesIcon', 'icon_notes');
    cy.get('h3').should('contain', 'Notes: Whatsapp messages from us');
    cy.checkLink('/subscription/whatsapp', '');

    cy.checkLink('/auth/register', 'Get started');
  });

  it('why bloom section', () => {
    cy.get('h2').should('contain', 'Why Bloom?');
    cy.get('p').should('contain', 'Bloom is here for you, whoever and wherever you are.');

    cy.checkImage('pinkHeartWhiteBackground', 'pinkheartwhitebackground');
    cy.get('h3').should('contain', 'Free and Anonymous');

    cy.checkImage('pinkPlayPauseWhiteBackground', 'pinkplaypausewhitebackground');
    cy.get('h3').should('contain', 'Explore at your own pace');

    cy.checkImage('pinkGlobeWhiteBackground', 'pinkglobewhitebackground');
    cy.get('h3').should('contain', 'Multilingual');
  });

  it('our bloom team section', () => {
    cy.get('h2').should('contain', 'Our Bloom Team');

    cy.checkImage('spanish_team', 'spanish_team');
    cy.get('h3').should('contain', 'Spanish');

    cy.checkImage('hindi_team', 'hindi_team');
    cy.get('h3').should('contain', 'Hindi');

    cy.checkImage('french_team', 'french_team');
    cy.get('h3').should('contain', 'French');

    cy.checkImage('english_team', 'english_team');
    cy.get('h3').should('contain', 'English');

    cy.checkImage('portuguese_team', 'portuguese_team');
    cy.get('h3').should('contain', 'Portuguese');

    cy.checkImage('bloom_german', 'bloom_german-presenters');
    cy.get('h3').should('contain', 'German');

    cy.checkLink('/meet-the-team', 'Meet the team');
  });

  it('our themes section', () => {
    cy.get('h2').should('contain', 'Our themes');
    cy.checkImage('leaves with fire', 'leaf_mix_fire');

    const themes = [
      'Guilt and Shame',
      'Positive coping mechanism',
      'Myths of the Patriarchy',
      'Sex after assault',
      'Emotional boundaries',
      'Image-based abuse',
    ];
    themes.forEach((theme) => {
      cy.get('p').contains(theme).parents('a[href="/courses"]').should('exist');
    });

    cy.checkLink('/auth/register', 'Get started');
  });

  it('testimonial section', () => {
    cy.checkImage('Illustration of a person sitting cross legged with a tea', 'tea_blue');
    cy.get('blockquote').should(
      'contain',
      'It has brought so much clarity to my past experiences, putting words, labels, researched proof to what I didn’t know how to explain or process, I just knew the feelings.',
    );

    cy.checkImage('Illustration of a person sitting, holding a tea', 'illustration_person4_peach');
    cy.get('blockquote').should(
      'contain',
      `Bloom has been a great experience for me. The course has made me reflect a lot on what it means to "work on yourself" and how that looks like. And through Bloom, I've realized that working on yourself is similar to school or hobbies - it takes commitment, time, and studying. This course is anonymous, accessible, and time sensitive - I think it gives grace to all participants who need that time, space, and encouragement to get through the sessions.`,
    );
  });
});
