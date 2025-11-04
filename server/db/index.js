// /server/db/index.js
export default class DatabaseManager {
    async connect() {
        throw new Error("connect() must be implemented by subclass");
    }

    async disconnect() {
        throw new Error("disconnect() must be implemented by subclass");
    }

    async create(collection, data) {
        throw new Error("create() must be implemented by subclass");
    }

    async read(collection, query) {
        throw new Error("read() must be implemented by subclass");
    }

    async update(collection, query, update) {
        throw new Error("update() must be implemented by subclass");
    }

    async delete(collection, query) {
        throw new Error("delete() must be implemented by subclass");
    }
    
    async findOne(collection, query) {
        throw new Error("findOne() must be implemented by subclass");
    }

    async findById(collection, id) {
        throw new Error("findById() must be implemented by subclass");
    }

    async deleteOne(collection, query) {
        throw new Error("deleteOne() must be implemented by subclass");
    }

    async findOneAndDelete(collection, query) {
        throw new Error("findOneAndDelete() must be implemented by subclass");
    }

    async saveDocument(document) {
        throw new Error("saveDocument() must be implemented by subclass");
    }
}