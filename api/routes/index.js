var express = require('express');
var router = express.Router();
var espnadp = require('../models/espnadp');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/espnadp', async (req, res) => {
    let startindex = req.query.start ? req.query.start : 0;
    let size = req.query.size ? req.query.size : 50;

    let players = await espnadp.get_ESPN_ADP(parseInt(startindex), parseInt(size));
    let available = JSON.parse(JSON.stringify(players));

    res.status(200).json(available);
})

module.exports = router;
