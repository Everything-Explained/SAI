import { FileOps } from "../core/file-ops";
import { Type as AvroType } from 'avsc';
import { existsSync } from "fs";
import { Brain } from "../core/brain";
import { Dictionary } from "./dictionary";



export interface Reply {
  questions: string[];
  answer: string;
  hashes: number[];
  dateCreated: number;
  dateEdited: number;
}



export const replySchema = AvroType.forSchema({
  name: 'replies',
  type: 'array', items: [
    {
      type: 'record',
      name: 'Reply',
      fields: [
        { name: 'questions', type: { type: 'array', items: 'string'}},
        { name: 'answer', type: 'string' },
        { name: 'hashes', type: { type: 'array', items: 'long'}},
        { name: 'dateCreated', type: 'long' },
        { name: 'dateEdited', type: 'long' },
      ]
    }
  ]
});



export class Replies {
  private replies: Reply[];
  private brain: Brain;

  /**
   * Gets or sets replies. Setting this value is **destructive**.
   * *Do not set this value manually unless you know what you're doing.*
   */
  get repliesList() {
    return this.replies.slice();
  }
  set repliesList(val: Reply[]) {
    this.replies = val;
  }


  constructor(private fileOps: FileOps, private dict: Dictionary, path: string) {
    if (!existsSync(path))
      throw Error(`Path to replies: "${path}" does NOT exist.`)
    ;
    this.replies = fileOps.readReplyStore(path);
    this.brain = new Brain(dict);
    this.repliesList;
  }


  findReply(hash: number) {
    return this.replies.find(r => ~r.hashes.indexOf(hash));
  }

  addDocReply(replyDoc: string): Error|null {
    const parsedDoc = this.parseReplyDoc(replyDoc);
    if (!Array.isArray(parsedDoc)) return parsedDoc
    ;
    const [questions, answer] = parsedDoc;
    const hashes = questions
      .map(q => this.brain.queryToHash(q.split(' ')))
      .filter(q => q != undefined) as number[]
    ;
    if (hashes.length < questions.length)
      return Error('One or more questions were invalid.')
    ;
    this.replies.push({
      questions,
      answer,
      hashes,
      dateCreated: Date.now(),
      dateEdited: Date.now()
    });
    return null;
  }

  parseReplyDoc(replyDoc: string): Error | [string[], string] {
    const doc = replyDoc.trim();
    const crlf = this.getWhitespaceStrategy(doc);
    const separator = `/@\\${crlf}`;
    const sepRegEx = /\n\/@\\(\r|\n)/g
    ;
    if (!doc)                 return Error('Empty Document.');
    if (!crlf)                return Error('Invalid Document.');
    if (!doc.match(sepRegEx)) return Error('Separator is missing or malformed.')
    ;
    const [q, ans] = doc.split(separator);
    if (!q || !ans)                 return Error('Missing questions or answer.');
    if (q.match(/[^a-z(\n|\r)]+/g)) return Error('Questions contain Invalid chars.')
    ;
    const qTokens =
      q.split(crlf)  // create question array
       .slice(0, -1) // remove empty index
    ;
    return [qTokens, ans];
  }

  getWhitespaceStrategy(doc: string) {
    if (!doc.includes('\n')) return undefined;
    return doc.includes('\r') ? '\r\n' : '\n';
  }



}