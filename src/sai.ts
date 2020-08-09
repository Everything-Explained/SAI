import { join as joinPath } from 'path';
import { cloneDeep as _cloneDeep,
         pullAt    as _pullAt,
         flatten   as _flatten,
         flow      as _flow } from 'lodash/fp'
;
import { createGzipFile, createFolder, readReplyStore, readDictStore } from './file-ops';
import { Replies } from './types';
import { dictSchema, replySchema } from './schema';


export default class SAI {

  #dataFolder : string;
  #repliesPath: string;
  #dictPath   : string;
  #replies    : Replies;
  #words      : string[][];


  constructor(dataFolderPath: string) {
    this.#dataFolder  = dataFolderPath;
    this.#repliesPath = `${dataFolderPath}/replies.said`;
    this.#dictPath    = `${dataFolderPath}/dictionary.said`;

    createFolder(dataFolderPath);
    createGzipFile(this.#repliesPath, replySchema.toBuffer({ replies: [] }));
    createGzipFile(this.#dictPath, dictSchema.toBuffer({ words: [] }));

    this.#replies = readReplyStore(this.#repliesPath, replySchema);
    this.#words   = readDictStore(this.#dictPath, dictSchema);

    console.log(this.#replies);
    console.log(this.#words);
  }


}





