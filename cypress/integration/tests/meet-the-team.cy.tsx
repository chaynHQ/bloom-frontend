const MEET_THE_TEAM_PAGE_URL = '/meet-the-team';

describe('Meet the team page should', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  it('be reachable from the home page', () => {
    cy.visit('/');
    cy.get('a[qa-id="meet-team-menu-button"]').first().click({ force: true });
    cy.url().should('contain', MEET_THE_TEAM_PAGE_URL);
  });

  describe('display', () => {
    type CheckCardProps = {
      name: string;
      title: string;
      languages: string;
      image: { alt: string; src: string };
      description: string;
      closed?: boolean;
    };
    const checkCard = ({ name, title, languages, image, description, closed }: CheckCardProps) => {
      const expandIconTag = 'svg[data-testid="KeyboardArrowDownIcon"]';
      const cardContainer = cy
        .get(`div[data-testid="team-member-card"]:has(img[alt="${image.alt}"])`)
        .first();
      cardContainer.within(() => {
        cy.get('h3').should('contain', name);
        cy.get('p').should('contain', title);
        cy.get('svg[data-testid="LanguageIcon"]').should('exist');
        cy.get('p').should('contain', languages);
        cy.checkImage(image.alt, image.src);
        if (closed) {
          cy.get(expandIconTag).should('exist');
          cy.root().click();
          cy.get(expandIconTag).should('exist');
        } else {
          cy.get(expandIconTag).should('not.exist');
        }
        cy.get('p').should('contain', description);
      });
    };
    beforeEach(() => {
      cy.visit(MEET_THE_TEAM_PAGE_URL);
    });
    it('team description section', () => {
      cy.get('h1').should('contain', 'Our Bloom team');
      cy.get('p').should(
        'contain',
        'Our team comes from all corners of the world. We deeply care about the experiences of survivors and the many ways in which our identity affects our experience of trauma, as many of us, are survivors ourselves',
      );
      cy.checkImage(
        'Illustration of the outline of a persons face from a side profile, with a flower beside the face.',
        'team_member',
      );
    });
    it('core team section', () => {
      cy.get('h2').should('contain', 'Core team');
      cy.fixture('meet-the-team').then((data: { core: CheckCardProps[] }) => {
        data.core.forEach((coreMember) => {
          checkCard(coreMember);
        });
      });
    });
    it('our volunteers/therapists section', () => {
      cy.checkImage('leaves with a rose bloom', 'leaf_mix_bloom');
      cy.get('h3').should('contain', 'Our volunteers');
      cy.get('p').should(
        'contain',
        'Chayn began as a volunteer-run network of survivors and allies that wanted to create a feminist space online for information, solidarity and healing. Our volunteers continue to play an important part in informing, reviewing and designing our services.',
      );
      cy.checkImage('leaves with fire', 'leaf_mix_fire');
      cy.get('h3').should('contain', 'Our therapists');
    });
    it('supporting team section', () => {
      cy.get('h2').should('contain', 'Supporting team');
      cy.get('p').should(
        'contain',
        'Our wider team has helped us edit, write, and record our course videos, and some of them also provide support over our messaging service. They bring with them a wealth of knowledge and life experience, and have been trained by Chayn. You may even come across someone who is based in the same place as you!',
      );
      cy.fixture('meet-the-team').then((data: { supporting: CheckCardProps[] }) => {
        data.supporting.forEach((supportingMember) => {
          checkCard(supportingMember);
        });
      });
    });
    it('our research and awards section', () => {
      cy.checkImage('Illustration of cycle, representing change.', 'change');
      cy.get('h2').should('contain', 'Our research and awards');
      cy.get('p').should(
        'contain',
        'Chayn has the honour of receiving many awards for its innovative work.',
      );
      cy.get('p').should('contain', 'Bloom has received the following awards:');
      cy.get('p').should('contain', '2022 Anthem Awards - Silver 2022');
      cy.get('p').should('contain', 'CogX Global Goals - Good Health and Well-Being Award');
      cy.get('p').should('contain', 'You can see the full list of awards ');
      cy.get('h3').should('contain', 'Our therapists');
      cy.checkLink('https://www.chayn.co/about', 'here');

      cy.get('h2').should('contain', 'Funded by');
      cy.checkImage('The National Lottery Community Fund logo', 'tnlc-logo');
      cy.checkImage('Comic Relief logo', 'comic-relief-logo');
    });
  });
});
