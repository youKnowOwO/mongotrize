"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = exports.parseDotString = exports.deleteProp = exports.setProp = exports.getProp = void 0;
function getProp(obj, properties) {
    const props = parseDotString(properties);
    for (const prop of props)
        obj = obj[prop];
    return obj;
}
exports.getProp = getProp;
function setProp(obj, properties, value, recursive = false) {
    const props = parseDotString(properties);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        const exist = prop in obj;
        if (!exist && recursive)
            obj = {};
        else
            obj = i === props.length - 1 ? value : obj[prop];
    }
    return obj;
}
exports.setProp = setProp;
function deleteProp(obj, properties) {
    const props = parseDotString(properties);
    let deleted = false;
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        try {
            if (i === props.length - 1)
                deleted = delete obj[prop];
            obj = obj[prop];
        }
        catch {
            return true;
        }
    }
    return deleted;
}
exports.deleteProp = deleteProp;
function parseDotString(properties) {
    const result = properties.match(/(?:\\.|[^\\\.])+/g);
    if (!result)
        return [];
    return result.map(x => x.replace(/\\\./g, "."));
}
exports.parseDotString = parseDotString;
function clone(obj) {
    const cloned = obj instanceof Array ? [] : {};
    for (const key of Object.keys(obj)) {
        let value = obj[key];
        if (typeof value === "object" && value !== null)
            value = clone(value);
        cloned[key] = value;
    }
    return cloned;
}
exports.clone = clone;
//# sourceMappingURL=index.js.map