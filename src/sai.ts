import { cloneDeep as _cloneDeep,
         pullAt    as _pullAt,
         flatten   as _flatten,
         flow      as _flow } from 'lodash/fp'
;
import { FileOperations } from './core/file-ops';
import { Replies } from './variables/types';
import { replySchema } from './variables/schema';
import { dictSchema } from './database/dictionary';


export class SAI {
  private dataFolder : string;
  private repliesPath: string;
  private dictPath   : string;
  private fileOps    : FileOperations;
  private replies!   : Replies;       // set in init()
  private hashesRef! : string[][];    // set in init()


  constructor(dataFolderPath: string, isReady: (err: Error|null) => void) {
    this.dataFolder  = dataFolderPath;
    this.repliesPath = `${dataFolderPath}/replies.said.gzip`;
    this.dictPath    = `${dataFolderPath}/dictionary.said.gzip`;
    this.fileOps     = new FileOperations();
    this.init(isReady);
  }

  ask(question: string) {
    // Should convert question to hash and lookup hash in database.
    throw Error('Not Implemented.');
  }

  findReply(hash: string) {
    return this.replies.find(r => ~r.hashes.indexOf(hash));
  }

  findHashPosition(hash: string): [number, number] | undefined {
    for (let i = 0, l = this.replies.length; i < l; i++) {
      const hashPos = this.replies[i].hashes.indexOf(hash);
      if (~hashPos) return [i, hashPos];
    }
    return undefined;
  }

  private async init(isReadyCallback: (err: Error|null) => void) {
    try {
      this.fileOps.createFolder(this.dataFolder);
      await this.fileOps.save(this.repliesPath, replySchema, [], true, false);
      await this.fileOps.save(this.dictPath, dictSchema, [], true, false);
      this.replies = this.fileOps.readReplyStore(this.repliesPath, replySchema);
      // this.words   = this.fileOps.readDictStore(this.dictPath, dictSchema);
      isReadyCallback(null);
    }
    catch(e) {
      isReadyCallback(Error(e.message));
    }
  }
}

// const sai = new SAI('./store', (err) => {
//   console.log(err);
// });

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





