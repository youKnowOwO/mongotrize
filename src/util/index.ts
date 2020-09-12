/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function getProp(obj: any, properties: string): any {
    const props = parseDotString(properties);
    for (const prop of props) obj = obj[prop];
    return obj;
}

export function setProp(obj: any, properties: string, value: unknown, recursive = false): any {
    const props = parseDotString(properties);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        const exist = prop in obj;
        if (!exist && recursive) obj = {};
        else obj = i === props.length - 1 ? value : obj[prop];
    }
    return obj;
}

export function deleteProp(obj: any, properties: string): boolean {
    const props = parseDotString(properties);
    let deleted = false;
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        try {
            if (i === props.length - 1) deleted = delete obj[prop];
            obj = obj[prop];
        } catch {
            return true;
        }
    }
    return deleted;
}

export function parseDotString(properties: string): string[] {
    const result = properties.match(/(?:\\.|[^\\\.])+/g);
    if (!result) return [];
    return result.map(x => x.replace(/\\\./g, "."));
}