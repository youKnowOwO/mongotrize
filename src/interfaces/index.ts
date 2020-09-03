import type { MongoClientOptions, Db, Collection } from "mongodb";

export interface MongoMapPayload {
    readonly uri: string;
    readonly name: string;
    readonly collectionName: string;
    readonly cache: boolean;
    readonly options: MongoClientOptions;
}

export type MongoDatabase = Db;

export type MongoCollection<V> = Collection<V>;

export type MongoValue<V> = { key: string; value: V };
