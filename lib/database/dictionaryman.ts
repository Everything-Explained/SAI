import { FileOps } from "../core/file-ops";
import { existsSync } from 'fs';
import { Type as AvroType } from 'avsc';



export const dictSchema = AvroType.forSchema({
  name: 'dictionary',
  type: 'array', items: { type: 'array', items: 'string' }
});



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
    if (~this._wordsRef.indexOf(word)) return true;
    return false;
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


  addWord(word: string): Error|null {
    if (this.hasWord(word)) { return Error('Word already exists.'); }
    this._words.push([word]);
    this._updateWordRef();
    return null;
  }


  addWordToIndex(word: string, index: number): Error|null {
    if (this.hasWord(word)) { return Error('Word already exists.'); }
    if (index < 0)          { return Error('Index must be greater than -1.'); }
    if (!this._words[index]) { return Error(`The index "${index}" does NOT exist.`); }
    this._words[index].push(word);
    this._updateWordRef();
    return null;
  }


  delWord(word: string): Error|null {
    const wordPos = this.findWordPosition(word);
    if (!wordPos) { return Error('Word does NOT exist at.'); }
    const [row, col] = wordPos;
    this._words[row].splice(col, 1)
    ;
    // Delete entire index if it's empty
    if (!this._words[row].length) {
      this._words.splice(row, 1);
    }
    this._updateWordRef();
    return null;
  }


  delWordsAtIndex(index: number): Error|null {
    const words = this.findWordsAtIndex(index);
    if (!words) { return Error(`Index "${index}" NOT found.`); }
    this._words.splice(index, 1);
    this._updateWordRef();
    return null;
  }


  /**
   * Encodes a `word` based on its index position in
   * the words Array.
   */
  encodeWord(word: string) {
    const pos = this.findWordPosition(word);
    if (!pos) return word;
    return pos[0] < 10 ? `&0${pos[0]}` : `&${pos[0]}`;
  }


  save() {
    return this._fileOps.save(this._path, dictSchema, this._words, true);
  }


  private _updateWordRef() {
    this._wordsRef = this._words.flat();
  }

}



