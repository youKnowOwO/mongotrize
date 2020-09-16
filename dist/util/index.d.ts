export declare function getProp(obj: any, properties: string): any;
export declare function setProp(obj: any, properties: string, value: unknown, recursive?: boolean): any;
export declare function deleteProp(obj: any, properties: string): boolean;
export declare function parseDotString(properties: string): string[];
export declare function clone<T extends never[]>(obj: T): T;
export declare function clone<K extends object>(obj: K): K;
