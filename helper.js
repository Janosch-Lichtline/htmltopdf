const express = require('express');
const app = express();
const jquersy = require('jquery');
const axios = require('axios');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const request = require('request');
const fs = require('fs');
const FormData = require('form-data');
dotenv.config();

async function PrintRows(){
    const urlForProductIds = `https://api.hubapi.com/hubdb/api/v2/tables/5278217/rows/draft?hapikey=${process.env.HUBSPOT_API_KEY}`;
     await axios.get(urlForProductIds).then((result) => {
             console.log(result.data["objects"][0]["values"]);
     });
 }
 
 function CloneTable(){
   const urlForClonePost = `https://api.hubapi.com/hubdb/api/v2/tables/5278217/clone?hapikey=${process.env.HUBSPOT_API_KEY}`;
   axios.post(urlForClonePost, {
     "newName": "Test Table (Cloned)"
   }).then((result) => {
     console.log(result);
   });
 }
 
 function DeleteRow(){
   const urlForRowDeletion = `https://api.hubapi.com/hubdb/api/v2/tables/5302439/rows/59395405747?hapikey=${process.env.HUBSPOT_API_KEY}`
   axios.delete(urlForRowDeletion).then((result) => {
     console.log(result);
   });
 }

 function PublishDraftTable(){
    const urlTopPublishDraftTable = `https://api.hubapi.com/hubdb/api/v2/tables/5302439/publish?hapikey=${process.env.HUBSPOT_API_KEY}`;
       axios.put(urlTopPublishDraftTable).then((result) => {
           console.log(result);
       });
  }

module.exports = {
    publishDraftTable : PublishDraftTable, 
    deleteRow : DeleteRow,
    cloneTable : CloneTable,
    printRows : PrintRows
}