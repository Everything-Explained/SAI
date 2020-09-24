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
  Empty,       // ItemDoc is empty
  Head,        // Missing or Invalid
  HeadSyntax,  // Syntax error in front matter header
  Title,       // Missing
  Question,    // Missing or Invalid
  Answer,      // Missing
  Author,      // Missing
  Level,       // Missing or < 0
  DuplicateId, // Two or more questions have duplicate ID
  EditId,      // Missing
  BadEditId,   // Question to edit was not found
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

  /**
   * Gets or sets repository path. Setting this value is **destructive**.
   * *Do not set this value manually unless you know what you're doing.*
   */
  get path() {
    return this._path;
  }
  set path(val: string) {
    this._path = val;
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
  editItem(itemDoc: string) {
    const item = this.toRepoItem(itemDoc);
    if (typeof item == 'number') return item;
    if (!item.editId) return RepErrorCode.EditId
    ;
    const itemIndex = this.indexOfItem(item.editId);
    if (!~itemIndex) return RepErrorCode.BadEditId
    ;
    const authors   = this._items[itemIndex].authors;
    const hasAuthor = authors.includes(item.authors[0]);
    item.authors =
      hasAuthor
        ? authors.slice()
        : [...authors, item.authors[0]]
    ;
    item.dateCreated = this._items[itemIndex].dateCreated;
    item.dateEdited  = Date.now();
    delete item.editId
    ;
    return (this._items[itemIndex] = item);
  }


  /**
   * Adds an item based on the item document string
   * provided.
   */
  addItem(itemDoc: string): RepErrorCode|RepoItem {
    const item = this.toRepoItem(itemDoc);
    if (typeof item == 'number') return item
    ;
    const dateNow = Date.now();
    item.dateCreated = dateNow;
    item.dateEdited = dateNow;
    delete item.editId;
    this._items.push(item)
    ;
    return item;
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
    if (!itemDoc) return RepErrorCode.HeadSyntax
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


  save(limit = true) {
    return this._fileOps.save(this._path, repositoryScheme, this._items, limit);
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


  encodeQuestions(questions: string[])  {
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