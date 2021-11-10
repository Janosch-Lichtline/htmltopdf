const express = require('express');
const app = express();
const jquersy = require('jquery');
const axios = require('axios');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const request = require('request');
const fs = require('fs');
const FormData = require('form-data');
const { response } = require('express');
dotenv.config();

// Laden des HTML Templates
async function GetHTML() {

    // Load Products from HubspotDB
    await axios.get(`https://api.hubapi.com/cms/v3/hubdb/tables/5278217/rows?hapikey=${process.env.HUBSPOT_API_KEY}`).then( async (result) => {
        // Get result
        const productRows = result.data.results;

        // Loop through all Products
        for(var i=0; i< productRows.length; i++) {
            // Get Path
            const path = productRows[i].path;

            // Check if path exists
            if(path == null || path == undefined){
              return;
            }

            // Build template url
            var templateUrl = `http://lichtline-7712640.hs-sites.com/datenblatt/${path}`;
            console.log(templateUrl);

            const browser = await puppeteer.launch();
            const page = await browser.newPage();
          
            await page.goto(templateUrl, {
              waitUntil: 'networkidle2',
            });

            var fileName = `Datenblatt-Test-${path}.pdf`;
            var pathToFile = `./files/Datenblatt-Test-${path}.pdf`
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
              folderPath: 'docs'
          };
          
          // Send post request
          request.post({
              url: postUrl,
              formData: formData
          }, function optionalCallback(err, httpResponse, body){
              //return console.log(body);
          });
          
          // Friendly URL
          var friendlyFileURL = `https://f.hubspotusercontent40.net/hubfs/7712640/docs/${fileName}`;
          console.log(friendlyFileURL);

          // Set URL in HubDB for product row
          var urlForURLPost = `https://api.hubapi.com/hubdb/api/v2/tables/5278217/rows/59395405747/cells/4?hapikey=${process.env.HUBSPOT_API_KEY}`;
         //axios.post(urlForURLPost, {"value" : "Updated Row Text"}).then((result) => {
            axios.post(urlForURLPost, {"value" : "Updated Row Text"}, { params: {
              "value" : "Updated Row Text"
            }})
            .then(response => console.log(response.data));
          

          
        }
        
            
          
            
        });

       
   



   

};

GetHTML();
