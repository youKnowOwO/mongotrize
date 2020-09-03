import { MongoMapPayload, MongoDatabase, MongoCollection, MongoValue } from "../interfaces";
import { MongoClient } from "mongodb";

export default class MongoMap<V> {
    public readonly client = new MongoClient(this.payload.uri, this.payload.options);
    public readonly cache?: Map<string, V> = this.payload.cache ? new Map() : undefined;
    public database?: MongoDatabase;
    public collection?: MongoCollection<MongoValue<V>>;
    public size = 0;
    public constructor(public payload: MongoMapPayload) {}

    public get ready(): boolean {
        return this.client.isConnected();
    }

    public async connect(): Promise<this> {
        const result = this.ready ? this.client : await this.client.connect();
        this.database = result.db(this.payload.name);
        this.collection = this.database.collection(this.payload.collectionMame);
        const values = await this.all(false);
        this.size = values.length;
        if (this.cache) for (const value of values) this.cache.set(value.key, value.value);
        return this;
    }

    public async set(key: string, value: V): Promise<boolean> {
        if (!this.ready) throw new Error("Database isn't ready");
        if (this.cache) this.cache.set(key, value);
        const result = await this.collection!.findOneAndUpdate({ key }, {
            $set: { key, value }
        }, { upsert: true });
        if (result.ok) this.size++;
        return !!result.ok;
    }

    public async delete(key: string): Promise<boolean> {
        if (!this.ready) throw new Error("Database isn't ready");
        if (this.cache) this.cache.delete(key);
        const result = await this.collection!.findOneAndDelete({ key });
        if (result.ok) this.size--;
        return !!result.ok;
    }

    public async get(key: string, useCache = true): Promise<V|void> {
        if (!this.ready) throw new Error("Database isn't ready");
        if (this.cache && useCache) return this.cache.get(key);
        const result = await this.collection!.findOne({ key });
        return result === null ? undefined : result.value;
    }

    public async has(key: string): Promise<boolean> {
        if (!this.ready) throw new Error("Database isn't ready");
        if (this.cache) return this.cache.has(key);
        const result = await this.collection!.findOne({ key });
        return result === null;
    }

    public async all(useCache = true): Promise<MongoValue<V>[]> {
        if (!this.ready) throw new Error("Database isn't ready");
        if (this.cache && useCache) return [...this.cache.keys()].map(x => ({ key: x, value: this.cache!.get(x)! }));
        return this.collection!.find().toArray();
    }

    public async clear(): Promise<void> {
        if (!this.ready) throw new Error("Database isn't ready");
        if (this.cache) this.cache.clear();
        await this.collection!.deleteMany({});
    }
}