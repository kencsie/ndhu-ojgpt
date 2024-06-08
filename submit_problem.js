const fs = require('fs');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

chromium.use(stealth);


function extractCode(text) {
  const codeBlockRegex = /```(?:cpp|c\+\+)\s*([\s\S]*?)```/i;
  const match = text.match(codeBlockRegex);
  if (match && match[1]) {
      return match[1].trim();
  } else {
      return 'No C++ code block found.';
  }
}

async function submitProblem(answerPath, problemId, OJ_URL,account) {
  const data = fs.readFileSync(answerPath, 'utf8');
  const code = extractCode(data);

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
  
    await page.goto(`${OJ_URL}`, { waitUntil: 'networkidle' });
    await page.click('text=Login');
    await page.waitForTimeout(200);
    await page.fill('input[placeholder="Username"]', account.username);
    await page.fill('input[placeholder="Password"]', account.password);
    await page.click('.btn.ivu-btn.ivu-btn-primary.ivu-btn-long >> text=Login');
    await page.waitForTimeout(1000);
    await page.goto(`${OJ_URL}problem/PR112-2-${problemId}`, { waitUntil: 'networkidle' });

    await page.click('.CodeMirror');

    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');

    await page.evaluate((code) => {
      const editor = document.querySelector('.CodeMirror').CodeMirror;
      editor.setValue(code);
    }, code);
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(5000);

    await page.screenshot({ path: "./data/oj.png", fullPage: true });
    
    await browser.close();

    console.log('Submit problem complete.');
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = submitProblem;