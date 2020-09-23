import { FileOps } from "../core/file-ops";
import { Type as AvroType } from 'avsc';
import { existsSync } from "fs";
import { Contemplator } from "../core/contemplator";
import { Dictionary } from "./dictionary";
import frontMatter, { FrontMatterResult } from 'front-matter';


export interface RepoItem {
  title       : string;
  answer      : string;
  ids         : string[];
  tags        : string[];
  authors     : string[];
  level       : number;
  dateCreated : number;
  dateEdited  : number;
  editedBy    : string;
  editId     ?: string;
}


export interface ItemDoc {
  title     : string;
  questions : string[];
  answer    : string;
  level     : number;
  tags      : string[];
  author    : string;
  editedBy ?: string;
  editId   ?: string;
}


export const repositoryScheme = AvroType.forSchema({
  type: 'array', items: [
    {
      type: 'record',
      name: 'RepoItem',
      fields: [
        { name: 'title'       , type: 'string' },
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
  Empty,
  Invalid,
  Head,
  Title,
  Question,
  Answer,
  Author,
  Level,
  DuplicateId, // Question created duplicate id
  EditId,
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



  /**
   * Retrieves a repository item by `id`; or _undefined_
   * if the `id` is not found.
   */
  getItem(id: string) {
    return this._items.find(r => ~r.ids.indexOf(id));
  }


  findQuestion(question: string) {
    const qTokens = question.split(' ');
    if (!this._contemplate.isQuery(qTokens))
      return RepErrorCode.Question
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


  /**
   * Edits an item based on the item document string
   * provided. _Make sure to include the_ `editId`
   * _field in the front matter._
   */
  editItem(itemDoc: string): RepErrorCode|boolean {
    const doc = this.toRepoItem(itemDoc);
    if (typeof doc == 'number') return doc;
    if (!doc.editId) return RepErrorCode.EditId
    ;
    const itemIndex = this.indexOfItem(doc.editId);
    if (!~itemIndex) return false
    ;
    const authors   = this._items[itemIndex].authors;
    const hasAuthor = authors.includes(doc.authors[0]);
    doc.authors =
      hasAuthor
        ? authors.slice()
        : [...authors, doc.authors[0]]
    ;
    doc.dateCreated = this._items[itemIndex].dateCreated;
    doc.dateEdited  = Date.now();
    delete doc.editId
    ;
    return !!(this._items[itemIndex] = doc);
  }


  /**
   * Adds an item based on the item document string
   * provided.
   */
  addItem(itemDoc: string): RepErrorCode|null {
    const item = this.toRepoItem(itemDoc);
    if (typeof item == 'number') return item
    ;
    const dateNow = Date.now();
    item.dateCreated = dateNow;
    item.dateEdited = dateNow;
    delete item.editId;
    this._items.push(item)
    ;
    return null;
  }


  /**
   * Converts an item document string to a Repository
   * Item.
   */
  toRepoItem(rawDoc: string): RepErrorCode | RepoItem {
    const doc = rawDoc.trim();
    const matchInvalid = /[^a-z\u0020'(\n|\r)]+/g
    ;
    if (!doc)                   return RepErrorCode.Empty;
    if (!frontMatter.test(doc)) return RepErrorCode.Head
    ;
    const itemDoc = this.getFrontMatter(doc);
    if (!itemDoc) return RepErrorCode.Invalid
    ;
    const answer = itemDoc.body.trim();
    const { questions, title, tags, author, level, editId } = itemDoc.attributes;
    const hasValidQs = (
      !!questions
      && Array.isArray(questions)
      && !questions.find(v => v.match(matchInvalid))
    );
    if (!hasValidQs)        return RepErrorCode.Question;
    if (!title)             return RepErrorCode.Title;
    if (!author)            return RepErrorCode.Author;
    if (!answer)            return RepErrorCode.Answer;
    if ( level == undefined
      || level < 0)         return RepErrorCode.Level
    ;
    const ids = this.encodeQuestions(questions);
    if (!Array.isArray(ids)) return ids
    ;
    return {
      title,
      ids,
      authors: [author],
      tags: tags ?? [],
      level,
      answer,
      dateCreated: 0,
      dateEdited: 0,
      editedBy: author,
      editId,
    };
  }


  getFrontMatter(doc: string): FrontMatterResult<ItemDoc>|undefined {
    try { return frontMatter<ItemDoc>(doc); }
    catch (err) { return undefined; }
  }


  save() {
    return this._fileOps.save(this._path, repositoryScheme, this._items, true);
  }


  /**
   * Returns any items which contain duplicate ids, otherwise
   * it returns null.
   */
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
    const ids: string[] = [];
    for (let i = 0, l = questions.length; i < l; i++) {
      const q = questions[i];
      const id = this._contemplate.encodeQuery(q.split(' '));
      if (!id) return RepErrorCode.Question
      ;
      const codeIndex = ids.indexOf(id);
      if (~codeIndex) {
        // Get original question index.
        // const qIndex = questions.length - 1 - hashIndex;
        return RepErrorCode.DuplicateId;
      }
      ids.push(id);
    }
    return ids;
  }

  // whiteSpaceStrat(doc: string) {
  //   if (!doc.includes('\n')) return undefined;
  //   return doc.includes('\r') ? '\r\n' : '\n';
  // }



}