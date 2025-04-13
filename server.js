const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.post("/trace", async (req, res) => {
  const targetUrl = req.body.url;
  let logs = `Tracking: ${targetUrl}\n\n`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  page.on("request", request => {
    logs += `REQUEST: ${request.url()}\n`;
  });

  page.on("response", async response => {
    logs += `RESPONSE: ${response.url()} [${response.status()}]\n`;
  });

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });
    logs += `\nFinal URL: ${page.url()}`;
  } catch (err) {
    logs += `\nError: ${err.message}`;
  }

  await browser.close();

  res.send(`
    <div style="background:#111; color:white; padding:20px">
      <pre>${logs}</pre>
      <a href="/" style="color:#0af;">Back</a>
    </div>
  `);
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));