import { DictionaryManager } from "../database/dictionaryman";
import {
  contextTokens,
  contractionCorrections,
  matchInvalidChars,
  optionalTokens,
  queryTokens
} from "../variables/constants";
import { flow as _flow } from 'lodash/fp';



export class Contemplator {

  private queryProcessFuncs = [
    this.filterContractions,
    this.filterUnknown,
    this.setQueryCode,
    this.setContextCode,
    this.setDictCode(this.dict),
    this.stripOptional,
    this.toBase64WithPipe
  ]

  constructor(private dict: DictionaryManager) {}


  /**
   * Converts a tokenized question into a unique code.
   *
   * @param tokens An array of words that should make up a question.
   * @param checkQuery Skips token validation when **false**.
   */
  encodeQuery(tokens: string[], checkQuery = true): string|undefined {
    if (checkQuery && !this.isQuery(tokens)) return undefined;
    return _flow(...this.queryProcessFuncs)(tokens);
  }

  partialEncodeQuery(tokens: string[]) {
    return _flow(...this.queryProcessFuncs.slice(0, -1))(tokens);
  }

  /**
   * Validates an Array of tokens, that when combined, should
   * be in question-form. `(ex: what is love)`
   *
   * @param tokens An Array of tokens.
   */
  // TODO - Add stricter tests for blank input
  isQuery(tokens: string[]) {
    if (tokens.length < 2 || !tokens[0].trim())
      return false
    ;
    const queryToken = this.filterContractions([tokens[0], tokens[1]])[0];
    return !!~queryTokens.indexOf(queryToken);
  }

  /**
   * Replace all contractions with their word counterparts
   * (ex: `can't => can not`)
   */
  filterContractions(tokens: string[]) {
    // Assume first token is always a query word.
    tokens[0] = tokens[0].replace(/'s/g, ' is');
    return contractionCorrections.reduce(
      (pv, cv) => (pv.replace(cv[0], cv[1])),
      tokens.join(' ')
    ).split(' ');
  }

  /**
   * Filters characters that are not part of a valid
   * question.
   *
   * @param tokens An Array of tokens representing a question.
   */
  filterUnknown(tokens: string[]) {
    return tokens.map(v => v.replace(matchInvalidChars, ''));
  }

  /**
   * Replaces the query word with a unique uppercase character.
   *
   * @param tokens An Array of tokens representing a question.
   */
  setQueryCode(tokens: string[]) {
    const index = queryTokens.indexOf(tokens[0]);
    return (
      ~index
        ? [String.fromCharCode(65 + index), ...tokens.slice(1)]
        : tokens.slice()
    );
  }

  /**
   * Uses an optional-words array to replace any optional
   * tokens with a unique code.
   */
  stripOptional(tokens: string[]) {
    return tokens.filter(v => !~optionalTokens.indexOf(v));
  }

  /**
   * Uses a contextual-words array to replace any contextual
   * tokens with a unique code.
   */
  setContextCode(tokens: string[]) {
    return tokens.map(v => {
      const index = contextTokens.indexOf(v);
      return (
        ~index
          ? index < 10 ? `%0${index}` : `%${index}`
          : v
      );
    });
  }

  /**
   * Uses the `dict` to replace any found tokens
   * with a unique code.
   */
  setDictCode(dict: DictionaryManager) {
    return (tokens: string[]) => {
      return tokens.map(token => dict.encodeWord(token));
    };
  }

  /**
   * Combines a token Array with a pipe: "|" and encodes
   * the resulting string in **base64**.
   */
  toBase64WithPipe(tokens: string[]) {
    return Buffer.from(tokens.join('|')).toString('base64');
  }


  /**
   * Decodes an inquiry id, back to a relative form of the
   * original question the id represents.
   */
  decode(id: string) {
    const tokens =
      Buffer
        .from(id, 'base64')
        .toString('utf-8')
        .split('|')
    ;
    return (
      tokens.map((t, i) => {
        if (~t.indexOf('%')) return contextTokens[+t.substr(1)];
        if (~t.indexOf('&')) return this.dict.words[+t.substr(1)][0];
        if          (i == 0) return queryTokens[t.charCodeAt(0) - 65];
        return t;
      })
      .join(' ')
    );
  }
}



