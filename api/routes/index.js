var express = require('express');
var router = express.Router();
var espnadp = require('../models/espnadp');
var axios = require('axios');

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

//TODO: change name of this route its too generic
/**
 * Invoked when a CPU is up next
 */
router.post('/draft', (req, res) => {
    let available = req.body.available;
    let team = req.body.team;
    let roster = req.body.roster;
    console.log(available);
    console.log(team);
    console.log(roster);
    res.status(200).json({message: 'connected'});
})

/**
 * Im realizing that the server prolly should be maintaining some sort of draft state in memory,
 * could be as simple as having the draft order and whos up right now, just so it knows when to
 * get the CPU to pick and when to let a human pick
 */
router.post('/draftcpu', async (req, res) => {

})



module.exports = router;
