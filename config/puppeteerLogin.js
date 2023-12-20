async function login(page) {
  await page.goto('https://bloom-frontend-git-develop-chaynhq.vercel.app/auth/login');
  await page.waitForSelector('#email', { visible: true });

  await page.type('#email"', process.env.USER_EMAIL);
  await page.type('#password', process.env.USER_PASSWORD);
  await page.click('[type="submit"]');
  await page.waitForSelector('#email', { visible: false });
}

let counter = 1;

/**
 * @param {puppeteer.Browser} browser
 * @param {{url: string, options: LHCI.CollectCommand.Options}} context
 */
async function setup(browser, context) {
  // launch browser for LHCI
  const page = await browser.newPage();
  await page.setCacheEnabled(true);

  if (counter === 1) {
    await login(page);
  } else {
    await page.goto(context.url);
  }
  // close session for next run
  await page.close();
  counter++;
}

module.exports = setup;
