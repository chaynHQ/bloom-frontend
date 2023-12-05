/**
 * @param {puppeteer.Browser} browser
 * @param {{url: string, options: LHCI.CollectCommand.Options}} context
 */
module.exports = async (browser, context) => {
  // launch browser for LHCI
  const page = await browser.newPage();
  await page.goto('https://bloom-frontend-git-develop-chaynhq.vercel.app/auth/login');
  await page.waitForSelector('input[type="email"]', { visible: true });
  await page.type('input[name=email]', process.env.USER_EMAIL);
  await page.type('input[name=password]', process.env.USER_PASSWORD);
  await Promise.all([page.click('input[type=submit]'), page.waitForNavigation()]);
  // close session for next run
  await page.close();
};
