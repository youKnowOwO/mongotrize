"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoMap = void 0;
const mongodb_1 = require("mongodb");
class MongoMap {
    constructor(payload) {
        this.payload = payload;
        this.client = new mongodb_1.MongoClient(this.payload.uri, this.payload.options);
        this.cache = this.payload.cache ? new Map() : undefined;
    }
    get ready() {
        return this.client.isConnected();
    }
    async size() {
        const values = await this.all();
        return values.length;
    }
    async connect() {
        const result = this.ready ? this.client : await this.client.connect();
        this.database = result.db(this.payload.name);
        this.collection = this.database.collection(this.payload.collectionName);
        if (this.cache) {
            const values = await this.all();
            for (const { key, value } of values)
                this.cache.set(key, value);
        }
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
        return !!result.ok;
    }
    async delete(key) {
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (this.cache)
            this.cache.delete(key);
        const result = await this.collection.findOneAndDelete({ key });
        return !!result.ok;
    }
    async get(key, useCache = true) {
        let response;
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (this.cache && useCache)
            response = this.cache.get(key);
        else {
            const result = await this.collection.findOne({ key });
            response = result === null ? undefined : result.value;
        }
        return response || this.defaultValue;
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
    async filter(callback) {
        const values = await this.all();
        return values.filter((x, i) => callback.call(this, x.value, x.key, i));
    }
    async map(callback) {
        const values = await this.all();
        return values.map((x, i) => callback.call(this, x.value, x.key, i));
    }
    async find(callback) {
        const values = await this.filter(x => callback.call(this, x));
        if (values[0])
            return values[0].value;
    }
    async first(size = 1) {
        const values = await this.all();
        const value = [...values].splice(0, size);
        if (size === 1)
            return value[0];
    }
    ensure(value) {
        this.defaultValue = value;
        return this;
    }
}
exports.MongoMap = MongoMap;
//# sourceMappingURL=MongoMap.js.map