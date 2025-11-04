const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const PG_URL = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
const sequelize = new Sequelize(PG_URL, { logging: false });

class PostgreDatabaseManager {
    constructor() {
        this.connection = null;
    }

    _normalizeQuery(query) {
        if (query && Object.prototype.hasOwnProperty.call(query, '_id')) {
            query.id = query._id;
            delete query._id;
        }
        return query;
    }

    async connect() {
        if (this.connection) return this.connection;

        try {
            await sequelize.authenticate();
            this.connection = sequelize;
            console.log('PostgreSQL connected successfully');
            return this.connection;
        } catch (e) {
            console.error('PostgreSQL connection error:', e.message);
            throw e;
        }
    }

    async disconnect() {
        if (!this.connection) return;
        await this.connection.close();
        this.connection = null;
    }

    // Generic CRUD Methods
    async create(model, data) {
        return await model.create(data);
    }

    async read(model, query = {}, projection = null, options = {}) {
        query = this._normalizeQuery(query);
        return await model.findAll({ where: query, ...options });
    }

    async update(model, query, updateData, options = {}) {
        query = this._normalizeQuery(query);
        return await model.update(updateData, { where: query, ...options });
    }

    async delete(model, query) {
        query = this._normalizeQuery(query);
        return await model.destroy({ where: query });
    }

    async findOne(model, query, projection = null, options = {}) {
        query = this._normalizeQuery(query);
        return await model.findOne({ where: query, ...options });
    }

    async findById(model, id, projection = null, options = {}) {
        return await model.findByPk(id, options);
    }

    async deleteOne(model, query) {
        query = this._normalizeQuery(query);
        return await model.destroy({ where: query, limit: 1 });
    }

    async findOneAndDelete(model, query, options = {}) {
        query = this._normalizeQuery(query);
        const record = await model.findOne({ where: query });
        if (record) await record.destroy();
        return record;
    }

    async saveDocument(instance) {
        return await instance.save();
    }
}

const manager = new PostgreDatabaseManager();
manager.sequelize = sequelize;
module.exports = manager;