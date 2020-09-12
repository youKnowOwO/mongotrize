import { MongoMapPayload, MongoDatabase, MongoCollection, MongoValue } from "../interfaces";
import { MongoClient } from "mongodb";
import { getProp, setProp, deleteProp } from "../util";

export class MongoMap<V> {
    public readonly client = new MongoClient(this.payload.uri, this.payload.options);
    public readonly cache?: Map<string, V> = this.payload.cache ? new Map() : undefined;
    public database?: MongoDatabase;
    public collection?: MongoCollection<MongoValue<V>>;
    public defaultValue?: V;
    public constructor(public payload: MongoMapPayload) {}

    public get ready(): boolean {
        return this.client.isConnected();
    }

    public async size(): Promise<number> {
        const values = await this.all();
        return values.length;
    }

    public async connect(): Promise<this> {
        const result = this.ready ? this.client : await this.client.connect();
        this.database = result.db(this.payload.name);
        this.collection = this.database.collection(this.payload.collectionName);
        if (this.cache) {
            const values = await this.all();
            for (const { key, value } of values) this.cache.set(key, value);
        }
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async set(key: string, value: any, prop: string): Promise<boolean>
    public async set(key: string, value: V, prop?: undefined): Promise<boolean>
    public async set(key: string, value: V, prop?: string): Promise<boolean> {
        if (!this.ready) throw new Error("Database isn't ready");
        if (prop) return this.setByProp(key, prop, value);
        if (this.cache) this.cache.set(key, value);
        const result = await this.collection!.findOneAndUpdate({ key }, {
            $set: { key, value }
        }, { upsert: true });
        return !!result.ok;
    }

    public async delete(key: string, prop?: string): Promise<boolean> {
        if (!this.ready) throw new Error("Database isn't ready");
        if (prop) return this.deleteByProp(key, prop);
        if (this.cache) this.cache.delete(key);
        const result = await this.collection!.findOneAndDelete({ key });
        return !!result.ok;
    }

    public async get(key: string, prop?: undefined, useCache?: boolean): Promise<V|void>;
    public async get(key: string, prop: string, useCache?: boolean): Promise<any>;
    public async get(key: string, prop?: string, useCache = true): Promise<any> {
        let response: V|void;
        if (!this.ready) throw new Error("Database isn't ready");
        if (prop) return this.getByProp(key, prop, useCache);
        if (this.cache && useCache) response = this.cache.get(key);
        else {
            const result = await this.collection!.findOne({ key });
            response = result === null ? undefined : result.value;
        }
        return response || this.defaultValue;
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

    public async filter(callback: (value: V, key: string, index: number) => boolean): Promise<MongoValue<V>[]> {
        const values = await this.all();
        return values.filter((x, i) => callback.call(this, x.value, x.key, i));
    }

    public async map<T>(callback: (value: V, key: string, index: number) => T): Promise<T[]> {
        const values = await this.all();
        return values.map((x, i) => callback.call(this, x.value, x.key, i));
    }

    public async find(callback: (value: V) => boolean): Promise<V|void> {
        const values = await this.filter(x => callback.call(this, x));
        if (values[0]) return values[0].value;
    }

    public async first(): Promise<MongoValue<V>>;
    public async first(size: number): Promise<MongoValue<V>[]>;
    public async first(size = 1): Promise<any> {
        const values = await this.all();
        const value = [...values].splice(0, size);
        if (size === 1) return value[0];
    }

    public ensure(value: V): this {
        this.defaultValue = value;
        return this;
    }

    private async getByProp(key: string, prop: string, useCache: boolean): Promise<any> {
        const result = await this.get(key, undefined, useCache);
        return getProp(result, prop);
    }

    private async setByProp(key: string, prop: string, value: any): Promise<boolean> {
        let result: any = await this.get(key);
        result = setProp(result || {}, prop, value, true);
        return this.set(key, result);
    }

    private async deleteByProp(key: string, prop: string): Promise<boolean> {
        const result: any = await this.get(key);
        deleteProp(result, prop);
        return this.set(key, result);
    }
}
