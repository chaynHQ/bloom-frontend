// TEMPORARY review harness for the TR/AR resource import — not part of the test suite; delete after use.
const REVIEW_DIR = Cypress.env('REVIEW_DIR') as string;

type Page = {
  id: string;
  url: string;
  kind: string;
  expect: 'content' | 'unavailable';
  name?: string;
  unavailable: string;
};

function visibleText(root: Element | null): string {
  if (!root) return '';
  const clone = root.cloneNode(true) as Element;
  clone.querySelectorAll('script, style, noscript, template').forEach((n) => n.remove());
  return clone.textContent || '';
}

function srcOf(img: HTMLImageElement): string {
  const raw = img.currentSrc || img.src || '';
  const m = raw.match(/[?&]url=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : raw;
}

describe('TR/AR resource review (logged in)', { testIsolation: false }, () => {
  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(
      Cypress.env('CYPRESS_PUBLIC_EMAIL') as string,
      Cypress.env('CYPRESS_PUBLIC_PASSWORD') as string,
    );
    cy.visit('/');
    cy.waitForAuthenticatedApp();
  });

  it('records every page', () => {
    cy.readFile(`${REVIEW_DIR}/manifest.json`).then((pages: Page[]) => {
      pages.forEach((p, i) => {
        cy.visit(p.url, { failOnStatusCode: false, timeout: 180000 });
        cy.window({ timeout: 180000 }).then({ timeout: 90000 }, (win) => {
          return new Cypress.Promise((resolve) => {
            const start = Date.now();
            const tick = () => {
              const d = win.document;
              const scope = d.querySelector('[role="dialog"]') || d.querySelector('main') || d.body;
              const text = visibleText(scope);
              const authed = !!d.querySelector('#user-menu-button');
              const ready =
                authed &&
                (p.expect === 'unavailable'
                  ? text.includes(p.unavailable)
                  : !!p.name &&
                    text.includes(p.name) &&
                    (p.kind !== 'grounding' || !!d.querySelector('[role="dialog"]')));
              if (ready || Date.now() - start > 75000) {
                resolve({ ready, waitedMs: Date.now() - start });
              } else {
                setTimeout(tick, 500);
              }
            };
            tick();
          });
        });
        cy.wait(800);
        cy.window().then((win) => {
          const d = win.document;
          const dialog = d.querySelector('[role="dialog"]');
          const scope = dialog || d.querySelector('main') || d.body;
          const html = scope.outerHTML;
          const result = {
            ...p,
            index: i,
            finalUrl: win.location.pathname + win.location.search,
            htmlLang: d.documentElement.lang,
            dir: d.documentElement.dir || win.getComputedStyle(d.body).direction,
            authed: !!d.querySelector('#user-menu-button'),
            signUpPrompt: !!d.querySelector('a[qa-id="access-full-course-login-link"]'),
            h1: Array.from(scope.querySelectorAll('h1, h2'))
              .map((h) => (h.textContent || '').trim())
              .slice(0, 6),
            text: visibleText(scope),
            audio: Array.from(scope.querySelectorAll('audio')).map((a) => a.currentSrc || a.src),
            images: Array.from(scope.querySelectorAll('img')).map((img) =>
              srcOf(img as HTMLImageElement),
            ),
            youtubeIds: Array.from(
              new Set(
                html.match(
                  /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=)|ytimg\.com\/vi\/)([\w-]{11})/g,
                ) || [],
              ),
            ),
            unavailableShown: visibleText(d.querySelector('main') || d.body).includes(
              p.unavailable,
            ),
          };
          cy.writeFile(`${REVIEW_DIR}/results/${String(i).padStart(3, '0')}.json`, result);
        });
        const shot = `${String(i).padStart(3, '0')}_${p.id.replace(/[/:?=]/g, '_')}`;
        cy.screenshot(shot, { capture: Cypress.env('FULL') ? 'fullPage' : 'viewport' });
        cy.window().then((win) => {
          const d = win.document;
          const target =
            d.querySelector('[role="dialog"] audio') ||
            d.querySelector('main audio') ||
            d.querySelector('main iframe, main [class*="player"], main img[src*="_activity_"]') ||
            d.querySelector('main h2, main h3');
          if (target) (target as HTMLElement).scrollIntoView({ block: 'center' });
        });
        cy.wait(400);
        cy.screenshot(`${shot}__media`, { capture: 'viewport' });
      });
    });
  });
});
