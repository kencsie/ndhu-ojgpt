const fs = require('fs');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

async function getProblem() {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
  
    await page.goto(`https://oj.kencs.net/`, { waitUntil: 'networkidle' });
    await page.goto(`https://oj.kencs.net/problem/PR112-2-41`, { waitUntil: 'networkidle' });
    const contentTexts = await page.$$eval('#problem-content .content', elements =>
    elements.map(element => element.innerText)
    );    
    const sampleInputText = await page.textContent('#problem-content .sample-input pre');
    const sampleOutputText = await page.textContent('#problem-content .sample-output pre');
    
    await page.evaluate(() => {
      const editorScrollable = document.querySelector('.CodeMirror-scroll');
      if (editorScrollable) {
        editorScrollable.scrollTop = editorScrollable.scrollHeight;
      }
    });
    await page.waitForTimeout(2000);
    const codeLines = await page.$$eval('.CodeMirror-line', lines => lines.map(line => line.textContent));
    const fullCode = codeLines.join('\n');

    const question = {
      'Description':contentTexts[0],
      'Input':contentTexts[1],
      'Output':contentTexts[2],
      'SampleInput':sampleInputText,
      'SampleOutput':sampleOutputText,
      'CodeTemplate':fullCode
    }
    console.log(question)
    await page.screenshot({ path: "./data/oj.png", fullPage: true });
    
    await browser.close();
    return question;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

(async () => {
  question = await getProblem();

  // Convert the object to a string
  const data = JSON.stringify(question, null, 2);

  // Write the string to a text file
  fs.writeFile('./data/problem.json', data, (err) => {
  if (err) {
    console.error('An error occurred:', err);
  } else {
    console.log('File has been saved!');
  }
  });
})();
