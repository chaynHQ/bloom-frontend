const puppeteer = require('puppeteer');

export default async function login() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto('https://bloom-frontend-git-develop-chaynhq.vercel.app');

  const emailInput = await page.$('input[type="email"]');
  await emailInput.type(process.env.USER_EMAIL);
  const passwordInput = await page.$('input[type="password"]');
  await passwordInput.type(process.env.USER_PASSWORD);
  await Promise.all([page.$eval('#login-form', (form) => form.submit()), page.waitForNavigation()]);

  await browser.close();
}
