const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(request, response, next) {

    console.log(request.query + '------');

    //res.render('index', { title: 'Express' });
});

module.exports = router;
