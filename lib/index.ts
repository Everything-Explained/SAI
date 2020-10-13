import { FileOps } from './core/file-ops';
import { DictionaryManager, dictSchema } from './database/dictionaryman';
import { InquiryManager, inquiryScheme } from './database/inquiryman';


export class SAI {
  private _dataFolder  : string;
  private _inquiryPath : string;
  private _dictPath    : string;
  private _dictMan!    : DictionaryManager;     // set in init()
  private _inquiryMan! : InquiryManager; // set in init()
  private _fileOps     : FileOps;


  get dictionary() {
    return this._dictMan;
  }

  get inquiryManager() {
    return this._inquiryMan;
  }

  get questions() {
    return this._inquiryMan.questions;
  }


  constructor(dataFolderPath: string, isReady: (err: Error|null) => void) {
    this._dataFolder  = dataFolderPath;
    this._inquiryPath = `${dataFolderPath}/inquiries.said.gzip`;
    this._dictPath    = `${dataFolderPath}/dictionary.said.gzip`;
    this._fileOps     = new FileOps();
    this.init(isReady);
  }


  ask(question: string) {
    return this._inquiryMan.getInquiryByQuestion(question);
  }


  /**
   * Adds a question using the **Inquiry Document**
   * syntax.
   *
   * @param inquiryDoc A string whose content is an Item Document.
   */
  async addInquiry(inquiryDoc: string, limitSave = true) {
    const res = this._inquiryMan.addInquiry(inquiryDoc);
    if (typeof res == 'number') return Promise.reject(res)
    ;
    await this._inquiryMan.save(limitSave);
    return Promise.resolve(res);
  }


  /**
   * Edits a question using the **Inquiry Document**
   * syntax.
   */
  async editInquiry(inquiryDoc: string, limitSave = true) {
    const res = this._inquiryMan.editInquiry(inquiryDoc);
    if (typeof res == 'number') return Promise.reject(res)
    ;
    await this._inquiryMan.save(limitSave);
    return Promise.resolve(res);
  }


  private async init(isReadyCallback: (err: Error|null) => void) {
    try {
      this._fileOps.createFolder(this._dataFolder);
      await this._createFiles();
      this._dictMan = new DictionaryManager(this._fileOps, this._dictPath);
      this._inquiryMan = new InquiryManager(this._fileOps, this._dictMan, this._inquiryPath);
      isReadyCallback(null);
    }
    catch(e) {
      isReadyCallback(Error(e.message));
    }
  }


  private async _createFiles() {
    if (!this._fileOps.fileExists(this._inquiryPath)) {
      await this._fileOps.save(this._inquiryPath, inquiryScheme, [], true, false);
    }
    if (!this._fileOps.fileExists(this._dictPath)) {
      await this._fileOps.save(this._dictPath, dictSchema, [], true, false);
    }
  }
}





