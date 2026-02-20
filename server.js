const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const DB_FILE = "licenses.json";

function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ licenses: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
}

app.post("/validate", (req, res) => {

    const { deviceId } = req.body;

    const db = loadDB();

    const lic = db.licenses.find(l => l.deviceId === deviceId);

    if (!lic)
        return res.json({ authorized: false });

    if (!lic.active)
        return res.json({ authorized: false });

    if (new Date() > new Date(lic.expira))
        return res.json({ authorized: false });

    res.json({
        authorized: true,
        license: lic
    });

});

app.get("/", (req,res)=>{
    res.send("LENS License Server Online");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
