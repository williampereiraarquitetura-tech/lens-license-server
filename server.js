const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

const DB_FILE = path.join(__dirname, "keys.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

////////////////////////////////////////////////////////////
// DATABASE
////////////////////////////////////////////////////////////

function loadDB(){

    if(!fs.existsSync(DB_FILE)){

        fs.writeFileSync(DB_FILE, JSON.stringify({
            adminKey:"ADMIN-1234",
            userKey:"USER-1234"
        },null,2));

    }

    return JSON.parse(fs.readFileSync(DB_FILE));

}

function saveDB(db){

    fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2));

}

////////////////////////////////////////////////////////////
// VALIDATE
////////////////////////////////////////////////////////////

app.post("/validate",(req,res)=>{

    const {key} = req.body;

    const db = loadDB();

    if(key===db.adminKey){

        return res.json({
            authorized:true,
            role:"admin"
        });

    }

    if(key===db.userKey){

        return res.json({
            authorized:true,
            role:"user"
        });

    }

    res.json({
        authorized:false
    });

});

////////////////////////////////////////////////////////////
// CHANGE ADMIN KEY
////////////////////////////////////////////////////////////

app.post("/set-admin",(req,res)=>{

    const {key} = req.body;

    const db = loadDB();

    db.adminKey=key;

    saveDB(db);

    res.json({success:true});

});

////////////////////////////////////////////////////////////
// CHANGE USER KEY
////////////////////////////////////////////////////////////

app.post("/set-user",(req,res)=>{

    const {key} = req.body;

    const db = loadDB();

    db.userKey=key;

    saveDB(db);

    res.json({success:true});

});

////////////////////////////////////////////////////////////

app.listen(PORT,()=>{

    console.log("License Server Running");

});
