var express = require('express');
var app = express();

var mongoose = require('mongoose');
var conn = mongoose.createConnection('mongodb://localhost:27017/mockDatabase');
console.log('connected');

var AppUser = conn.model('AppUser', new mongoose.Schema({name: 'string'}));

AppUser.findOne();

var schema = new mongoose.Schema({ name: 'string', size: 'string' });
var Tank = conn.model('Tank', schema);

Tank.insertMany([{name: 'Mario', size: '123'}, {name: 'Zygmund', size: '321'}], function(err, docs) {});

conn.close();
console.log('closed');