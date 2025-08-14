import express from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import UserAgent from "user-agents";

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

// Generate random user agent each run
function getRandomUserAgent() {
  return new UserAgent().toString();
}

app.get("/api/instagram/:username", async (req, res) => {
  const { username } = req.params;
  let browser;

  try {
    const launchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Rotate user agent
    await page.setUserAgent(getRandomUserAgent());

    // Add random delay to avoid robotic patterns
    await page.waitForTimeout(1000 + Math.floor(Math.random() * 2000));

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Check if IG is asking to log in
    const loginWall = await page.$("input[name='username']");
    if (loginWall) {
      throw new Error(
        "Instagram login wall encountered. Try later or use login mode."
      );
    }

    await page.waitForSelector("header", { timeout: 15000 });

    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText : null;
      };
      const getImg = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.src : null;
      };
      return {
        username: getText("header section h2, header h1"),
        fullName: getText("header section h1, header h2"),
        bio: getText(
          "header section ul + div > div > span, header section ul + div > div"
        ),
        profilePic: getImg("header img"),
        posts: getText("header li span span"),
        followers: getText("header li:nth-child(2) span span"),
        following: getText("header li:nth-child(3) span span"),
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
