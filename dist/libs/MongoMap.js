"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoMap = void 0;
const mongodb_1 = require("mongodb");
const util_1 = require("../util");
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
    async set(key, value, prop) {
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (prop)
            return this.setByProp(key, prop, value);
        if (this.cache)
            this.cache.set(key, value);
        const result = await this.collection.findOneAndUpdate({ key }, {
            $set: { key, value }
        }, { upsert: true });
        return !!result.ok;
    }
    async delete(key, prop) {
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (prop)
            return this.deleteByProp(key, prop);
        if (this.cache)
            this.cache.delete(key);
        const result = await this.collection.findOneAndDelete({ key });
        return !!result.ok;
    }
    async get(key, prop, useCache = true) {
        let response;
        if (!this.ready)
            throw new Error("Database isn't ready");
        if (prop)
            return this.getByProp(key, prop, useCache);
        if (this.cache && useCache)
            response = this.cache.get(key);
        else {
            const result = await this.collection.findOne({ key });
            response = result === null ? undefined : result.value;
        }
        return response || this.getDefaultValue();
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
    getDefaultValue() {
        if (typeof this.defaultValue === "object")
            return util_1.clone(this.defaultValue);
        return this.defaultValue;
    }
    async getByProp(key, prop, useCache) {
        const result = await this.get(key, undefined, useCache);
        return util_1.getProp(result, prop);
    }
    async setByProp(key, prop, value) {
        let result = await this.get(key);
        result = util_1.setProp(result || {}, prop, value, true);
        return this.set(key, result);
    }
    async deleteByProp(key, prop) {
        const result = await this.get(key);
        util_1.deleteProp(result, prop);
        return this.set(key, result);
    }
}
exports.MongoMap = MongoMap;
//# sourceMappingURL=MongoMap.js.map