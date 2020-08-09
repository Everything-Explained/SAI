export type Replies = IReply[];

export interface IReply {
  questions: string[];
  answer: string;
  hashes: string[];
  dateCreated: number;
  dateEdited: number;
}