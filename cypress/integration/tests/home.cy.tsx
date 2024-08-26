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
    cy.checkLink('/chat', '');

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
});
