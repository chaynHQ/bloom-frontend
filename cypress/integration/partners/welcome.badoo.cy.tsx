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
    cy.checkImage(
      'Illustration of a person sitting down with a laptop. Illustrations of video, messaging and flowers are included.',
      'landing_page_illo',
    );
    cy.get('h2').should('contain', 'About the program');
    cy.get('p').should(
      'contain',
      'Everyone’s healing journey is different. When we experience trauma such as sexual assault and relationship abuse, we may need support to manage the aftermath effects. Badoo has partnered with Bloom to create a free, custom curated online trauma support program for survivors of sexual assault and relationship abuse. This program has been developed based on feedback from the global Badoo and Bloom communities.',
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

  describe('for a non-logged in user', () => {
    it('get started button', () => {
      cy.get('a[href="/auth/register?partner=badoo"]').should('contain', 'Get started');
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
      cy.get('a[href="/courses"]').should('contain', 'Go to courses');
    });
    after(() => {
      cy.logout();
    });
  });
});
