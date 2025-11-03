const dotenv = require('dotenv')
dotenv.config();

const { sequelize } = require('../../../db/postgre');
const Playlist = require('../../../models/mongo/playlist-model')
const User = require("../../../models/mongo/user-model")
const testData = require("../example-db-data.json")


async function clearTable(model, name) {
  console.log(`Clearing ${name} table...`);
  await model.destroy({ where: {}, truncate: true });
  console.log(`${name} table cleared.`);
}

async function fillTable(model, name, data) {
  console.log(`Filling ${name} table...`);
  await model.bulkCreate(data);
  console.log(`${name} table filled.`);
}

async function resetPostgre() {
  try {
    await clearTable(User, 'User');
    await fillTable(User, 'User', testData.users);

    await clearTable(Playlist, 'Playlist');
    await fillTable(Playlist, 'Playlist', testData.playlists);

    console.log('PostgreSQL reset complete.');
  } catch (error) {
    console.error('Error resetting PostgreSQL:', error);
  } finally {
    await sequelize.close();
  }
}

sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL has been established successfully.');
    return resetPostgre();
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
