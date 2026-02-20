const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

////////////////////////////////////////////////////////////
// CONFIGURAÇÕES
////////////////////////////////////////////////////////////

const PORT = process.env.PORT || 3000;

const DB_FILE = path.join(__dirname, "licenses.json");

////////////////////////////////////////////////////////////
// MIDDLEWARE
////////////////////////////////////////////////////////////

app.use(cors());

app.use(express.json());

////////////////////////////////////////////////////////////
// BANCO DE DADOS
////////////////////////////////////////////////////////////

function loadDB() {

    if (!fs.existsSync(DB_FILE)) {

        const initial = {
            licenses: []
        };

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(initial, null, 2)
        );

    }

    const raw = fs.readFileSync(DB_FILE);

    return JSON.parse(raw);

}

function saveDB(db) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(db, null, 2)
    );

}

////////////////////////////////////////////////////////////
// ENDPOINT PRINCIPAL — VALIDAR LICENÇA
////////////////////////////////////////////////////////////

app.post("/validate", (req, res) => {

    try {

        const { deviceId } = req.body;

        if (!deviceId) {

            return res.json({
                authorized: false,
                error: "deviceId ausente"
            });

        }

        const db = loadDB();

        const license = db.licenses.find(
            l => l.deviceId === deviceId
        );

        if (!license) {

            return res.json({
                authorized: false
            });

        }

        if (!license.active) {

            return res.json({
                authorized: false
            });

        }

        if (new Date() > new Date(license.expira)) {

            return res.json({
                authorized: false,
                error: "licença expirada"
            });

        }

        return res.json({
            authorized: true,
            license: license
        });

    }
    catch (err) {

        return res.json({
            authorized: false,
            error: "erro interno"
        });

    }

});

////////////////////////////////////////////////////////////
// ENDPOINT ADMIN — CRIAR LICENÇA
////////////////////////////////////////////////////////////

app.post("/create", (req, res) => {

    try {

        const { deviceId, expira } = req.body;

        if (!deviceId) {

            return res.json({
                success: false,
                error: "deviceId obrigatório"
            });

        }

        const db = loadDB();

        const exists = db.licenses.find(
            l => l.deviceId === deviceId
        );

        if (exists) {

            return res.json({
                success: false,
                error: "já existe"
            });

        }

        const newLicense = {

            deviceId: deviceId,

            active: true,

            expira: expira || "2099-12-31",

            createdAt: new Date().toISOString()

        };

        db.licenses.push(newLicense);

        saveDB(db);

        return res.json({
            success: true,
            license: newLicense
        });

    }
    catch {

        return res.json({
            success: false
        });

    }

});

////////////////////////////////////////////////////////////
// STATUS DO SERVIDOR
////////////////////////////////////////////////////////////

app.get("/", (req, res) => {

    res.send("LENS License Server Online");

});

////////////////////////////////////////////////////////////
// INICIAR SERVIDOR
////////////////////////////////////////////////////////////

app.listen(PORT, () => {

    console.log("LENS License Server running on port", PORT);

});
