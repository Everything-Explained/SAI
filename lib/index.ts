import { FileOps } from './core/file-ops';
import { ParityManager, paritySchema } from './database/parity_manager';
import { InquiryManager, inquiryScheme } from './database/inquiry_manager';


export class SAI {
  private _dataFolder  : string;
  private _inquiryPath : string;
  private _parityPath  : string;
  private _parityMngr! : ParityManager;     // set in init()
  private _inquiryMngr!: InquiryManager; // set in init()
  private _fileOps     : FileOps;


  get parityManager() {
    return this._parityMngr;
  }

  get inquiryManager() {
    return this._inquiryMngr;
  }

  get questions() {
    return this._inquiryMngr.questions;
  }


  constructor(dataFolderPath: string, isReady: (err: Error|null) => void) {
    this._dataFolder  = dataFolderPath;
    this._inquiryPath = `${dataFolderPath}/inquiries.said.gzip`;
    this._parityPath    = `${dataFolderPath}/parity.said.gzip`;
    this._fileOps     = new FileOps();
    this.init(isReady);
  }


  ask(question: string) {
    return this._inquiryMngr.getInquiryByQuestion(question);
  }


  /**
   * Adds a question using the **Inquiry Document**
   * syntax.
   *
   * @param inquiryDoc A string whose content is an Inquiry Document.
   */
  async addInquiry(inquiryDoc: string, limitSave = true) {
    const res = this._inquiryMngr.addInquiry(inquiryDoc);
    if (typeof res == 'number') return Promise.reject(res)
    ;
    await this._inquiryMngr.save(limitSave);
    return Promise.resolve(res);
  }


  /**
   * Edits a question using the **Inquiry Document**
   * syntax.
   */
  async editInquiry(inquiryDoc: string, limitSave = true) {
    const res = this._inquiryMngr.editInquiry(inquiryDoc);
    if (typeof res == 'number') return Promise.reject(res)
    ;
    await this._inquiryMngr.save(limitSave);
    return Promise.resolve(res);
  }


  private async init(isReadyCallback: (err: Error|null) => void) {
    try {
      this._fileOps.createFolder(this._dataFolder);
      await this._createFiles();
      this._parityMngr = new ParityManager(this._fileOps, this._parityPath);
      this._inquiryMngr = new InquiryManager(this._fileOps, this._parityMngr, this._inquiryPath);
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
    if (!this._fileOps.fileExists(this._parityPath)) {
      await this._fileOps.save(this._parityPath, paritySchema, [], true, false);
    }
  }
}





