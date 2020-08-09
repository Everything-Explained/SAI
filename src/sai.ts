import { join as joinPath } from 'path';
import { cloneDeep as _cloneDeep,
         pullAt    as _pullAt,
         flatten   as _flatten,
         flow      as _flow } from 'lodash/fp'
;
import { createGzipFile, createFolder, readReplyStore, readDictStore } from './file-ops';
import { Replies } from './types';
import { dictSchema, replySchema } from './schema';


export default class SAI {

  #dataFolder : string;
  #repliesPath: string;
  #dictPath   : string;
  #replies    : Replies;
  #words      : string[][];
  #wordsRef!  : string[];


  get words(): string[][] {
    return this.#words.slice();
  }


  constructor(dataFolderPath: string) {
    this.#dataFolder  = dataFolderPath;
    this.#repliesPath = `${dataFolderPath}/replies.said`;
    this.#dictPath    = `${dataFolderPath}/dictionary.said`;

    createFolder(dataFolderPath);
    createGzipFile(this.#repliesPath, replySchema.toBuffer({ replies: [] }));
    createGzipFile(this.#dictPath, dictSchema.toBuffer({ words: [] }));

    this.#replies  = readReplyStore(this.#repliesPath, replySchema);
    this.#words    = readDictStore(this.#dictPath, dictSchema);

    this.updateWordsRef();

    console.log(this.#replies);
    console.log(this.#words);
  }


  addWord(word: string, index?: number): true | Error {
    if (this.dictHasWord(word)) return new Error('Word already exists.');

    if (typeof index != 'number') {
      this.#words.push([word]);
    }

    if (typeof index == 'number') {
      if (index < 0)           return new Error('Index must be greater than -1.');
      if (!this.#words[index]) return new Error(`The index "${index}" does not exist.`);
      this.#words[index].push(word);
    }

    this.updateWordsRef();
    return true;
  }


  delWord(word: string, index: number): boolean | Error {
    if (index < 0) return new Error('Index must be greater than -1.');

    if (!this.#words[index]) {
      return Error(`The index "${index}" does not exist.`);
    }

    const wordIndex = this.#words[index].indexOf(word);
    if (!~wordIndex) {
      return new Error(`The word "${word}" does not exist at index "${index}".`);
    }

    this.#words[index].splice(wordIndex, 1);
    // Delete entire array if it's empty
    if (!this.#words[index].length) {
      this.#words.splice(index, 1);
    }
    this.updateWordsRef();
    return true;
  }


  private dictHasWord(word: string): boolean {
    if (!this.#wordsRef.length) return false;
    if (~this.#wordsRef.indexOf(word)) return true;
    return false;
  }


  private updateWordsRef() {
    this.#wordsRef = _flatten(this.#words);
  }


}







