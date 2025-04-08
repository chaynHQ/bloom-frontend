describe('User about you page should display', () => {
  const publicEmail = Cypress.env('CYPRESS_PUBLIC_EMAIL') as string;

  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(publicEmail, Cypress.env('CYPRESS_PUBLIC_PASSWORD'));
  });

  beforeEach(() => {
    cy.visit('/account/about-you');
  });

  it('header section', () => {
    cy.checkImage('Welcome to Bloom', 'welcome_to_bloom');
    cy.checkImage(
      `Illustration of a person's face and shoulders, with big leaves and flowers blooming above them`,
      'illustration_bloom_head_yellow',
    );
  });

  it('Help us understand section', () => {
    cy.get('h2').should('contain', 'Help us understand');
    cy.get('p').should(
      'contain',
      'These questions help us understand who is using Bloom and what kinds of support they need from us.',
    );
    cy.checkLink('/courses', 'Skip to courses');
  });

  it('About you panel', () => {
    cy.get('h2').should('contain', 'About you');

    cy.get('fieldset legend')
      .first()
      .should('contain', 'Please select one or more options that reflect your gender identity');
    cy.get('input[id="gender"]').should('exist').should('have.prop', 'role', 'combobox');
    cy.get('.MuiFormHelperText-root')
      .first()
      .should(
        'contain',
        `We are asking this to better understand how our users identify, with a view to designing even more inclusive and gender-affirming resources. You can select 'Prefer not to answer'.`,
      );

    cy.get('legend').contains(
      'Do you have a neurotype that affects the way your brain processes information? This might be a learning difficulty (I.e. Dyslexia, Dyspraxia, Dyscalculia), ADHD, or Autism.',
    );
    const neurodivergentOptions = ['Yes', 'No', 'Not sure', 'Prefer not to say'];
    neurodivergentOptions.forEach((option) => {
      cy.contains('label', option).should('exist').find('input[type="checkbox"]').should('exist');
    });
    cy.get('.MuiFormHelperText-root').eq(1).should('exist');

    cy.get('legend').contains(
      'How would you describe your race, ethnicity and nationality? E.g., White Hispanic Mexican, or Tamil Indian.',
    );
    cy.get('input[id="raceEthnNatn"]').should('exist').should('have.prop', 'type', 'text');
    cy.get('.MuiFormHelperText-root')
      .eq(2)
      .should(
        'contain',
        `We know that people's experiences of race and ethnicity vary widely based on where they live, so write what you feel best describes you personally.`,
      );

    cy.get('legend').contains('What country do you live in right now?');
    cy.get('input[id="country"]')
      .should('exist')
      .should('have.prop', 'role', 'combobox')
      .should('have.prop', 'required', true);
    cy.get('.MuiFormHelperText-root')
      .eq(3)
      .should(
        'contain',
        `This will help us understand where survivors are accessing our services from.`,
      );

    cy.get('legend').contains('What is your age group?');
    cy.get('input[name="age-radio-buttons-group"]').should('exist');
    const ageOptions = ['Under 18', '18-25', '25-35', '35-45', '45-55', '55+', 'Prefer not to say'];
    ageOptions.forEach((option, index) => {
      cy.get('input[name="age-radio-buttons-group"]')
        .eq(index)
        .should('have.prop', 'type', 'radio')
        .should('have.value', option);
    });

    cy.get('button').contains('Submit').should('have.prop', 'type', 'submit');
  });

  after(() => {
    cy.logout();
  });
});
