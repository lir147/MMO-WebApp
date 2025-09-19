const express = require('express');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = './data/players.json';
fs.ensureFileSync(DATA_FILE);
if(!fs.readJsonSync(DATA_FILE, {throws:false})) fs.writeJsonSync(DATA_FILE, {});

// ====== helper functions ======
function getPlayers(){
    return fs.readJsonSync(DATA_FILE);
}
function savePlayers(players){
    fs.writeJsonSync(DATA_FILE, players);
}

// ====== API ======
app.get('/player/:userId', (req,res)=>{
    const players = getPlayers();
    const uid = req.params.userId;
    res.json(players[uid] || null);
});

app.post('/player/:userId', (req,res)=>{
    const players = getPlayers();
    const uid = req.params.userId;
    players[uid] = req.body;
    savePlayers(players);
    res.json({ok:true});
});

app.post('/donate/:userId', (req,res)=>{
    const amount = req.body.amount || 0;
    const players = getPlayers();
    const uid = req.params.userId;
    if(!players[uid]) players[uid] = {level:1, exp:0, vip:0};
    players[uid].vip = (players[uid].vip || 0) + amount;
    savePlayers(players);
    res.json({ok:true, vip: players[uid].vip});
});

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});
