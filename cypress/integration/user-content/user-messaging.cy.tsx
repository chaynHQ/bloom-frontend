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

  describe('Messaging widget', () => {
    beforeEach(() => {
      cy.intercept('PATCH', '**/front-chat/read', { statusCode: 204 }).as('markRead');
    });

    const connectSocket = () => {
      cy.window().should((win) => {
        expect((win as any).__messagingSocket).to.exist;
      });
      cy.window().then((win) => {
        const socket = (win as any).__messagingSocket;
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
      cy.visit('/messaging');
      connectSocket();
      cy.window().then((win) => {
        (win as any).__messagingSocket.trigger('history', {
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
        });
      });
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
        (win as any).__messagingSocket.trigger('agent_reply', {
          id: 'msg_agent_1',
          body: 'How are you doing today?',
          authorName: 'Bloom Team',
          emittedAt: Date.now() / 1000,
        });
      });
      cy.contains('How are you doing today?').should('be.visible');
    });

    it('records a voice note and sends it as a message', () => {
      cy.intercept('POST', '**/front-chat/attachments', { statusCode: 204 }).as('uploadVoice');
      cy.visit('/messaging', {
        onBeforeLoad(win) {
          const mockStream = { getTracks: () => [{ stop: () => {} }] };
          (win.navigator as any).mediaDevices = {
            getUserMedia: () => Promise.resolve(mockStream),
          };
          class StubRecorder {
            static isTypeSupported() {
              return true;
            }
            state = 'inactive';
            mimeType: string;
            ondataavailable: ((e: { data: Blob }) => void) | null = null;
            onstop: (() => void) | null = null;
            constructor(_stream: unknown, opts: { mimeType: string }) {
              this.mimeType = opts?.mimeType ?? 'audio/webm';
            }
            start() {
              this.state = 'recording';
            }
            stop() {
              this.state = 'inactive';
              this.ondataavailable?.({ data: new Blob(['audio'], { type: this.mimeType }) });
              this.onstop?.();
            }
          }
          (win as any).MediaRecorder = StubRecorder;
        },
      });
      connectSocket();
      cy.get('button[aria-label="Record a voice note"]').click();
      cy.contains('Recording').should('be.visible');
      cy.get('button[aria-label="Stop and send voice note"]').click();
      cy.wait('@uploadVoice');
      cy.contains('Voice note').should('be.visible');
    });

    it('attaches an image and sends it as a message', () => {
      cy.intercept('POST', '**/front-chat/attachments', { statusCode: 204 }).as('uploadImage');
      cy.visit('/messaging');
      connectSocket();
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('fake-image'),
          fileName: 'photo.jpg',
          mimeType: 'image/jpeg',
        },
        { force: true },
      );
      cy.wait('@uploadImage');
      cy.contains('photo.jpg').should('be.visible');
    });
  });

  after(() => {
    cy.logout();
  });
});

describe('A logged out user visiting the messaging page', () => {
  it('sees the sign-up banner instead of the chat widget', () => {
    cy.visit('/messaging');
    cy.get('#signup-banner').should('be.visible');
    cy.get('[aria-label="Bloom messaging"]').should('not.exist');
  });
});
