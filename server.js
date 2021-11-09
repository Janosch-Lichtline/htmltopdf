const express = require('express');
const app = express();
const dotenv = require('dotenv');
const jquersy = require('jquery');
const axios = require('axios');
const puppeteer = require('puppeteer');





var templateUrl = 'https://hubspot-developers-1ty46i0-9489756.hs-sites.com/datenblatt-test/clicklux-rocket-30';

// Laden des HTML Templates
async function GetHTML() {
    //const data = await axios.get(templateUrl);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(templateUrl, {
      waitUntil: 'networkidle2',
    });
    await page.pdf({ path: 'hn.pdf', format: 'a4' });
  
    await browser.close();

   

};

GetHTML();
