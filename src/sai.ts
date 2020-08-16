import { join as joinPath } from 'path';
import { cloneDeep as _cloneDeep,
         pullAt    as _pullAt,
         flatten   as _flatten,
         flow      as _flow } from 'lodash/fp'
;
import FileOps from './core/file-ops';
import { Replies } from './variables/types';
import { dictSchema, replySchema } from './variables/schema';
import { log } from 'console';


export default class SAI {
  private dataFolder : string;
  private repliesPath: string;
  private dictPath   : string;
  private fileOps    : FileOps;
  private replies!   : Replies;       // set in init()
  private words!     : string[][];    // set in init()
  private wordsRef!  : string[];      // set in init()
  private hashesRef! : string[][];    // set in init()

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
    this.fileOps     = new FileOps();
    this.init(isReady);
  }


  findHashPosition(hash: string): [number, number] | undefined {
    for (let i = 0, l = this.replies.length; i < l; i++) {
      const hashPos = this.replies[i].hashes.indexOf(hash);
      if (~hashPos) return [i, hashPos];
    }
    return undefined;
  }

  findWordsAtIndex(index: number): undefined | string[] {
    const words = this.words[index];
    return (
      words
        ? this.words[index].slice()
        : undefined
    );
  }

  findWordPosition(word: string): undefined | [number, number] {
    let row = this.words.length;
    while (--row >= 0) {
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
    if (this.hasWord(word))     { return Error('Word already exists.'); }
    if (index < 0)              { return Error('Index must be greater than -1.'); }
    if (!this.words[index])     { return Error(`The index "${index}" does not exist.`); }
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





