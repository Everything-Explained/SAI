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
  get list() {
    return this.replies.slice();
  }
  set list(val: Reply[]) {
    this.replies = val;
  }

  get brainInstance() {
    return this.brain;
  }


  constructor(private fileOps: FileOps, private dict: Dictionary, path: string) {
    if (!existsSync(path))
      throw Error(`Path to replies: "${path}" does NOT exist.`)
    ;
    this.replies = fileOps.readReplyStore(path);
    this.brain = new Brain(dict);
    this.list;
  }


  findReply(hash: number) {
    return this.replies.find(r => ~r.hashes.indexOf(hash));
  }

  addDocReply(replyDoc: string): Error|null {
    const parsedDoc = this.parseReplyDoc(replyDoc);
    if (!Array.isArray(parsedDoc)) return parsedDoc
    ;
    const [questions, answer] = parsedDoc;
    const hashes = this.hashQuestions(questions);
    if (!Array.isArray(hashes))
      return hashes
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
    const separator = `/@\\`;
    const matchInvalid = /[^a-z\u0020'(\n|\r)]+/g
    ;
    if (!doc)                  return Error('Empty Document.');
    if (!crlf)                 return Error('Invalid Document.');
    if (!~doc.indexOf('/@\\')) return Error('Separator is missing.')
    ;
    const [q, ans] = doc.split(separator).map(v => v.trim());
    if (!q || !ans)            return Error('Missing question or answer blocks.');
    if (q.match(matchInvalid)) return Error('Questions contain Invalid chars.')
    ;
    return [q.split(crlf).map(q => q.trim()), ans];
  }

  getWhitespaceStrategy(doc: string) {
    if (!doc.includes('\n')) return undefined;
    return doc.includes('\r') ? '\r\n' : '\n';
  }


  hashQuestions(questions: string[]): Error|number[]  {
    const hashes: number[] = [];
    for (let i = 0, l = questions.length; i < l; i++) {
      const q = questions[i];
      const hash = this.brain.queryToHash(q.split(' '));
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