const login = async (page, url) => {
  // Navigate the page to a URL
  await page.goto(url);

  const emailInput = await page.$('input[type="email"]');
  await emailInput.type(process.env.USER_EMAIL);
  const passwordInput = await page.$('input[type="password"]');
  await passwordInput.type(process.env.USER_PASSWORD);
  await Promise.all([page.$eval('form', (form) => form.submit()), page.waitForNavigation()]);
  await page.close();
};

module.exports = async (browser) => {
  const page = await browser.newPage();
  const url = 'https://bloom-frontend-git-develop-chaynhq.vercel.app/auth/login';

  await login(page, url);
  await browser.close();
};
