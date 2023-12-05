/**
 * @param {puppeteer.Browser} browser
 * @param {{url: string, options: LHCI.CollectCommand.Options}} context
 */
module.exports = async (browser, context) => {
  // launch browser for LHCI
  const page = await browser.newPage();
  await page.goto('https://bloom-frontend-git-develop-chaynhq.vercel.app/auth/login');
  const emailInput = await page.$('input[type="email"]');
  await emailInput.type(process.env.USER_EMAIL);
  const passwordInput = await page.$('input[type="password"]');
  await passwordInput.type(process.env.USER_PASSWORD);
  await Promise.all([page.$eval('#login-form', (form) => form.submit()), page.waitForNavigation()]);
  // close session for next run
  await page.close();
};
