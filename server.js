const express = require('express');
const playwright = require('playwright');
const { Client } = require('pg');
const links = require('./links.json');
const fs = require('fs');

const app = express();
app.listen('1337');

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  port: '5000',
  password: '1122',
  database: 'drugs',
});
client.connect();
async function browse() {
  const browser = await playwright.chromium.launch({
    args: ['--disable-features=site-per-process'],
  });
  for (let i = 14556; i < 16000; i++) {
    console.log(i);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`https://altibbi.com${links[i]}`, { timeout: 0 });

    await page.waitForLoadState('domcontentloaded'); // T

    let eng = await page.locator('.drug-name-en').textContent();
    let title = await page
      .locator(
        '#right_side > section.drug-main-info.col-12.d-flex.flex-row > div.col-md-6.p-0 > article > table > tbody > tr.drug-info.drug-scientific-name > td.drug-info-sec-value',
        { timeout: 3000 }
      )
      .allTextContents();
    let classification = await page
      .locator(
        '#right_side > section.drug-main-info.col-12.d-flex.flex-row > div.col-md-6.p-0 > article > table > tbody > tr:nth-child(2) > td.drug-info-sec-value',
        { timeout: 3000 }
      )

      .allTextContents();

    let category = await page
      .locator(
        '#right_side > section.drug-main-info.col-12.d-flex.flex-row > div.col-md-6.p-0 > article > table > tbody > tr:nth-child(3) > td.drug-info-sec-value',
        { timeout: 3000 }
      )
      .allTextContents();
    let family = await page
      .locator(
        '#right_side > section.drug-main-info.col-12.d-flex.flex-row > div.col-md-6.p-0 > article > table > tbody > tr:nth-child(4) > td.drug-info-sec-value',
        { timeout: 3000 }
      )
      .allTextContents();
    let nonBrand = await page
      .locator('#drugInformation > ul > li > a', { timeout: 3000 })
      .textContent();
    let what = await page
      .locator(
        '#right_side > section:nth-child(3) > article:nth-child(2) > div > p',
        { timeout: 3000 }
      )
      .allTextContents();
    let uses = await page.locator('#termText0 > div > span').allTextContents();
    let contraindications = await page
      .locator('#termText1 > div > span', { timeout: 3000 })
      .allInnerTexts();
    let side = await page.locator('#termText2 > div > span').allTextContents();
    let Precautions = await page
      .locator('#termText3 > div > span')
      .allInnerTexts();
    let Interferences = await page
      .locator('#termText4 > div > span')
      .allInnerTexts();
    let doses = await page.locator('#termText5 > div > span').allTextContents();
    let shapes = await page
      .locator('#termText6 > div > span')
      .allTextContents();

    let query = `insert into brands(id,name,eng,classification,category,family,what,side,uses,contraindications,precautions,interferences,doses,shapes,nonbrand)
    values('${i}','${title}','${eng}','${classification}','${category}','${family}','${what}','${JSON.stringify(
      side
    )}','${JSON.stringify(uses)}','${JSON.stringify(
      contraindications
    )}','${JSON.stringify(Precautions)}','${JSON.stringify(
      Interferences
    )}','${JSON.stringify(doses)}','${JSON.stringify(shapes)}','${nonBrand}')`;
    await client.query(query, (err, result) => {
      if (!err) {
        console.log('done');
      } else {
        console.log(err);
      }
    });
    await context.close();
  }
}

browse();
