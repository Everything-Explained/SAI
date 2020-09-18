import { FileOps } from "../core/file-ops";
import { Type as AvroType } from 'avsc';
import { existsSync } from "fs";
import { Contemplator } from "../core/contemplator";
import { Dictionary } from "./dictionary";
import frontMatter, { FrontMatterResult } from 'front-matter';


export interface RepoItem {
  answer      : string;
  ids         : string[];
  tags        : string[];
  authors     : string[];
  level       : number;
  dateCreated : number;
  dateEdited  : number;
  editedBy    : string;
}


export interface ItemDoc {
  title     : string;
  questions : string[];
  answer    : string;
  level     : number;
  tags      : string[];
  author    : string;
  editedBy ?: string;
}


export const repositoryScheme = AvroType.forSchema({
  type: 'array', items: [
    {
      type: 'record',
      name: 'RepoItem',
      fields: [
        { name: 'answer'      , type: 'string' },
        { name: 'ids'         , type: { type: 'array', items: 'string'}},
        { name: 'tags'        , type: { type: 'array', items: 'string'}},
        { name: 'authors'     , type: { type: 'array', items: 'string'}},
        { name: 'level'       , type: 'int' },
        { name: 'dateCreated' , type: 'long' },
        { name: 'dateEdited'  , type: 'long' },
        { name: 'editedBy'    , type: 'string' }
      ]
    }
  ]
});


export enum RepErrorCode {
  EMPTY,
  INVALID,
  MISSHEAD,
  MISSTITLE,
  INVALIDQ,
  MISSA,
  MISSAUTHOR,
  MISSLEVEL,
  IDENTICALQ,
}



export class Repository {
  private _items: RepoItem[];
  private _contemplate: Contemplator;

  /**
   * Gets or sets repository items. Setting this value is **destructive**.
   * *Do not set this value manually unless you know what you're doing.*
   */
  get items() {
    return this._items.slice();
  }
  set items(val: RepoItem[]) {
    this._items = val;
  }

  get contemplate() {
    return this._contemplate;
  }


  constructor(private _fileOps: FileOps,
              private _dict: Dictionary,
              private _path: string)
  {
    if (!existsSync(_path))
      throw Error(`Path to repository: "${_path}" does NOT exist.`)
    ;
    this._items       = _fileOps.readRepoStore(_path);
    this._contemplate = new Contemplator(_dict);
    this.items;
  }



  getItem(hash: string) {
    return this._items.find(r => ~r.ids.indexOf(hash));
  }


  findQuestion(question: string) {
    const qTokens = question.split(' ');
    if (!this._contemplate.isQuery(qTokens))
      return RepErrorCode.INVALIDQ
    ;
    const id = this._contemplate.encodeQuery(qTokens, false)!;
    return this.getItem(id);
  }


  indexOfItem(hash: string) {
    for (let i = 0, l = this._items.length; i < l; i++) {
      if (~this._items[i].ids.indexOf(hash)) {
        return i;
      }
    }
    return -1;
  }


  editItem(oldHash: string, editedItem: RepoItem) {
    const itemIndex = this.indexOfItem(oldHash);
    if (~itemIndex) {
      this._items[itemIndex] = editedItem;
      return true;
    }
    return false;
  }


  addItemDoc(itemDoc: string): RepErrorCode|null {
    const parsedDoc = this.parseItemDoc(itemDoc);
    if (typeof parsedDoc == 'number') return parsedDoc
    ;
    const ids = this.encodeQuestions(parsedDoc.questions);
    if (!Array.isArray(ids))
      return ids
    ;
    this._items.push({
      answer      : parsedDoc.answer,
      ids,
      authors     : [parsedDoc.author],
      tags        : parsedDoc.tags,
      level       : parsedDoc.level,
      dateCreated : Date.now(),
      dateEdited  : Date.now(),
      editedBy    : parsedDoc.author
    })
    ;
    return null;
  }


  parseItemDoc(rawDoc: string): RepErrorCode | ItemDoc {
    const doc = rawDoc.trim();
    const matchInvalid = /[^a-z\u0020'(\n|\r)]+/g
    ;
    if (!doc)                   return RepErrorCode.EMPTY;
    if (!frontMatter.test(doc)) return RepErrorCode.MISSHEAD
    ;
    const itemDoc = this.getFrontMatter(doc);
    if (!itemDoc) return RepErrorCode.INVALID
    ;
    const answer = itemDoc.body.trim();
    const { questions, title, tags, author, level } = itemDoc.attributes;
    const hasValidQs = (
      !!questions
      && Array.isArray(questions)
      && !questions.find(v => v.match(matchInvalid))
    );
    if (!hasValidQs)        return RepErrorCode.INVALIDQ;
    if (!title)             return RepErrorCode.MISSTITLE;
    if (!author)            return RepErrorCode.MISSAUTHOR;
    if (!answer)            return RepErrorCode.MISSA;
    if (level == undefined) return RepErrorCode.MISSLEVEL
    ;
    return {
      title,
      questions: itemDoc.attributes.questions,
      author,
      tags: tags || [],
      level,
      answer,
    };
  }


  getFrontMatter(doc: string): FrontMatterResult<ItemDoc>|undefined {
    try { return frontMatter<ItemDoc>(doc); }
    catch (err) { return undefined; }
  }


  save() {
    return this._fileOps.save(this._path, repositoryScheme, this._items, true);
  }

  checkIntegrity() {
    const items = this.items.slice();
    while (items.length) {
      const id = items[0].ids.splice(0, 1)[0];
      const failedItem = items.find(v => v.ids.includes(id));
      if (failedItem) return failedItem;
      if (!items[0].ids.length) items.splice(0, 1);
    }
    return null;
  }


  encodeQuestions(questions: string[]): RepErrorCode|string[]  {
    const hashes: string[] = [];
    for (let i = 0, l = questions.length; i < l; i++) {
      const q = questions[i];
      const hash = this._contemplate.encodeQuery(q.split(' '));
      if (!hash) return RepErrorCode.INVALIDQ
      ;
      const hashIndex = hashes.indexOf(hash);
      if (~hashIndex) {
        // Get original question index.
        // const qIndex = questions.length - 1 - hashIndex;
        return RepErrorCode.IDENTICALQ;
      }
      hashes.push(hash);
    }
    return hashes;
  }

  // whiteSpaceStrat(doc: string) {
  //   if (!doc.includes('\n')) return undefined;
  //   return doc.includes('\r') ? '\r\n' : '\n';
  // }



}