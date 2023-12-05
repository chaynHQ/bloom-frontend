/**
 * @param {puppeteer.Browser} browser
 * @param {{url: string, options: LHCI.CollectCommand.Options}} context
 */
module.exports = async (browser, context) => {
  // launch browser for LHCI
  const page = await browser.newPage();
  await page.goto('https://bloom-frontend-git-develop-chaynhq.vercel.app/auth/login');
  await page.type('input[type="email"]', process.env.USER_EMAIL);
  await page.type('input[type="password"]', process.env.USER_PASSWORD);
  await page.submit('#login-form');
  await page.waitForNavigation();
  // close session for next run
  await page.close();
};
