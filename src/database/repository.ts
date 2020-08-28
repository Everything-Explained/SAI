import { FileOps } from "../core/file-ops";
import { Type as AvroType } from 'avsc';
import { existsSync } from "fs";
import { Contemplator } from "../core/contemplator";
import { Dictionary } from "./dictionary";


export interface RepoItem {
  questions: string[];
  answer: string;
  hashes: number[];
  tags: string[];
  authors: string[];
  level: number;
  dateCreated: number;
  dateEdited: number;
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



export class Repository {
  private items: RepoItem[];
  private contemplate: Contemplator;

  /**
   * Gets or sets repository items. Setting this value is **destructive**.
   * *Do not set this value manually unless you know what you're doing.*
   */
  get itemList() {
    return this.items.slice();
  }
  set itemList(val: RepoItem[]) {
    this.items = val;
  }

  get contemplatorInstance() {
    return this.contemplate;
  }


  constructor(private fileOps: FileOps, private dict: Dictionary, path: string) {
    if (!existsSync(path))
      throw Error(`Path to repository: "${path}" does NOT exist.`)
    ;
    this.items = fileOps.readRepoStore(path);
    this.contemplate = new Contemplator(dict);
    this.itemList;
  }


  findItem(hash: number) {
    return this.items.find(r => ~r.hashes.indexOf(hash));
  }

  addDocItem(itemDoc: string): Error|null {
    const parsedDoc = this.parseItemDoc(itemDoc);
    if (!Array.isArray(parsedDoc)) return parsedDoc
    ;
    const [questions, answer] = parsedDoc;
    const hashes = this.hashQuestions(questions);
    if (!Array.isArray(hashes))
      return hashes
    ;
    this.items.push({
      questions,
      answer,
      hashes,
      authors: [],
      tags: [],
      level: 0,
      dateCreated: Date.now(),
      dateEdited: Date.now()
    });
    return null;
  }

  parseItemDoc(itemDoc: string): Error | [string[], string] {
    const doc = itemDoc.trim();
    const crlf = this.whiteSpaceStrat(doc);
    const separator = `/@\\`;
    const matchInvalid = /[^a-z\u0020'(\n|\r)]+/g
    ;
    if (!doc)                  return Error('Empty Document.');
    if (!crlf)                 return Error('Invalid Document.');
    if (!~doc.indexOf('/@\\')) return Error('Separator is missing.')
    ;
    const [q, ans] = doc.split(separator, 2).map(v => v.trim());
    if (!q || !ans)            return Error('Missing question or answer blocks.');
    if (q.match(matchInvalid)) return Error('Questions contain Invalid chars.')
    ;
    return [q.split(crlf).map(q => q.trim()), ans];
  }

  whiteSpaceStrat(doc: string) {
    if (!doc.includes('\n')) return undefined;
    return doc.includes('\r') ? '\r\n' : '\n';
  }

  hashQuestions(questions: string[]): Error|number[]  {
    const hashes: number[] = [];
    for (let i = 0, l = questions.length; i < l; i++) {
      const q = questions[i];
      const hash = this.contemplate.queryToHash(q.split(' '));
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