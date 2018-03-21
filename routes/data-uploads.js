const express = require('express');
const _ = require('underscore');
const $ = require('jquery');


const dbAPI = require('../public/javascripts/data_storage/database-api');

const router = express.Router();
const db = new dbAPI.DBInterface(dbAPI.DB_DEFAULT_DESCIRPTON);




router.post('/item_scanning', );