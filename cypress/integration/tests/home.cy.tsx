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

    cy.checkImage('notesIcon', 'icon_notes');
    cy.get('h3').should('contain', 'Notes: WhatsApp messages from us');
    cy.checkLink('/subscription/whatsapp', '');

    cy.checkLink('/auth/register', 'Get started');
  });

  it('why bloom section', () => {
    cy.get('h2').should('contain', 'Why Bloom?');
    cy.get('p').should('contain', 'Bloom is here for you, whoever and wherever you are.');
  });

  it('our bloom team section', () => {
    cy.get('h2').should('contain', 'Our Bloom Team');

    cy.checkImage('spanish_team', 'spanish_team');
    cy.get('h3').should('contain', 'Spanish');

    cy.checkImage('french_team', 'french_team');
    cy.get('h3').should('contain', 'French');

    cy.checkLink('meet-the-team', 'Meet the team');
  });

  it('our themes section', () => {
    cy.get('h2').should('contain', 'Our themes');
    cy.checkImage('leaves with fire', 'leaf_mix_fire');

    const themes = ['Positive coping mechanism', 'Sex after assault'];
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
  });
});
