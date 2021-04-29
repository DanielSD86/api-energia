import NodeCache from "node-cache";

import { IEntityCache } from "@lib/cache/IEntityCache";

export const CACHE_FIELD = "cache";

export enum GroupCache {
    ALL = "all",
    ICMS_INTERESTADUAIS = "icmsinterestaduais",  
    ICMS_ESTADUAIS = "icmsestadual",  
}

export class NodeEntityCache implements IEntityCache {
    name: string;
    cache: NodeCache;
    keys: string[];

    constructor(name: string) {
        this.name = name;
        this.cache = new NodeCache();
    }

    setCheckExpire(seconds: number): void {
        this.cache.options.stdTTL = seconds;
    }

    async add(value: object): Promise<void> {
        const key = this.keys.reduce((name, field) => { return name += "#" + value[field]; }, "").substr(1);
        this.cache.set(key, value);
    }

    async clear(): Promise<void> {
        this.cache.flushAll();
    }

    async get(data: object): Promise<object> {
        const key = this.keys.reduce((name, field) => { return name += "#" + data[field]; }, "").substr(1);
        return this.cache.get(key);
    }
    
    async create(values: object[]): Promise<void> {
        if (!values) {
            return;
        }

        for (const value of values) {
            const key = this.keys.reduce((name, field) => { return name += "#" + value[field]; }, "").substr(1);
            this.cache.set(key, value);
        }        
    }    

    setKeys(keys: string[]): void {
        this.keys = keys;
    }
}
