import { FileOps } from "../core/file-ops";
import { schema, Type as AvroType } from 'avsc';
import { existsSync } from "fs";
import { QueryProcessor } from "../core/query-processor";
import { ParityManager } from "./parity_manager";
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

export interface InquiryRecord extends Inquiry, schema.RecordReturnType<Inquiry> {}


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
      name: 'InquiryRecord',
      fields: [
        { name: 'title'       , type: 'string' },
        { name: 'ids'         , type: { type: 'array', items: 'string'}},
        { name: 'answer'      , type: 'string' },
        { name: 'authors'     , type: { type: 'array', items: 'string'}},
        { name: 'editedBy'    , type: 'string' },
        { name: 'level'       , type: 'int' },
        { name: 'tags'        , type: { type: 'array', items: 'string'}},
        { name: 'dateCreated' , type: 'long' },
        { name: 'dateEdited'  , type: 'long' },
      ]
    }
  ]
});


export enum InqErrorCode {
  Empty,       // InquiryDoc is empty
  Head,        // Missing or Invalid
  HeadSyntax,  // Syntax error in front matter header
  Title,       // Missing
  Question,    // Missing or Invalid
  Answer,      // Missing
  Author,      // Missing
  Level,       // Missing or < 0
  DuplicateId, // Two or more questions have duplicate ID
  EditId,      // Missing
  BadEditId,   // Inquiry to edit was not found
}



export class InquiryManager {
  private _inquiries: Inquiry[];
  private _queryProc: QueryProcessor;

  /**
   * Setting this value manually is **destructive**.
   * *Do not set this value unless you know what you're doing.*
   */
  get inquiries() {
    return this._inquiries.slice();
  }
  set inquiries(val: Inquiry[]) {
    this._inquiries = val;
  }

  get queryProcessor() {
    return this._queryProc;
  }

  get questions() {
    return this._inquiries.map(inquiry => {
      return inquiry.ids.map(id => this._queryProc.decodeIdToQuery(id));
    });
  }

  /**
   * Setting this value manually is **destructive**.
   * *Do not set this value unless you know what you're doing.*
   */
  get path() {
    return this._path;
  }
  set path(val: string) {
    this._path = val;
  }


  constructor(private _fileOps: FileOps,
              private _parityMngr: ParityManager,
              private _path: string)
  {
    if (!existsSync(_path))
      throw Error(`Path to inquiries: "${_path}" does NOT exist.`)
    ;
    this._inquiries   = _fileOps.readInquiryStore(_path);
    this._queryProc = new QueryProcessor(_parityMngr);
    this.inquiries;
  }



  getInquiryById(id: string) {
    return this._inquiries.find(r => r.ids.includes(id));
  }


  getInquiryByQuestion(question: string) {
    if (!this._queryProc.isValidQuery(question))
      return InqErrorCode.Question
    ;
    const id = this._queryProc.encodeQueryToId(question, false)!;
    return this.getInquiryById(id);
  }


  indexOf(id: string) {
    for (let i = 0, l = this._inquiries.length; i < l; i++) {
      if (~this._inquiries[i].ids.indexOf(id)) {
        return i;
      }
    }
    return -1;
  }


  getQuestionsFrom(inquiry: Inquiry) {
    return inquiry.ids.map(id => this._queryProc.decodeIdToQuery(id));
  }


  /**
   * Edits an Inquiry based on the inquiry document string
   * provided. _Make sure to include the_ `editId`
   * _field in the front matter._
   */
  editInquiry(inquiryDoc: string|Inquiry) {
    const newInquiry =
      typeof inquiryDoc == 'string'
        ? this.getInquiryFrom(inquiryDoc)
        : inquiryDoc
    ;
    if (typeof newInquiry == 'number') return newInquiry;
    if (!newInquiry.editId) return InqErrorCode.EditId
    ;
    const oldInquiryIndex = this.indexOf(newInquiry.editId);
    const oldInquiry      = this._inquiries[oldInquiryIndex];
    if (!oldInquiry) return InqErrorCode.BadEditId
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


  addInquiry(inquiryDoc: string): InqErrorCode|Inquiry {
    const inquiry = this.getInquiryFrom(inquiryDoc);
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


  getInquiryFrom(inquiryDoc: string): InqErrorCode | Inquiry {
    const doc          = inquiryDoc.trim();
    const matchInvalid = /[^a-z\u0020'(\n|\r)]+/g
    ;
    if (!doc)                   return InqErrorCode.Empty;
    if (!frontMatter.test(doc)) return InqErrorCode.Head
    ;
    const docFrontMatter = this._getFrontMatter(doc);
    if (!docFrontMatter) return InqErrorCode.HeadSyntax
    ;
    const answer = docFrontMatter.body.trim();
    const { questions, title, tags, author, level, editId } = docFrontMatter.attributes;
    const hasValidQs = (
      !!questions
      && Array.isArray(questions)
      && !questions.find(v => v.match(matchInvalid))
    );
    if (!hasValidQs)        return InqErrorCode.Question;
    if (!title)             return InqErrorCode.Title;
    if (!author)            return InqErrorCode.Author;
    if (!answer)            return InqErrorCode.Answer;
    if ( level == undefined
      || level < 0)         return InqErrorCode.Level
    ;
    const ids = this.encodeQuestions(questions);
    if (!Array.isArray(ids)) return ids
    ;
    const inquiryObj = {
      title,
      ids,
      authors: [author],
      tags: tags ?? [],
      level,
      answer,
      dateCreated: 0,
      dateEdited: 0,
      editedBy: author,
    } as Inquiry;
    if (editId) inquiryObj.editId = editId;
    return inquiryObj;
  }


  getInquiryDocFrom(inquiry: Inquiry) {
    const questions =
      inquiry.ids.map(id => `- ${this.queryProcessor.decodeIdToQuery(id)}`)
    ;
    const frontMatter =
`---
title: ${inquiry.title}
questions:
${questions.join('\n')}
author: ${inquiry.authors[0]}
level: ${inquiry.level}
editId: ${inquiry.ids[0]}
---
${inquiry.answer}`
    ;
    return frontMatter;
  }


  private _getFrontMatter(doc: string): FrontMatterResult<InquiryDocObj>|undefined {
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
      const failedInquiry = inquiries.find(v => v.ids.includes(id));
      if (failedInquiry) return failedInquiry;
      if (!inquiries[0].ids.length) inquiries.splice(0, 1);
    }
    return null;
  }


  encodeQuestions(questions: string[])  {
    const ids: string[] = [];
    for (let i = 0, l = questions.length; i < l; i++) {
      const q = questions[i];
      const id = this._queryProc.encodeQueryToId(q);
      if (!id) return InqErrorCode.Question
      ;
      const idIndex = ids.indexOf(id);
      if (~idIndex) {
        // Get original question index.
        // const qIndex = questions.length - 1 - hashIndex;
        return InqErrorCode.DuplicateId;
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