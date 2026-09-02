// A logged-out visitor can browse a public course and fully use its first session.
// `image-based-abuse-and-rebuilding-ourselves` is `included_for_partners: ['Public', ...]`.
describe('A logged out visitor on a public course', () => {
  const courseSlug = 'courses/image-based-abuse-and-rebuilding-ourselves';

  before(() => {
    cy.cleanUpTestState();
  });

  it('sees the sign-up card and only the first session unlocked on the overview', () => {
    cy.visit(`/${courseSlug}`);

    cy.get('[qa-id=access-full-course-card]', { timeout: 8000 })
      .should('exist')
      .within(() => {
        cy.contains('Access the full course').should('exist');
        cy.get('[qa-id=access-full-course-cta]')
          .should('have.attr', 'href')
          .and('include', '/auth/register');
        cy.get('a[href*="/auth/login"]').should('exist');
      });

    cy.get('[qa-id=course-session-card]').then((cards) => {
      cy.wrap(cards[0]).find('[qa-id=course-session-card-account-needed]').should('not.exist');
      cy.wrap(cards[1]).find('[qa-id=course-session-card-account-needed]').should('exist');
    });
  });

  it('opens the first session as a full preview with no login dialog', () => {
    cy.visit(`/${courseSlug}`);
    cy.get('[qa-id=course-session-card]', { timeout: 8000 }).first().click();

    cy.get('[qa-id=dialogLoginButton]').should('not.exist');
    cy.get('[qa-id=session-media-card]').should('exist');
    cy.get('[qa-id=session-activity]').should('exist');

    // Account-only sections are replaced by the sign-up card.
    cy.get('[qa-id=session-chat]').should('not.exist');
    cy.get('[qa-id=session-complete-button]').should('not.exist');
    cy.get('[qa-id=access-full-course-card]').should('exist');

    // The playlist keeps the first session open and locks the rest.
    cy.get('[qa-id=session-playlist]')
      .first()
      .within(() => {
        cy.get('li').eq(1).find('[data-testid=LockOutlinedIcon]').should('exist');
      });
  });

  it('gates a later session behind the sign-up card', () => {
    cy.visit(`/${courseSlug}`);
    cy.get('[qa-id=course-session-card]', { timeout: 8000 }).eq(1).click();

    cy.get('[qa-id=access-full-course-card]').should('exist');
    cy.get('[qa-id=session-media-card]').should('not.exist');
  });
});
