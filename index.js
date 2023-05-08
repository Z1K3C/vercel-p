const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome?.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome?.defaultViewport,
      executablePath: chrome && await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();

    await page.goto('https://example.com');
    const title = await page.$eval("h1", el => el.textContent.trim())
    console.log("==========================================================")
    console.log(20, title)

    return res.status(200).json({ note: 'a ok', title });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ note: 'something wrong' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
