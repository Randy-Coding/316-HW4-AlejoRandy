const { Sequelize } = require('sequelize');
const dotenv = require('dotenv')
dotenv.config();

const PG_URL = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
const sequelize = new Sequelize(PG_URL);
sequelize.authenticate()
  .then(() => console.log('PostgreSQL connected successfully'))
  .catch(err => console.error('PostgreSQL connection error:', err));

module.exports = { sequelize };