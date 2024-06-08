const fs = require('fs');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

async function getProblem(questionID, OJ_URL) {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
  
    await page.goto(`${OJ_URL}`, { waitUntil: 'networkidle' });
    await page.goto(`${OJ_URL}problem/PR112-2-${questionID}`, { waitUntil: 'networkidle' });
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
      'Description':contentTexts[0].replace(/\n\n/g, '\n'),
      'Input':contentTexts[1].replace(/\n\n/g, '\n'),
      'Output':contentTexts[2].replace(/\n\n/g, '\n'),
      'SampleInput':sampleInputText,
      'SampleOutput':sampleOutputText,
      'CodeTemplate':fullCode
    }
        
    await browser.close();

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
  } catch (error) {
    console.error("An error occurred:", error);
  }

  console.log('Get problem complete.');
}

module.exports = getProblem;