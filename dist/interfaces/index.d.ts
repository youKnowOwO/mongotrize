import type { MongoClientOptions, Db, Collection } from "mongodb";
export interface MongoMapPayload {
    readonly uri: string;
    readonly name: string;
    readonly collectionName: string;
    readonly cache: boolean;
    readonly options: MongoClientOptions;
}
export declare type MongoDatabase = Db;
export declare type MongoCollection<V> = Collection<V>;
export declare type MongoValue<V> = {
    key: string;
    value: V;
};
