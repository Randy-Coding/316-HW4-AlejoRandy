const dotenv = require("dotenv");
dotenv.config();

let db;
let models = {};
const env = process.env.DB_DIALECT?.toLowerCase();

if (env.startsWith("postgre")) {
    db = require("./postgre/index.js");
    
    console.log("=== DB DEBUG INFO ===");
    console.log("DB_DIALECT:", env);
    console.log("DB path loaded:", env.startsWith("mongo") ? "./mongo/index.js" : "./postgre/index.js");
    console.log("DB type:", typeof db);
    console.log("DB keys:", Object.keys(db));
    console.log("Type of db.connect:", typeof db.connect);
    console.log("======================");

    models.User = require("../models/postgre/user-model.js");
    models.Playlist = require("../models/postgre/playlist-model.js");
} else if (env.startsWith("mongo")) {
    db = require("./mongo/index.js");
    
    console.log("=== DB DEBUG INFO ===");
    console.log("DB_DIALECT:", env);
    console.log("DB path loaded:", env.startsWith("mongo") ? "./mongo/index.js" : "./postgresql/index.js");
    console.log("DB type:", typeof db);
    console.log("DB keys:", Object.keys(db));
    console.log("Type of db.connect:", typeof db.connect);
    console.log("======================");

    models.User = require("../models/mongo/user-model.js");
    models.Playlist = require("../models/mongo/playlist-model.js");
} else {
    throw new Error(`Unsupported DB_DIALECT: ${env}`);
}

module.exports = db;
module.exports.models = models;