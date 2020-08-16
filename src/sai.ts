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
  private replies!   : Replies;       // set in init()
  private words!     : string[][];    // set in init()
  private wordsRef!  : string[];      // set in init()

  get wordList(): string[][] {
    return this.words.slice();
  }

  get wordsRefList(): string[] {
    return this.wordsRef.slice();
  }


  constructor(dataFolderPath: string, isReady: (err: Error|null) => void) {
    this.dataFolder  = dataFolderPath;
    this.repliesPath = `${dataFolderPath}/replies.said.gzip`;
    this.dictPath    = `${dataFolderPath}/dictionary.said.gzip`;
    this.fileOps     = new FileOperations();
    this.init(isReady);
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

  findWordPosition(word: string): null | [number, number] {
    let row = this.words.length;
    while (--row >= 0) {
      const col = this.words[row].indexOf(word);
      if (~col) {
        return [row, col];
      }
    }
    return null;
  }

  addWord(word: string): Error|null {
    if (this.hasWord(word)) { return Error('Word already exists.'); }
    this.words.push([word]);
    this.updateWordRef();
    return null;
  }

  addWordToIndex(word: string, index: number): Error|null {
    if (this.hasWord(word))     { return Error('Word already exists.'); }
    if (index < 0)              { return Error('Index must be greater than -1.'); }
    if (!this.words[index])     { return Error(`The index "${index}" does not exist.`); }
    this.words[index].push(word);
    this.updateWordRef();
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
    this.updateWordRef();
    return null;
  }

  delWordsAtIndex(index: number): Error|null {
    const [err] = this.findWordsAtIndex(index);
    if (err) { return err; }
    this.words.splice(index, 1);
    this.updateWordRef();
    return null;
  }


  private async init(isReadyCallback: (err: Error|null) => void) {
    try {
      this.fileOps.createFolder(this.dataFolder);
      await this.fileOps.save(this.repliesPath, replySchema, [], true, false);
      await this.fileOps.save(this.dictPath, dictSchema, [], true, false);
      this.replies = this.fileOps.readReplyStore(this.repliesPath, replySchema);
      this.words   = this.fileOps.readDictStore(this.dictPath, dictSchema);
      this.updateWordRef();
      isReadyCallback(null);
    }
    catch(e) {
      isReadyCallback(new Error(e.message));
    }
  }

  private hasWord(word: string): boolean {
    if (!this.wordsRef.length) return false;
    if (~this.wordsRef.indexOf(word)) return true;
    return false;
  }

  private updateWordRef() {
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





