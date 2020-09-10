import { FileOps } from "../core/file-ops";
import { Type as AvroType } from 'avsc';
export declare const dictSchema: AvroType;
export declare class Dictionary {
    private fileOps;
    private _words;
    private _wordsRef;
    get words(): string[][];
    set words(val: string[][]);
    get flatWords(): string[];
    constructor(fileOps: FileOps, path: string);
    hasWord(word: string): boolean;
    findWordsAtIndex(index: number): undefined | string[];
    findWordPosition(word: string): [number, number] | undefined;
    addWord(word: string): Error | null;
    addWordToIndex(word: string, index: number): Error | null;
    delWord(word: string): Error | null;
    delWordsAtIndex(index: number): Error | null;
    encodeWord(word: string): string;
    private updateWordRef;
}
