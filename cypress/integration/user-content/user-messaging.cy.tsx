describe('A logged in public user can', () => {
  const email = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
    cy.logInWithEmailAndPassword(email, password);
  });

  it('Navigate to the messaging page', () => {
    cy.visit('/'); // initial home page visit
    cy.get(`[qa-id=secondary-nav-messaging-button]`, { timeout: 8000 }).should('exist').click(); //go to messaging page
  });

  it('see the More about section', () => {
    cy.visit('/messaging');
    cy.get('h2').contains('Tell us what’s on your mind');
    cy.get('h2').contains('Meet the Bloom messaging team');
    cy.get('h2').contains('More about how Bloom’s Messaging works');
    cy.checkImage('Illustration of a person sitting', 'illustration_course_dbr');
    cy.get('h3').contains('Who is 1-1 Messaging for?');
    cy.get('p').contains(
      '1-1 Messaging is available for everyone using Bloom, regardless of your background, race, age, disability, religion or belief, sexuality, gender identity or expression, or life circumstances—we are here for you.',
    );
  });

  describe('FrontChat widget', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/front-chat/messages', { body: { messages: [] } }).as('getHistory');
      cy.intercept('PATCH', '**/front-chat/read', { statusCode: 204 }).as('markRead');
    });

    const connectSocket = () => {
      cy.window().should((win) => {
        expect((win as any).__frontChatSocket).to.exist;
      });
      cy.window().then((win) => {
        const socket = (win as any).__frontChatSocket;
        socket.connected = true;
        socket.trigger('connect');
      });
    };

    it('renders the welcome message and enables the composer when connected', () => {
      cy.visit('/messaging');
      connectSocket();
      cy.contains('Bloom Team').should('be.visible');
      cy.get('[aria-label="Write a message…"]').should('not.be.disabled');
    });

    it('displays history messages fetched from the API', () => {
      cy.intercept('GET', '**/front-chat/messages', {
        body: {
          messages: [
            { id: 'h1', direction: 'user', text: 'Hello there', createdAt: Date.now() - 60000 },
            {
              id: 'h2',
              direction: 'agent',
              text: 'Hi! How can I help?',
              authorName: 'Alex',
              createdAt: Date.now() - 50000,
            },
          ],
        },
      }).as('getHistory');
      cy.visit('/messaging');
      connectSocket();
      cy.contains('Hello there').should('be.visible');
      cy.contains('Hi! How can I help?').should('be.visible');
    });

    it('sends a text message and shows it as sent', () => {
      cy.visit('/messaging');
      connectSocket();
      cy.get('[aria-label="Write a message…"]').type('Hi from Cypress');
      cy.get('button[aria-label="Send message"]').click();
      cy.contains('Hi from Cypress').should('be.visible');
      cy.contains("Couldn't send").should('not.exist');
    });

    it('displays an incoming agent reply', () => {
      cy.visit('/messaging');
      connectSocket();
      cy.window().then((win) => {
        (win as any).__frontChatSocket.trigger('agent_reply', {
          id: 'msg_agent_1',
          body: 'How are you doing today?',
          authorName: 'Bloom Team',
          emittedAt: Date.now() / 1000,
        });
      });
      cy.contains('How are you doing today?').should('be.visible');
    });
  });

  after(() => {
    cy.logout();
  });
});
