import { FileOps } from './core/file-ops';
import { Dictionary, dictSchema } from './database/dictionary';
import { RepErrorCode, Repository, repositoryScheme } from './database/repository';


export class SAI {
  private _dataFolder : string;
  private _repoPath   : string;
  private _dictPath   : string;
  private _dict!      : Dictionary; // set in init()
  private _repo!      : Repository; // set in init()
  private _fileOps    : FileOps;


  get dictionary() {
    return this._dict;
  }

  get repository() {
    return this._repo;
  }


  constructor(dataFolderPath: string, isReady: (err: Error|null) => void) {
    this._dataFolder = dataFolderPath;
    this._repoPath   = `${dataFolderPath}/repository.said.gzip`;
    this._dictPath   = `${dataFolderPath}/dictionary.said.gzip`;
    this._fileOps    = new FileOps();
    this.init(isReady);
  }


  ask(question: string) {
    return this._repo.findQuestion(question);
  }


  /**
   * Adds a question using the **Item Document**
   * syntax.
   *
   * @param itemDoc A string whose content is an Item Document.
   */
  addQuestion(itemDoc: string): RepErrorCode|Promise<null> {
    const resp = this._repo.addItemDoc(itemDoc);
    if (typeof resp == 'number') return resp;
    return this._repo.save();
  }


  /**
   * Edits a question using the **Item Document**
   * syntax.
   */
  editQuestion(itemDoc: string) {
    const resp = this._repo.editItem(itemDoc);
    if (typeof resp == 'number') return resp;
    return this._repo.save();
  }


  private async init(isReadyCallback: (err: Error|null) => void) {
    try {
      this._fileOps.createFolder(this._dataFolder);
      await this._fileOps.save(this._repoPath, repositoryScheme, [], true, false);
      await this._fileOps.save(this._dictPath, dictSchema, [], true, false);
      this._dict = new Dictionary(this._fileOps, this._dictPath);
      this._repo = new Repository(this._fileOps, this._dict, this._repoPath);
      isReadyCallback(null);
    }
    catch(e) {
      isReadyCallback(Error(e.message));
    }
  }
}





