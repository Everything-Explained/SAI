import { join as joinPath } from 'path';
import { cloneDeep as _cloneDeep,
         pullAt    as _pullAt,
         flatten   as _flatten,
         flow      as _flow } from 'lodash/fp'
;
import { createGzipFile, createFolder, readReplyStore, readDictStore } from './file-ops';
import { Replies } from './types';
import { dictSchema, replySchema } from './schema';
import { log } from 'console';


export default class SAI {

  private dataFolder : string;
  private repliesPath: string;
  private dictPath   : string;
  private replies    : Replies;
  private words      : string[][];
  private wordsRef!  : string[];


  get wordList(): string[][] {
    return this.words.slice();
  }

  get wordsRefList(): string[] {
    return this.wordsRef.slice();
  }


  constructor(dataFolderPath: string) {
    this.dataFolder  = dataFolderPath;
    this.repliesPath = `${dataFolderPath}/replies.said`;
    this.dictPath    = `${dataFolderPath}/dictionary.said`;

    createFolder(dataFolderPath);
    createGzipFile(this.repliesPath, replySchema.toBuffer({ replies: [] }));
    createGzipFile(this.dictPath, dictSchema.toBuffer({ words: [] }));

    this.replies = readReplyStore(this.repliesPath, replySchema);
    this.words   = readDictStore(this.dictPath, dictSchema);

    this.updateWordsRef();

    // console.log(this.#replies);
    // console.log(this.#words);
  }


  findWordIndex(index: number): [Error|null, string[]] {
    const words = this.words[index];
    return (
      words
        ? [null, this.words[index]]
        : [Error(`${index} not found.`), []]
    );
  }


  findWord(word: string): [Error|null, string[], number, number] {
    let i = this.words.length;
    while (--i >= 0) {
      const wordIndex = this.words[i].indexOf(word);
      if (~wordIndex) {
        return [null, this.words[i], i, wordIndex];
      }
    }
    return [Error(`"${word}" not found.`), [], -1, -1];
  }


  addWord(word: string): Error|null {
    if (this.dictHasWord(word)) {
      return Error('Word already exists.');
    }
    this.words.push([word]);
    this.updateWordsRef();
    return null;
  }


  addWordToIndex(word: string, index: number): Error|null {
    if (this.dictHasWord(word)) {
      return Error('Word already exists.');
    }
    if (index < 0) {
      return Error('Index must be greater than -1.');
    }
    if (!this.words[index]) {
      return Error(`The index "${index}" does not exist.`);
    }
    this.words[index].push(word);
    this.updateWordsRef();
    return null;
  }


  delWord(word: string): Error|null {
    const [err, words, x, y] = this.findWord(word);

    if (err) {
      return err;
    }
    this.words[x].splice(y, 1);

    // Delete entire index if it's empty
    if (!this.words[x].length) {
      this.words.splice(x, 1);
    }
    this.updateWordsRef();
    return null;
  }


  delWordsAtIndex(index: number): Error|null {
    if (index < 0) {
      return Error('Index must be greater than -1.');
    }
    if (!this.words[index]) {
      return Error(`The index "${index}" does not exist.`);
    }
    this.words.splice(index, 1);
    this.updateWordsRef();
    return null;
  }


  private dictHasWord(word: string): boolean {
    if (!this.wordsRef.length) return false;
    if (~this.wordsRef.indexOf(word)) return true;
    return false;
  }


  private updateWordsRef() {
    this.wordsRef = _flatten(this.words);
  }


}







