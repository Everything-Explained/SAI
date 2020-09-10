import { FileOps } from "../core/file-ops";
import { Type as AvroType } from 'avsc';
import { Contemplator } from "../core/contemplator";
import { Dictionary } from "./dictionary";
import { FrontMatterResult } from 'front-matter';
export interface RepoItem {
    questions: string[];
    answer: string;
    hashes: number[];
    tags: string[];
    authors: string[];
    level: number;
    dateCreated: number;
    dateEdited: number;
}
export interface ItemDoc {
    title: string;
    questions: string[];
    level: number;
    tags: string[];
    author: string;
}
export declare const repositoryScheme: AvroType;
export declare enum DocErrorCode {
    EMPTY = 0,
    INVALID = 1,
    MISSHEAD = 2,
    MISSTITLE = 3,
    INVALIDQ = 4,
    MISSA = 5,
    MISSAUTHOR = 6,
    IDENTICALQ = 7
}
export declare class Repository {
    private _fileOps;
    private _dict;
    private _path;
    private _items;
    private _contemplate;
    get items(): RepoItem[];
    set items(val: RepoItem[]);
    get contemplate(): Contemplator;
    constructor(_fileOps: FileOps, _dict: Dictionary, _path: string);
    getItem(hash: number): RepoItem | undefined;
    indexOfItem(hash: number): number;
    editItem(oldHash: number, editedItem: RepoItem): boolean;
    addItemDoc(itemDoc: string, author: string): DocErrorCode | null;
    parseItemDoc(rawDoc: string): DocErrorCode | [string[], string];
    getFrontMatter(doc: string): FrontMatterResult<ItemDoc> | undefined;
    save(): Promise<null>;
    hashQuestions(questions: string[]): DocErrorCode | number[];
}
