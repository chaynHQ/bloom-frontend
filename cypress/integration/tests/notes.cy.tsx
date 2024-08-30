describe('A logged in user should be able to subscribe to notes from bloom', () => {
  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(
      Cypress.env('CYPRESS_PUBLIC_EMAIL'),
      Cypress.env('CYPRESS_PUBLIC_PASSWORD'),
    );
  });

  it('Should go to the notes page and try to subscribe using an incorrect number', () => {
    cy.visit('/');
    cy.get(`[qa-id=secondary-nav-notes-button]`, { timeout: 8000 }).should('exist').click(); //navigate to notes

    cy.get('h2').contains('Subscribe to Notes from Bloom').should('exist'); //check subscribe to notes form exists

    cy.get('input[type="tel"]').should('exist').type('0101'); //type invalid number

    cy.get('button[type="submit"]').contains('Subscribe').click(); //submit form

    cy.get('p', { timeout: 3000 }).should('contain', 'Your phone number appears to be invalid'); //check the form submission fails
  });

  describe('Notes page should display', () => {
    const SUBSCRIPTION_WHATSAPP_PAGE_URL = '/subscription/whatsapp';

    beforeEach(() => {
      cy.visit(SUBSCRIPTION_WHATSAPP_PAGE_URL);
    });

    it('heading section', () => {
      cy.get('h1').should('contain', 'Sign up to Notes from Bloom');
      cy.get('p').should(
        'contain',
        'The path to healing can be lonely and sometimes thorny. Our Notes from Bloom are twice-weekly reminders, encouragement, affirmations, and activities from our courses, sent directly to your phone to help you continue your healing journey.',
      );
      cy.get('p').should(
        'contain',
        'Notes from Bloom is another way to connect with Bloom and anyone can sign up — whether you’re yet to start digging into our courses or have finished multiple sessions.',
      );
      cy.get('p').should(
        'contain',
        'You’ll be able to contribute to making Bloom better for you, and everyone else, by anonymously sharing your tips and experiences. Curated by Bloom’s global community of survivors and allies, Notes from Bloom are buds to remind you that we are here to support you, wherever you are. Our notes are currently only available in English.',
      );
      cy.checkImage('Illustration of a phone with a message', 'illustration_notes');
    });

    it('subscribe to notes section', () => {
      cy.checkImage(
        `Illustration of a side profile of a person's face, with a flower`,
        'illustration_choose_therapist',
      );
      cy.get('p').should('contain', 'We send messages to your Whatsapp number.');
      cy.checkImage(
        `Illustration of a calendar with a heart in the middle`,
        'illustration_date_selector',
      );
      cy.get('p').should(
        'contain',
        'The messages are sent twice a week, on Wednesdays and Sundays.',
      );
      cy.checkImage(
        `Illustration of a cycle - three suns in a circle with arrows between them`,
        'illustration_change',
      );
      cy.get('p').should(
        'contain',
        'If you change your mind, you can un-subscribe or resubscribe at any time.',
      );

      cy.get('h2').should('contain', 'Subscribe to Notes from Bloom');
      cy.get('label').contains('Phone number');
      cy.get('input[aria-hidden="true"]').should('exist').should('have.value', 'gb');
      cy.get('input[id="phoneNumber"]').should('exist').should('have.prop', 'type', 'tel');
      cy.get('button').contains('Subscribe').should('have.prop', 'type', 'submit');
    });

    it('more about section', () => {
      cy.get('h2').should('contain', 'More about Notes from Bloom');
      cy.checkImage('alt', 'illustration_leaf_mix');

      cy.fixture('subscription-whatsapp').then(
        (data: { notes: { question: string; answer: string }[] }) => {
          data.notes.forEach((note) => {
            cy.get('p').contains(note.question).parents('.MuiAccordion-root').contains(note.answer);
          });
        },
      );
    });
  });

  after(() => {
    cy.logout();
  });
});
