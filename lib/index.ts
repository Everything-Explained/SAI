import { cloneDeep as _cloneDeep,
         pullAt    as _pullAt,
         flatten   as _flatten,
         flow      as _flow } from 'lodash/fp'
;
import { FileOps } from './core/file-ops';
import { Dictionary, dictSchema } from './database/dictionary';
import { Repository, repositoryScheme } from './database/repository';


export class SAI {
  private dataFolder : string;
  private repoPath   : string;
  private dictPath   : string;
  private dict!      : Dictionary; // set in init()
  private repo!      : Repository; // set in init()
  private fileOps    : FileOps;


  constructor(dataFolderPath: string, isReady: (err: Error|null) => void) {
    this.dataFolder = dataFolderPath;
    this.repoPath   = `${dataFolderPath}/repository.said.gzip`;
    this.dictPath   = `${dataFolderPath}/dictionary.said.gzip`;
    this.fileOps    = new FileOps();
    this.init(isReady);
  }

  // ask(question: string) {
  //   // Should convert question to hash and lookup hash in database.
  //   throw Error('Not Implemented.');
  // }

  public ask(question: string) {
    return this.repo.findQuestion(question);
  }


  private async init(isReadyCallback: (err: Error|null) => void) {
    try {
      this.fileOps.createFolder(this.dataFolder);
      await this.fileOps.save(this.repoPath, repositoryScheme, [], true, false);
      await this.fileOps.save(this.dictPath, dictSchema, [], true, false);
      this.dict = new Dictionary(this.fileOps, this.dictPath);
      this.repo = new Repository(this.fileOps, this.dict, this.repoPath);
      isReadyCallback(null);
    }
    catch(e) {
      isReadyCallback(Error(e.message));
    }
  }
}





