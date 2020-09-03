"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoMap = void 0;
const mongodb_1 = require("mongodb");
class MongoMap {
    constructor(payload) {
        this.payload = payload;
        this.client = new mongodb_1.MongoClient(this.payload.uri, this.payload.options);
        this.cache = this.payload.cache ? new Map() : undefined;
        this.size = 0;
    }
    get ready() {
        return this.client.isConnected();
    }
    async connect() {
        const result = this.ready ? this.client : await this.client.connect();
        this.database = result.db(this.payload.name);
        this.collection = this.database.collection(this.payload.collectionName);
        const values = await this.all(false);
        this.size = values.length;
        if (this.cache)
            for (const value of values)
                this.cache.set(value.key, value.value);
        return this;
    }
    async set(key, value) {
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (this.cache)
            this.cache.set(key, value);
        const result = await this.collection.findOneAndUpdate({ key }, {
            $set: { key, value }
        }, { upsert: true });
        if (result.ok)
            this.size++;
        return !!result.ok;
    }
    async delete(key) {
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (this.cache)
            this.cache.delete(key);
        const result = await this.collection.findOneAndDelete({ key });
        if (result.ok)
            this.size--;
        return !!result.ok;
    }
    async get(key, useCache = true) {
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (this.cache && useCache)
            return this.cache.get(key);
        const result = await this.collection.findOne({ key });
        return result === null ? undefined : result.value;
    }
    async has(key) {
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (this.cache)
            return this.cache.has(key);
        const result = await this.collection.findOne({ key });
        return result === null;
    }
    async all(useCache = true) {
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (this.cache && useCache)
            return [...this.cache.keys()].map(x => ({ key: x, value: this.cache.get(x) }));
        return this.collection.find().toArray();
    }
    async clear() {
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (this.cache)
            this.cache.clear();
        await this.collection.deleteMany({});
    }
}
exports.MongoMap = MongoMap;
//# sourceMappingURL=MongoMap.js.map