import { FileOps } from "../core/file-ops";
import { existsSync } from 'fs';
import { Type as AvroType } from 'avsc';
import { padNumber } from "../core/utils";



export const dictSchema = AvroType.forSchema({
  name: 'dictionary',
  type: 'array', items: { type: 'array', items: 'string' }
});


export enum DictErrorCode {
  AlreadyExists,
  IndexLessThanZero,
  IndexNotFound,
  WordNotFound,
}

type AddWordError = DictErrorCode.AlreadyExists;
type AddWordToIndexError =
  DictErrorCode.AlreadyExists |
  DictErrorCode.IndexLessThanZero |
  DictErrorCode.IndexNotFound
;
type DelWordError = DictErrorCode.WordNotFound;
type DelWordAtIndexError = DictErrorCode.IndexNotFound;


export class DictionaryManager {
  private _words!     : string[][];    // set in init()
  private _wordsRef!  : string[];      // set in init()

  /**
   * Sets or gets the word list. Setting this value is **destructive**.
   * *Do not set this value manually unless you know what you're doing.*
   */
  get words(): string[][] {
    return [...this._words];
  }
  set words(val: string[][]) {
    this._words = val;
    this._updateWordRef();
  }

  /**
   * Retrieves Array of all dictionary words
   * pushed into a single dimension array.
   */
  get flatWords(): string[] {
    return [...this._wordsRef];
  }


  constructor(private _fileOps: FileOps, private _path: string) {
    if (!existsSync(_path))
      throw Error(`Path to dictionary: "${_path}" does NOT exist.`)
    ;
    this._words = _fileOps.readDictStore(_path);
    this._updateWordRef();
  }


  hasWord(word: string): boolean {
    if (!this._wordsRef.length) return false;
    return this._wordsRef.includes(word);
  }

  /**
   * Retrieves an Array of synonyms at the given `index`; or
   * _undefined_ if the `index` is not found.
   */
  findWordsAtIndex(index: number): undefined | string[] {
    const words = this._words[index];
    return (
      words
        ? this._words[index].slice()
        : undefined
    );
  }


  /**
   * Retrieves the row and column indexes of the
   * specified `word`; or _undefined_ if the `word`
   * is not found.
   */
  findWordPosition(word: string): [number, number] | undefined {
    let row = this._words.length;
    while (row--) {
      const col = this._words[row].indexOf(word);
      if (~col) {
        return [row, col];
      }
    }
    return undefined;
  }


  addWord(word: string): AddWordError|true {
    if (this.hasWord(word)) { return DictErrorCode.AlreadyExists; }
    this._words.push([word]);
    this._updateWordRef();
    return true;
  }


  addWordToIndex(word: string, index: number): AddWordToIndexError|true {
    if (this.hasWord(word))  { return DictErrorCode.AlreadyExists; }
    if (index < 0)           { return DictErrorCode.IndexLessThanZero; }
    if (!this._words[index]) { return DictErrorCode.IndexNotFound; }
    this._words[index].push(word);
    this._updateWordRef();
    return true;
  }


  delWord(word: string): DelWordError|true {
    const wordPos = this.findWordPosition(word);
    if (!wordPos) { return DictErrorCode.WordNotFound; }
    const [row, col] = wordPos;
    this._words[row].splice(col, 1)
    ;
    // Delete entire row if it's empty
    if (!this._words[row].length) {
      this._words.splice(row, 1);
    }
    this._updateWordRef();
    return true;
  }


  delWordsAtIndex(index: number): DelWordAtIndexError|true {
    const words = this.findWordsAtIndex(index);
    if (!words) { return DictErrorCode.IndexNotFound; }
    this._words.splice(index, 1);
    this._updateWordRef();
    return true;
  }


  save() {
    return this._fileOps.save(this._path, dictSchema, this._words, true);
  }


  private _updateWordRef() {
    this._wordsRef = this._words.flat();
  }

}



