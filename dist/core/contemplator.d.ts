import { Dictionary } from "../database/dictionary";
import { HashObject } from 'xxhash-addon';
export declare class Contemplator {
    private dict;
    private _hash32;
    get hashObj(): HashObject;
    constructor(dict: Dictionary);
    queryToHash(tokens: string[], checkQuery?: boolean): number | undefined;
    isQuery(tokens: string[]): boolean;
    filterContractions(tokens: string[]): string[];
    filterUnknown(tokens: string[]): string[];
    setQueryCode(tokens: string[]): string[];
    stripOptional(tokens: string[]): string[];
    setContextCode(tokens: string[]): string[];
    setDictCode(dict: Dictionary): (tokens: string[]) => string[];
    toHash(hasher: HashObject): (tokens: string[]) => number;
}
