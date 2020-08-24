import { cloneDeep as _cloneDeep,
         pullAt    as _pullAt,
         flatten   as _flatten,
         flow      as _flow } from 'lodash/fp'
;
import { FileOps } from './core/file-ops';
import { Dictionary, dictSchema } from './database/dictionary';
import { Repository, replySchema } from './database/repository';


export class SAI {
  private dataFolder : string;
  private repliesPath: string;
  private dictPath   : string;
  private dict!      : Dictionary; // set in init()
  private replies!   : Repository;    // set in init()
  private fileOps    : FileOps;


  constructor(dataFolderPath: string, isReady: (err: Error|null) => void) {
    this.dataFolder  = dataFolderPath;
    this.repliesPath = `${dataFolderPath}/replies.said.gzip`;
    this.dictPath    = `${dataFolderPath}/dictionary.said.gzip`;
    this.fileOps     = new FileOps();
    this.init(isReady);
  }

  // ask(question: string) {
  //   // Should convert question to hash and lookup hash in database.
  //   throw Error('Not Implemented.');
  // }

  private async init(isReadyCallback: (err: Error|null) => void) {
    try {
      this.fileOps.createFolder(this.dataFolder);
      await this.fileOps.save(this.repliesPath, replySchema, [], true, false);
      await this.fileOps.save(this.dictPath, dictSchema, [], true, false);
      this.dict = new Dictionary(this.fileOps, this.dictPath);
      this.replies = new Repository(this.fileOps, this.dict, this.repliesPath);
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





