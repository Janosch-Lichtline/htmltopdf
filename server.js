const express = require('express');
const app = express();
const jquery = require('jquery');
const axios = require('axios');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const request = require('request');
const fs = require('fs');
const FormData = require('form-data');
const helper = require('./helper');
const schedule = require('node-schedule');
dotenv.config();

// Laden des HTML Templates
async function RunHubspotPDFCreation() {

    //5278217 Production
    //5302439 TestTable
    const tableID = 5278217;

    // Load Products from HubspotDB
    const tableRowsUrl = `https://api.hubapi.com/cms/v3/hubdb/tables/${tableID}/rows?hapikey=${process.env.HUBSPOT_API_KEY}`;
    await axios.get(tableRowsUrl).then(async(result) => {
        // Get result
        const productRows = result.data.results;

        // Loop through all Products
        for (var i = 0; i < productRows.length; i++) {
            // Get Path
            const path = productRows[i].path;

            // Build template url
            var templateUrl = `https://lichtline.com/datenblatt/${path}`;
            console.log(templateUrl);

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            // TimeOut
            // await page.setDefaultNavigationTimeout(0);

            await page.setCacheEnabled(false);
            await page.goto(templateUrl, {
                waitUntil: 'networkidle2',
            });

            var fileName = `${path}.pdf`;
            var pathToFile = `./files/${path}.pdf`
            await page.pdf({ path: pathToFile, format: 'a4' });
            await browser.close();

            // Upload to Hubspot
            var postUrl = `https://api.hubapi.com/filemanager/api/v3/files/upload?hapikey=${process.env.HUBSPOT_API_KEY}`;

            // File Options
            var fileOptions = {
                access: 'PUBLIC_INDEXABLE',
                ttl: 'P3M',
                overwrite: true,
                duplicateValidationStrategy: 'NONE',
                duplicateValidationScope: 'ENTIRE_PORTAL'
            };

            // Form Data
            var formData = {
                file: fs.createReadStream(pathToFile),
                options: JSON.stringify(fileOptions),
                folderPath: 'Homepage/Datenblaetter'
            };

            // Send post request
            request.post({
                url: postUrl,
                formData: formData
            }, function optionalCallback(err, httpResponse, body) {
                //return console.log(body);
            });

            // Friendly File URL
            var friendlyFileURL = `https://f.hubspotusercontent40.net/hubfs/7712640/Homepage/Datenblaetter/${fileName}`;
            console.log(friendlyFileURL);

            // Set URL in HubDB for product row
            const rowId = productRows[i].id;
            const columnID = 55;
            var urlForURLPost = `https://api.hubapi.com/hubdb/api/v2/tables/${tableID}/rows/${rowId}/cells/${columnID}?hapikey=${process.env.HUBSPOT_API_KEY}`;
            axios.post(urlForURLPost, { "value": friendlyFileURL });
        }
    });
};
/*
// Run every day at 00:00
schedule.scheduleJob('0 0 * * *', function(){
  RunHubspotPDFCreation();
});
*/
RunHubspotPDFCreation();