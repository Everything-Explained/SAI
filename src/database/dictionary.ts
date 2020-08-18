import { FileOps } from "../core/file-ops";
import { existsSync } from 'fs';
import { Type as AvroType } from 'avsc';



export const dictSchema = AvroType.forSchema({
  name: 'dictionary',
  type: 'array', items: { type: 'array', items: 'string' }
});



export class Dictionary {
  private words!     : string[][];    // set in init()
  private wordsRef!  : string[];      // set in init()

  /**
   * Sets or gets the word list. Setting this value is **destructive**.
   * *Do not set this value manually unless you know what you're doing.*
   */
  set wordList(val: string[][]) {
    this.words = val;
    this.updateWordRef();
  }

  get wordList(): string[][] {
    return [...this.words];
  }

  get wordsRefList(): string[] {
    return [...this.wordsRef];
  }


  constructor(private fileOps: FileOps, path: string) {
    if (!existsSync(path))
      throw Error(`Path to dictionary: "${path}" does NOT exist.`)
    ;
    this.words = fileOps.readDictStore(path);
    this.updateWordRef();
  }


  hasWord(word: string): boolean {
    if (!this.wordsRef.length) return false;
    if (~this.wordsRef.indexOf(word)) return true;
    return false;
  }

  findWordsAtIndex(index: number): undefined | string[] {
    const words = this.words[index];
    return (
      words
        ? this.words[index].slice()
        : undefined
    );
  }

  findWordPosition(word: string): [number, number] | undefined {
    let row = this.words.length;
    while (row--) {
      const col = this.words[row].indexOf(word);
      if (~col) {
        return [row, col];
      }
    }
    return undefined;
  }

  addWord(word: string): Error|null {
    if (this.hasWord(word)) { return Error('Word already exists.'); }
    this.words.push([word]);
    this.updateWordRef();
    return null;
  }

  addWordToIndex(word: string, index: number): Error|null {
    if (this.hasWord(word)) { return Error('Word already exists.'); }
    if (index < 0)          { return Error('Index must be greater than -1.'); }
    if (!this.words[index]) { return Error(`The index "${index}" does NOT exist.`); }
    this.words[index].push(word);
    this.updateWordRef();
    return null;
  }

  delWord(word: string): Error|null {
    const wordPos = this.findWordPosition(word);
    if (!wordPos) { return Error('Word does NOT exist at.'); }
    const [row, col] = wordPos;
    this.words[row].splice(col, 1);
    // Delete entire index if it's empty
    if (!this.words[row].length) {
      this.words.splice(row, 1);
    }
    this.updateWordRef();
    return null;
  }

  delWordsAtIndex(index: number): Error|null {
    const words = this.findWordsAtIndex(index);
    if (!words) { return Error(`Index "${index}" NOT found.`); }
    this.words.splice(index, 1);
    this.updateWordRef();
    return null;
  }

  private updateWordRef() {
    this.wordsRef = this.words.flat();
  }


}