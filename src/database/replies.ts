import { FileOps } from "../core/file-ops";
import { Type as AvroType } from 'avsc';
import { existsSync } from "fs";



export interface Reply {
  questions: string[];
  answer: string;
  hashes: string[];
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


  constructor(private fileOps: FileOps, path: string) {
    if (!existsSync(path))
      throw Error(`Path to dictionary: "${path}" does NOT exist.`)
    ;
    this.replies = fileOps.readReplyStore(path);
  }


  findReply(hash: string) {
    return this.replies.find(r => ~r.hashes.indexOf(hash));
  }

  findHashPosition(hash: string): [number, number] | undefined {
    for (let i = 0, l = this.replies.length; i < l; i++) {
      const hashPos = this.replies[i].hashes.indexOf(hash);
      if (~hashPos) return [i, hashPos];
    }
    return undefined;
  }
}