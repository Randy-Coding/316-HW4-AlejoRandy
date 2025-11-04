const dotenv = require("dotenv");
dotenv.config();

let db;
let models = {};
const env = process.env.DB_DIALECT?.toLowerCase();

if (env.startsWith("postgre")) {
    db = require("./postgresql/index.js");
    models.User = require("../models/postgre/user-model.js");
    models.Playlist = require("../models/postgre/playlist-model.js");
} else if (env.startsWith("mongo")) {
    db = require("./mongo/index.js");
    models.User = require("../models/mongo/user-model.js");
    models.Playlist = require("../models/mongo/playlist-model.js");
} else {
    throw new Error(`Unsupported DB_DIALECT: ${env}`);
}

module.exports = db;
module.exports.models = models;