async function login(page) {
  await page.goto('https://bloom-frontend-git-develop-chaynhq.vercel.app/auth/login');
  await page.waitForSelector('input[type="email"]', { visible: true });

  await page.type('input[id="email"]', process.env.USER_EMAIL);
  await page.type('input[id="password"]', process.env.USER_PASSWORD);
  await page.click('[type="submit"]');
  await page.waitForSelector('input[type="email"]', { visible: false });
}

/**
 * @param {puppeteer.Browser} browser
 * @param {{url: string, options: LHCI.CollectCommand.Options}} context
 */
async function setup(browser, context) {
  // launch browser for LHCI
  const page = await browser.newPage();

  await login(page);
  await page.goto(context.url);
  // close session for next run
  await page.close();
}

module.exports = setup;
