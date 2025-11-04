const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config();

class DatabaseManager {
    constructor() {
        this.connection = null;
    }

    _normalizeQuery(query) {
        if (query && Object.prototype.hasOwnProperty.call(query, 'id')) {
            query._id = query.id;
            delete query.id;
        }
        return query;
    }

    async connect() {
        if (this.connection) {
            return this.connection;
        }
        try {
            this.connection = await mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });
            return this.connection;
        } catch (e) {
            console.error('Connection error', e.message);
            throw e;
        }
    }

    async disconnect() {
        if (!this.connection) {
            return;
        }
        await mongoose.disconnect();
        this.connection = null;
    }

    async create(model, data) {
        const doc = new model(data);
        return await doc.save();
    }

    async read(model, query, projection = null, options = {}) {
        query = this._normalizeQuery(query);
        return await model.find(query, projection, options).exec();
    }

    async update(model, query, updateData, options = {}) {
        query = this._normalizeQuery(query);
        return await model.updateMany(query, updateData, options).exec();
    }

    async delete(model, query) {
        query = this._normalizeQuery(query);
        return await model.deleteMany(query).exec();
    }

    async findOne(model, query, projection = null, options = {}) {
        query = this._normalizeQuery(query);
        return await model.findOne(query, projection, options).exec();
    }

    async findById(model, id, projection = null, options = {}) {
        return await model.findById(id, projection, options).exec();
    }

    async deleteOne(model, query) {
        query = this._normalizeQuery(query);
        return await model.deleteOne(query).exec();
    }

    async findOneAndDelete(model, query, options = {}) {
        query = this._normalizeQuery(query);
        return await model.findOneAndDelete(query, options).exec();
    }

    async saveDocument(doc) {
        return await doc.save();
    }
}

module.exports = new DatabaseManager();
