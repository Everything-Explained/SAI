import { FileOps } from "../core/file-ops";
import { Type as AvroType } from 'avsc';
import { existsSync } from "fs";
import { Contemplator } from "../core/contemplator";
import { DictionaryManager } from "./dictionaryman";
import frontMatter, { FrontMatterResult } from 'front-matter';


export interface Inquiry {
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


export interface InquiryDocObj {
  title     : string;
  questions : string[];
  answer    : string;
  level     : number;
  tags      : string[];
  author    : string;
  editedBy ?: string;
  editId   ?: string;
}


export const inquiryScheme = AvroType.forSchema({
  type: 'array', items: [
    {
      type: 'record',
      name: 'InquiryItem',
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


export enum IqErrorCode {
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



export class InquiryManager {
  private _inquiries: Inquiry[];
  private _contemplate: Contemplator;

  /**
   * Gets or sets repository items. Setting this value is **destructive**.
   * *Do not set this value manually unless you know what you're doing.*
   */
  get inquiries() {
    return this._inquiries.slice();
  }
  set inquiries(val: Inquiry[]) {
    this._inquiries = val;
  }

  get contemplate() {
    return this._contemplate;
  }

  get questions() {
    return this._inquiries.map(item => {
      return item.ids.map(id => this._contemplate.decode(id));
    });
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
              private _dict: DictionaryManager,
              private _path: string)
  {
    if (!existsSync(_path))
      throw Error(`Path to repository: "${_path}" does NOT exist.`)
    ;
    this._inquiries   = _fileOps.readRepoStore(_path);
    this._contemplate = new Contemplator(_dict);
    this.inquiries;
  }



  getInquiryById(id: string) {
    return this._inquiries.find(r => r.ids.includes(id));
  }


  getInquiryByQuestion(question: string) {
    const qTokens = question.split(' ');
    if (!this._contemplate.isQuery(qTokens))
      return IqErrorCode.Question
    ;
    const id = this._contemplate.encodeQuery(qTokens, false)!;
    return this.getInquiryById(id);
  }


  indexOfInquiry(id: string) {
    for (let i = 0, l = this._inquiries.length; i < l; i++) {
      if (~this._inquiries[i].ids.indexOf(id)) {
        return i;
      }
    }
    return -1;
  }


  questionsFromInquiry(inquiry: Inquiry) {
    return inquiry.ids.map(id => this._contemplate.decode(id));
  }


  /**
   * Edits an item based on the item document string
   * provided. _Make sure to include the_ `editId`
   * _field in the front matter._
   */
  editInquiry(inquiryDoc: string|Inquiry) {
    const newInquiry =
      typeof inquiryDoc == 'string'
        ? this.toInquiryItem(inquiryDoc)
        : inquiryDoc
    ;
    if (typeof newInquiry == 'number') return newInquiry;
    if (!newInquiry.editId) return IqErrorCode.EditId
    ;
    const oldInquiryIndex = this.indexOfInquiry(newInquiry.editId);
    const oldInquiry      = this._inquiries[oldInquiryIndex];
    if (!oldInquiry) return IqErrorCode.BadEditId
    ;
    const oldAuthors = oldInquiry.authors;
    const newAuthor  = newInquiry.authors[0];
    newInquiry.authors =
      oldAuthors.includes(newAuthor)
        ? [...oldAuthors]
        : [...oldAuthors, newAuthor]
    ;
    newInquiry.dateCreated = oldInquiry.dateCreated;
    newInquiry.dateEdited  = Date.now();
    // Only used to validate an ongoing edit
    delete newInquiry.editId
    ;
    return (this._inquiries[oldInquiryIndex] = newInquiry);
  }


  addInquiry(inquiryDoc: string): IqErrorCode|Inquiry {
    const inquiry = this.toInquiryItem(inquiryDoc);
    if (typeof inquiry == 'number') return inquiry;
    if (inquiry.editId) return this.editInquiry(inquiry)
    ;
    const dateNow = Date.now();
    inquiry.dateCreated = dateNow;
    inquiry.dateEdited = dateNow;
    this._inquiries.push(inquiry)
    ;
    return inquiry;
  }


  toInquiryItem(inquiryDoc: string): IqErrorCode | Inquiry {
    const doc          = inquiryDoc.trim();
    const matchInvalid = /[^a-z\u0020'(\n|\r)]+/g
    ;
    if (!doc)                   return IqErrorCode.Empty;
    if (!frontMatter.test(doc)) return IqErrorCode.Head
    ;
    const itemDoc = this.getFrontMatter(doc);
    if (!itemDoc) return IqErrorCode.HeadSyntax
    ;
    const answer = itemDoc.body.trim();
    const { questions, title, tags, author, level, editId } = itemDoc.attributes;
    const hasValidQs = (
      !!questions
      && Array.isArray(questions)
      && !questions.find(v => v.match(matchInvalid))
    );
    if (!hasValidQs)        return IqErrorCode.Question;
    if (!title)             return IqErrorCode.Title;
    if (!author)            return IqErrorCode.Author;
    if (!answer)            return IqErrorCode.Answer;
    if ( level == undefined
      || level < 0)         return IqErrorCode.Level
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


  toInquiryDoc(item: Inquiry) {
    const questions =
      item.ids.map(id => `- ${this.contemplate.decode(id)}`)
    ;
    const frontMatter =
`---
title: ${item.title}
questions:
${questions.join('\n')}
author: ${item.authors[0]}
level: ${item.level}
editId: ${item.ids[0]}
---
${item.answer}`
    ;
    return frontMatter;
  }


  getFrontMatter(doc: string): FrontMatterResult<InquiryDocObj>|undefined {
    try { return frontMatter<InquiryDocObj>(doc); }
    catch (err) { return undefined; }
  }


  save(limit = true) {
    return this._fileOps.save(this._path, inquiryScheme, this._inquiries, limit);
  }


  /**
   * Returns any inquiries which contain duplicate ids, otherwise
   * it returns null.
   */
  checkIntegrity() {
    const inquiries = this.inquiries.slice();
    while (inquiries.length) {
      const id = inquiries[0].ids.splice(0, 1)[0];
      const failedItem = inquiries.find(v => v.ids.includes(id));
      if (failedItem) return failedItem;
      if (!inquiries[0].ids.length) inquiries.splice(0, 1);
    }
    return null;
  }


  encodeQuestions(questions: string[])  {
    const ids: string[] = [];
    for (let i = 0, l = questions.length; i < l; i++) {
      const q = questions[i];
      const id = this._contemplate.encodeQuery(q.split(' '));
      if (!id) return IqErrorCode.Question
      ;
      const idIndex = ids.indexOf(id);
      if (~idIndex) {
        // Get original question index.
        // const qIndex = questions.length - 1 - hashIndex;
        return IqErrorCode.DuplicateId;
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