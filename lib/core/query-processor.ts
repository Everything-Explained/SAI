import { ParityManager } from "../database/parity_manager";
import { Constants } from "../variables/constants";
import { flow as _flow } from 'lodash/fp';
import { padNumber } from "./utils";



export class QueryProcessor {

  private processorFuncs = [
    this.filterContractions,
    this.trimUnknownChars,
    this.applyQuestionCode,
    this.applyContextCodes,
    this.applyDictionaryCodes(this.dict),
    this.trimOptionalWords,
    this.convertWordsToId
  ]

  constructor(private dict: ParityManager) {}


  encodeQueryToId(query: string, checkQuery = true): string|undefined {
    const words = query.split(' ');
    if (checkQuery && !this.isValidQuery(words)) return undefined;
    return _flow(...this.processorFuncs)(words);
  }

  /** Decodes a query id into a **relative form** of its original query. */
  decodeIdToQuery(id: string) {
    const words = this.convertIdToRawWords(id);
    return (
      words.map((t, i) => {
        if (t.includes('%')) return Constants.contextWords[+t.substr(1)];
        if (t.includes('&')) return this.dict.words[+t.substr(1)][0];
        if          (i == 0) return Constants.questionWords[t.charCodeAt(0) - 65];
        return t;
      })
      .join(' ')
    );
  }


  partialEncodeQuery(words: string[]) {
    return _flow(...this.processorFuncs.slice(0, -1))(words);
  }


  isValidQuery(query: string|string[]) {
    const queryWords =
      (typeof query == 'string') ? query.split(' ') : query
    ;
    if (queryWords.length < 2 || !queryWords[0].trim())
      return false
    ;
    const queryWord = this.filterContractions([queryWords[0]])[0];
    return Constants.questionWords.includes(queryWord);
  }

  /**
   * Replace all contractions with their word counterparts
   * (ex: `can't => can not`)
   */
  filterContractions(words: string[]) {
    // First word is always a question word.
    words[0] = words[0].replace(/'s/g, ' is');
    const queryTokenStr = words.join(' ');
    return Constants.contractionMatrix.reduce(
      (queryStr, matrix) => (queryStr.replace(matrix[0], matrix[1])),
      queryTokenStr
    ).split(' ');
  }

  /** Filters characters that don't belong in a query. */
  trimUnknownChars(words: string[]) {
    return words.map(v => v.replace(Constants.matchInvalidChars, ''));
  }

  /** Replaces the question word with a unique uppercase character. */
  applyQuestionCode(words: string[]) {
    const index = Constants.questionWords.indexOf(words.shift()!);
    return (
      ~index
        ? [String.fromCharCode(65 + index), ...words]
        : words.slice()
    );
  }


  /** Removes optional words from a query. */
  trimOptionalWords(words: string[]) {
    return words.filter(token => !~Constants.optionalWords.indexOf(token));
  }


  /** Replaces all contextual words with a unique code. */
  applyContextCodes(words: string[]) {
    return words.map(token => {
      const index = Constants.contextWords.indexOf(token);
      return ~index ? `%${padNumber(index)}` : token;
    });
  }


  /** Replaces all `dictionary` words with a unique code */
  applyDictionaryCodes(dictionary: ParityManager) {
    return (words: string[]) => {
      return words.map(word => {
        const pos = dictionary.findWordPosition(word);
        return pos ? `&${padNumber(pos[0])}` : word;
      });
    };
  }


  convertWordsToId(words: string[]) {
    return Buffer.from(words.join('|')).toString('base64');
  }


  /** Converts a query id back to its encoded word array. */
  convertIdToRawWords(id: string) {
    return (
      Buffer
        .from(id, 'base64')
        .toString('utf-8')
        .split('|')
    );
  }


}



