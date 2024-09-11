const welcomeBadooPageUrl = '/welcome/badoo';

describe('Welcome badoo page should display', () => {
  before(() => {
    cy.cleanUpTestState();
  });
  beforeEach(() => {
    cy.visit(welcomeBadooPageUrl);
  });
  it('bloom in partnership with badoo logo', () => {
    cy.checkImage('Bloom in partnership with Badoo logo', 'bloom_badoo_logo');
  });
  it('woman head purple illustration', () => {
    cy.checkImage(
      "Illustration of a person's face and shoulders, with big leaves and flowers blooming above them",
      'illustration_bloom_head_purple',
    );
  });
  it('partnership explanation text', () => {
    cy.get('p').should(
      'contain',
      'Together, Badoo and Bloom are providing resources to sexual assault and relationship abuse survivors within the global Badoo community, through a free, online trauma support program.',
    );
  });
  it('about the program content', () => {
    cy.checkImage('person with legs crossed holding heart', 'badoo_welcome_1');
    cy.get('h2').should('contain', 'About the program');
    cy.get('p').should(
      'contain',
      'Everyone’s healing journey is different. When we experience trauma due to sexual assault and relationship abuse, we may need support. Badoo partnered with Bloom to create a free, curated, online trauma support program for survivors. This program has been developed based on feedback from the global Badoo and Bloom communities.',
    );
  });

  it('about Bloom content', () => {
    cy.checkImage('leaves with a rose bloom', 'leaf_mix_bloom');
    cy.get('h2').should('contain', 'About Bloom');
    cy.get('p').should(
      'contain',
      'Bloom informs and empowers survivors by offering remote courses that combine the insights of survivors globally on trauma and gender-based violence with therapeutic practices to heal from trauma. Bloom is a programme by Chayn.',
    );
  });

  it('about Badoo content', () => {
    cy.checkImage('two leaves and a heart', 'illustration_leaf_mix_badoo');
    cy.get('h2').should('contain', 'About Badoo');
    cy.get('p').should(
      'contain',
      'Badoo is the app that keeps dating straightforward and exciting. Unlike other dating apps, which are high on pressure and superficiality, Badoo lets its community chat instantly and discover real people near them. Meanwhile, Badoo’s many safety features help daters stay in control.',
    );
  });

  it('about you content', () => {
    cy.checkImage('leaves with fire', 'leaf_mix_fire');
    cy.get('h2').should('contain', 'About you');
    cy.get('p').should(
      'contain',
      'The programme is available to any Badoo user who reports sexual abuse or assault to Badoo, regardless of your background, race, age, disability, religion or belief, sexuality, gender identity or expression, or life circumstances – we are here for you.',
    );
  });

  describe('for a non-logged in user', () => {
    const inputAccessCodeTag = 'input[id="accessCode"]';
    const labelAccessCodeTag = 'label[id="accessCode-label"]';
    it('get started panel', () => {
      cy.get('h2').should('contain', 'Get started');
      cy.get('p').should(
        'contain',
        'Enter the access code you received from Badoo to begin your Bloom journey.',
      );
      cy.get(labelAccessCodeTag).should('exist').should('have.attr', 'for', 'accessCode');
      cy.get(inputAccessCodeTag).should('exist');
    });
  });
  describe('for a public logged in user', () => {
    const email = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testtesttest';

    before(() => {
      cy.cleanUpTestState();
      cy.createUser({ emailInput: email, passwordInput: password });
      cy.logInWithEmailAndPassword(email, password);
    });
    it('continue to bloom panel', () => {
      const coursesUrl = '/courses';
      cy.get('h2').should('contain', 'Continue to Bloom');
      cy.get('p').should('contain', 'Pick up where you left off.');
      cy.checkLink(coursesUrl, 'Go to courses');
    });
    after(() => {
      cy.logout();
    });
  });
});
