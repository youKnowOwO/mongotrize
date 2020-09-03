import { MongoMapPayload, MongoDatabase, MongoCollection, MongoValue } from "../interfaces";
import { MongoClient } from "mongodb";
export declare class MongoMap<V> {
    payload: MongoMapPayload;
    readonly client: MongoClient;
    readonly cache?: Map<string, V>;
    database?: MongoDatabase;
    collection?: MongoCollection<MongoValue<V>>;
    size: number;
    constructor(payload: MongoMapPayload);
    get ready(): boolean;
    connect(): Promise<this>;
    set(key: string, value: V): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    get(key: string, useCache?: boolean): Promise<V | void>;
    has(key: string): Promise<boolean>;
    all(useCache?: boolean): Promise<MongoValue<V>[]>;
    clear(): Promise<void>;
}
