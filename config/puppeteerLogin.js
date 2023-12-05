/**
 * @param {puppeteer.Browser} browser
 * @param {{url: string, options: LHCI.CollectCommand.Options}} context
 */
module.exports = async (browser, context) => {
  // launch browser for LHCI
  const page = await browser.newPage();
  await page.goto('https://bloom-frontend-git-develop-chaynhq.vercel.app/auth/login');
  await page.waitForSelector('input[type="email"]', { visible: true });
  console.log('email is ', process.env.USER_EMAIL);
  await page.type('input[type="email"]', process.env.USER_EMAIL);
  await page.type('input[type="password"]', process.env.USER_PASSWORD);
  console.log(page.$('input[type="email"]'));
  await Promise.all([page.waitForNavigation(), page.click('[type="submit"]')]);
  console.log('completed');
  // close session for next run
  await page.close();
};
