import { join as joinPath } from 'path';
import { cloneDeep as _cloneDeep,
         pullAt    as _pullAt,
         flatten   as _flatten,
         flow      as _flow } from 'lodash/fp'
;
import { FileOperations } from './file-ops';
import { Replies } from './types';
import { dictSchema, replySchema } from './schema';
import { log } from 'console';


export default class SAI {
  private dataFolder : string;
  private repliesPath: string;
  private dictPath   : string;
  private fileOps    : FileOperations;
  private replies!   : Replies;     // set in init()
  private words!     : string[][];  // set in init()
  private wordsRef!  : string[];    // set in init()

  get wordList(): string[][] {
    return this.words.slice();
  }

  get wordsRefList(): string[] {
    return this.wordsRef.slice();
  }


  constructor(dataFolderPath: string, isReady: () => void) {
    this.dataFolder  = dataFolderPath;
    this.repliesPath = `${dataFolderPath}/replies.said.gzip`;
    this.dictPath    = `${dataFolderPath}/dictionary.said.gzip`;
    this.fileOps     = new FileOperations();
    this.fileOps.createFolder(dataFolderPath);
    this.init(isReady);
  }


  private async init(isReadyCallback: () => void) {
    await this.fileOps.save(this.repliesPath, replySchema, [], true, false);
    await this.fileOps.save(this.dictPath, dictSchema, [], true, false);
    this.replies = this.fileOps.readReplyStore(this.repliesPath, replySchema);
    this.words   = this.fileOps.readDictStore(this.dictPath, dictSchema);
    this.updateWordsRef();
    isReadyCallback();
  }


  findWordsAtIndex(index: number): [Error|null, string[]] {
    if (index < 0) {
      return [Error(`Index must be greater than -1`), []];
    }
    const words = this.words[index];
    return (
      words
        ? [null, this.words[index]]
        : [Error(`The index "${index}" does not exist.`), []]
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
    const [err, words, row, col] = this.findWord(word);
    if (err) { return err; }
    this.words[row].splice(col, 1);

    // Delete entire index if it's empty
    if (!this.words[row].length) {
      this.words.splice(row, 1);
    }
    this.updateWordsRef();
    return null;
  }


  delWordsAtIndex(index: number): Error|null {
    const [err] = this.findWordsAtIndex(index);
    if (err) { return err; }
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

// const sai = new SAI('./store');

// sai.addWord('god');
// sai.addWordToIndex('deity', 0);
// sai.addWordToIndex('almighty', 0);
// sai.addWord('pickles');
// sai.addWordToIndex('cucumbers', 1);
// log(sai.words);
// log('delete word');
// sai.delWord('god');
// log(sai.words);
// log('delete index');
// log(sai.delWordsAtIndex(3));
// log(sai.words);





