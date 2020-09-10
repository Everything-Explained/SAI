import { FileOps } from "../core/file-ops";
import { Type as AvroType } from 'avsc';
import { existsSync } from "fs";
import { Contemplator } from "../core/contemplator";
import { Dictionary } from "./dictionary";
import frontMatter, { FrontMatterResult } from 'front-matter';


export interface RepoItem {
  questions   : string[];
  answer      : string;
  hashes      : number[];
  tags        : string[];
  authors     : string[];
  level       : number;
  dateCreated : number;
  dateEdited  : number;
}

export interface ItemDoc {
  title: string;
  questions: string[];
  level: number;
  tags: string[];
  author: string;
}



export const repositoryScheme = AvroType.forSchema({
  type: 'array', items: [
    {
      type: 'record',
      name: 'RepoItem',
      fields: [
        { name: 'questions'   , type: { type: 'array', items: 'string'}},
        { name: 'answer'      , type: 'string' },
        { name: 'hashes'      , type: { type: 'array', items: 'int'}},
        { name: 'tags'        , type: { type: 'array', items: 'string'}},
        { name: 'authors'     , type: { type: 'array', items: 'string'}},
        { name: 'level'       , type: 'int' },
        { name: 'dateCreated' , type: 'long' },
        { name: 'dateEdited'  , type: 'long' },
      ]
    }
  ]
});


export enum DocErrorCode {
  EMPTY,
  INVALID,
  MISSHEAD,
  MISSQ,
  MISSA,
  INVCHARINQ,
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
    this._items = _fileOps.readRepoStore(_path);
    this._contemplate = new Contemplator(_dict);
    this.items;
  }


  getItem(hash: number) {
    return this._items.find(r => ~r.hashes.indexOf(hash));
  }

  indexOfItem(hash: number) {
    for (let i = 0, l = this._items.length; i < l; i++) {
      if (~this._items[i].hashes.indexOf(hash)) {
        return i;
      }
    }
    return -1;
  }

  editItem(oldHash: number, editedItem: RepoItem) {
    const itemIndex = this.indexOfItem(oldHash);
    if (~itemIndex) {
      this._items[itemIndex] = editedItem;
      return true;
    }
    return false;
  }

  addDocItem(itemDoc: string, author: string): Error|null {
    const parsedDoc = this.parseItemDoc(itemDoc);
    if (!Array.isArray(parsedDoc)) return parsedDoc
    ;
    const [questions, answer] = parsedDoc;
    const hashes = this.hashQuestions(questions);
    if (!Array.isArray(hashes))
      return hashes
    ;
    this._items.push({
      questions,
      answer,
      hashes,
      authors: [author],
      tags: [],
      level: 0,
      dateCreated: Date.now(),
      dateEdited: Date.now()
    });
    return null;
  }

  parseItemDoc(rawDoc: string): DocErrorCode | [string[], string] {
    const doc = rawDoc.trim();
    const matchInvalid = /[^a-z\u0020'(\n|\r)]+/g
    ;
    if (!doc)                   return DocErrorCode.EMPTY;
    if (!frontMatter.test(doc)) return DocErrorCode.MISSHEAD
    ;
    const itemDoc = this.getFrontMatter(doc);
    if (!itemDoc) return DocErrorCode.INVALID
    ;
    const answer = itemDoc.body.trim();
    const { questions, title, tags, author } = itemDoc.attributes;
    const hasInvalidQuestion =
      questions ? questions.find(v => v.match(matchInvalid)) : undefined
    ;
    if (!questions)         return DocErrorCode.MISSQ;
    if (!answer)            return DocErrorCode.MISSA;
    if (hasInvalidQuestion) return DocErrorCode.INVCHARINQ
    ;
    return [itemDoc.attributes.questions, itemDoc.body];
  }

  getFrontMatter(doc: string): FrontMatterResult<ItemDoc>|undefined {
    try { return frontMatter<ItemDoc>(doc); }
    catch (err) { return undefined; }
  }

  save() {
    return this._fileOps.save(this._path, repositoryScheme, this._items, true);
  }

  whiteSpaceStrat(doc: string) {
    if (!doc.includes('\n')) return undefined;
    return doc.includes('\r') ? '\r\n' : '\n';
  }

  hashQuestions(questions: string[]): Error|number[]  {
    const hashes: number[] = [];
    for (let i = 0, l = questions.length; i < l; i++) {
      const q = questions[i];
      const hash = this._contemplate.queryToHash(q.split(' '));
      if (!hash) return Error(`"${q}" is Invalid.`)
      ;
      const hashIndex = hashes.indexOf(hash);
      if (~hashIndex) {
        // Get original question index.
        const qIndex = questions.length - 1 - hashIndex;
        return Error(
          `Question: "${questions[i]}" is identical to "${questions[qIndex]}"`
        );
      }
      hashes.push(hash);
    }
    return hashes;
  }



}