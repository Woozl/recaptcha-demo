import puppeteer from "puppeteer";

// Sites with newly implemented reCAPTCHA may return 0.9 score even
// for this bot. It will take some time on a site to analyze normal
// traffic.
(async () => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.goto("http://localhost:3000/website/index.html");
  await page.type("#name", "Mr. Bot");
  await page.type("#email", "bot@bot.test");
  await page.click("#\\35 -star"); // https://stackoverflow.com/questions/20306204/using-queryselector-with-ids-that-are-numbers
  await page.click("#submit-button");
  await page.waitForResponse("http://localhost:3000/survey")

  await browser.close();
})();