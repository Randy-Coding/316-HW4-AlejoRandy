const dotenv = require("dotenv").config({ path: __dirname + "/../.env" });
const db = require("../db/active");
const DatabaseManager = db;
const { Playlist } = db.models;
import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';

/**
 * Vitest test script for the Playlister app's Database Manager. Testing verifies that the Database Manager 
 * will perform all necessary operations properly.
 *  
 * We will test each method of the DatabaseManager interface:
 *  - connect
 *  - disconnect
 *  - create
 *  - read
 *  - update
 *  - delete
 *  - findOne
 *  - findById
 *  - deleteOne
 *  - findOneAndDelete
 *  - saveDocument
 */

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
    const rawDialect = process.env.DB_DIALECT || "unknown";
    const dialect = rawDialect.toLowerCase();

    if (dialect.includes("mongo")) {
        console.log("\nCurrent Database: MongoDB\n");
    } else if (dialect.includes("postgre")) {
        console.log("\nCurrent Database: PostgreSQL\n");
    } else {
        console.log("\nCurrent Database: Unknown (check your .env file)\n");
    }
    await DatabaseManager.connect();
});
/**
 * Executed once after all tests are performed.
 */
afterAll(async () => {
    await DatabaseManager.disconnect();
});

test('Establish connection to DB', async () => {
    await expect(DatabaseManager.connect()).resolves.not.toThrow();
});

test('CREATE', async () => {
    const testDoc = { name: "Vitest_Create", ownerEmail: "create@test.com", songs: [] };
    const result = await DatabaseManager.create(Playlist, testDoc);
    expect(result).toBeDefined();
    expect(result.name).toBe(testDoc.name);
    expect(result.ownerEmail).toBe(testDoc.ownerEmail);
    // cleanup
    const id = result._id || result.id;
    await DatabaseManager.delete(Playlist, { _id: id });
});

test('READ', async () => {
    const testDoc = { name: "Vitest_Read", ownerEmail: "read@test.com", songs: [] };
    const created = await DatabaseManager.create(Playlist, testDoc);
    const results = await DatabaseManager.read(Playlist, { name: "Vitest_Read" });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe("Vitest_Read");
    // cleanup
    const id = created._id || created.id;
    await DatabaseManager.delete(Playlist, { _id: id });
});

test('UPDATE', async () => {
    const testDoc = { name: "Vitest_Update", ownerEmail: "update@test.com", songs: [] };
    const created = await DatabaseManager.create(Playlist, testDoc);
    const id = created._id || created.id;

    await DatabaseManager.update(Playlist, { _id: id }, { name: "Vitest_Updated" });

    const updated = await DatabaseManager.findById(Playlist, id);
    expect(updated).toBeDefined();
    expect(updated.name).toBe("Vitest_Updated");

    // cleanup
    await DatabaseManager.delete(Playlist, { _id: id });
});

test('DELETE', async () => {
    const testDoc = { name: "Vitest_Delete", ownerEmail: "delete@test.com", songs: [] };
    const created = await DatabaseManager.create(Playlist, testDoc);
    const id = created._id || created.id;

    await DatabaseManager.delete(Playlist, { _id: id });

    const docs = await DatabaseManager.read(Playlist, { _id: id });
    expect(docs.length).toBe(0);
});

test('FINDONE', async () => {
    const testDoc = { name: "Vitest_FindOne", ownerEmail: "findone@test.com", songs: [] };
    const created = await DatabaseManager.create(Playlist, testDoc);

    const result = await DatabaseManager.findOne(Playlist, { name: "Vitest_FindOne" });
    expect(result).toBeDefined();
    expect(result.name).toBe(testDoc.name);
    expect(result.ownerEmail).toBe(testDoc.ownerEmail);

    // cleanup
    const id = created._id || created.id;
    await DatabaseManager.delete(Playlist, { _id: id });
});

test('FINDBYID', async () => {
    const testDoc = { name: "Vitest_FindById", ownerEmail: "findbyid@test.com", songs: [] };
    const created = await DatabaseManager.create(Playlist, testDoc);
    const id = created._id || created.id;

    const result = await DatabaseManager.findById(Playlist, id);
    expect(result).toBeDefined();
    expect(result.name).toBe(testDoc.name);
    expect(result.ownerEmail).toBe(testDoc.ownerEmail);

    // cleanup
    await DatabaseManager.delete(Playlist, { _id: id });
});

test('DELETEONE', async () => {
    const testDoc = { name: "Vitest_DeleteOne", ownerEmail: "deleteone@test.com", songs: [] };
    await DatabaseManager.create(Playlist, testDoc);

    await DatabaseManager.deleteOne(Playlist, { name: "Vitest_DeleteOne" });

    const docs = await DatabaseManager.read(Playlist, { name: "Vitest_DeleteOne" });
    expect(docs.length).toBe(0);
});

test('FIND_AND_DELETE', async () => {
    const testDoc = { name: "Vitest_FindOneAndDelete", ownerEmail: "foned@test.com", songs: [] };
    await DatabaseManager.create(Playlist, testDoc);

    const result = await DatabaseManager.findOneAndDelete(Playlist, { name: "Vitest_FindOneAndDelete" });
    expect(result).toBeDefined();
    expect(result.name).toBe(testDoc.name);

    const docs = await DatabaseManager.read(Playlist, { name: "Vitest_FindOneAndDelete" });
    expect(docs.length).toBe(0);
});

test('SAVEDOCUMENT', async () => {
    const testDoc = { name: "Vitest_SaveDocument", ownerEmail: "savedoc@test.com", songs: [] };
    const created = await DatabaseManager.create(Playlist, testDoc);
    const id = created._id || created.id;

    created.name = "Vitest_SaveDocument_Updated";
    const saved = await DatabaseManager.saveDocument(created);
    expect(saved).toBeDefined();

    const reloaded = await DatabaseManager.findById(Playlist, id);
    expect(reloaded.name).toBe("Vitest_SaveDocument_Updated");

    // cleanup
    await DatabaseManager.delete(Playlist, { _id: id });
});