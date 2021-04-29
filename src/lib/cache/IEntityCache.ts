export interface IEntityCache {    
    name: string;
    keys: string[];

    get(keys: object): Promise<object>;    
    create(values: object[]): Promise<void>;
    add(value: object): Promise<void>;

    setKeys(keys: string[]): void;
    setCheckExpire(seconds: number): void;

    clear(): Promise<void>;
}
