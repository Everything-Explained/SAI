import { DictionaryManager } from "../database/dictionaryman";
import { Constants } from "../variables/constants";
import { flow as _flow } from 'lodash/fp';



export class QueryProcessor {

  private processorFuncs = [
    this.filterContractions,
    this.trimUnknownChars,
    this.applyQueryCode,
    this.applyContextCodes,
    this.applyDictionaryCodes(this.dict),
    this.trimOptional,
    this.toBase64WithPipe
  ]

  constructor(private dict: DictionaryManager) {}


  /** Converts a tokenized query (question) into a unique id. */
  toQueryId(queryTokens: string[], checkQuery = true): string|undefined {
    if (checkQuery && !this.isQuery(queryTokens)) return undefined;
    return _flow(...this.processorFuncs)(queryTokens);
  }

  /** Decodes a query id into a relative form of its original tokens. */
  toQueryTokens(id: string) {
    const tokens = this._fromIdToTokens(id);
    return (
      tokens.map((t, i) => {
        if (~t.indexOf('%')) return Constants.contextTokens[+t.substr(1)];
        if (~t.indexOf('&')) return this.dict.words[+t.substr(1)][0];
        if          (i == 0) return Constants.queryTokens[t.charCodeAt(0) - 65];
        return t;
      })
      .join(' ')
    );
  }


  partialEncodeQuery(tokens: string[]) {
    return _flow(...this.processorFuncs.slice(0, -1))(tokens);
  }


  isQuery(queryTokens: string[]) {
    if (queryTokens.length < 2 || !queryTokens[0].trim())
      return false
    ;
    const queryToken = this.filterContractions([queryTokens[0], queryTokens[1]])[0];
    return !!~Constants.queryTokens.indexOf(queryToken);
  }

  /**
   * Replace all contractions with their word counterparts
   * (ex: `can't => can not`)
   */
  filterContractions(queryTokens: string[]) {
    // First token is always a query word.
    queryTokens[0] = queryTokens[0].replace(/'s/g, ' is');
    const queryTokenStr = queryTokens.join(' ');
    return Constants.contractionMatrix.reduce(
      (queryStr, matrix) => (queryStr.replace(matrix[0], matrix[1])),
      queryTokenStr
    ).split(' ');
  }

  /** Filters characters that don't belong in a query. */
  trimUnknownChars(queryTokens: string[]) {
    return queryTokens.map(v => v.replace(Constants.matchInvalidChars, ''));
  }

  /** Replaces the query word with a unique uppercase character. */
  applyQueryCode(queryTokens: string[]) {
    const index = Constants.queryTokens.indexOf(queryTokens[0]);
    return (
      ~index
        ? [String.fromCharCode(65 + index), ...queryTokens.slice(1)]
        : queryTokens.slice()
    );
  }

  /** Removes optional words from a query. */
  trimOptional(queryTokens: string[]) {
    return queryTokens.filter(token => !~Constants.optionalTokens.indexOf(token));
  }

  /** Replaces all contextual words with a unique code. */
  applyContextCodes(queryTokens: string[]) {
    return queryTokens.map(token => {
      const index = Constants.contextTokens.indexOf(token);
      return (
        ~index
          ? (index < 10) ? `%0${index}` : `%${index}`
          : token
      );
    });
  }

  /** Replaces all `dictionary` words with a unique code */
  applyDictionaryCodes(dictionary: DictionaryManager) {
    return (tokens: string[]) => {
      return tokens.map(token => dictionary.encodeWord(token));
    };
  }


  toBase64WithPipe(tokens: string[]) {
    return Buffer.from(tokens.join('|')).toString('base64');
  }


  /** Decodes a query id back to its original tokens. */
  private _fromIdToTokens(id: string) {
    return (
      Buffer
        .from(id, 'base64')
        .toString('utf-8')
        .split('|')
    );
  }
}



