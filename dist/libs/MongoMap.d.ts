import { MongoMapPayload, MongoDatabase, MongoCollection, MongoValue } from "../interfaces";
import { MongoClient } from "mongodb";
export declare class MongoMap<V> {
    payload: MongoMapPayload;
    readonly client: MongoClient;
    readonly cache?: Map<string, V>;
    database?: MongoDatabase;
    collection?: MongoCollection<MongoValue<V>>;
    defaultValue?: V;
    constructor(payload: MongoMapPayload);
    get ready(): boolean;
    size(): Promise<number>;
    connect(): Promise<this>;
    set(key: string, value: V): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    get(key: string, useCache?: boolean): Promise<V | void>;
    has(key: string): Promise<boolean>;
    all(useCache?: boolean): Promise<MongoValue<V>[]>;
    clear(): Promise<void>;
    filter(callback: (value: V, key: string, index: number) => boolean): Promise<MongoValue<V>[]>;
    map<T>(callback: (value: V, key: string, index: number) => T): Promise<T[]>;
    find(callback: (value: V) => boolean): Promise<V | void>;
    first(): Promise<MongoValue<V>>;
    first(size: number): Promise<MongoValue<V>[]>;
    ensure(value: V): this;
}
