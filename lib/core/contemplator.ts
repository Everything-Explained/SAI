import { Dictionary } from "../database/dictionary";
import {
  contextTokens,
  contractionCorrections,
  hashSeed,
  matchInvalidChars,
  optionalTokens,
  queryTokens
} from "../variables/constants";
import { XXHash32, HashObject } from 'xxhash-addon';
import { flow as _flow } from 'lodash/fp';



export class Contemplator {
  private readonly _hash32: HashObject;

  get hashObj() {
    return this._hash32;
  }


  constructor(private dict: Dictionary) {
    this._hash32 = new XXHash32(hashSeed);
   }


  /**
   * Converts a tokenized question into its respective hash code
   * based on words in the dictionary.
   *
   * @param tokens An array of words that should make up a question.
   * @param checkQuery Skips token validation when **false**.
   */
  queryToHash(tokens: string[], checkQuery = true) {
    if (checkQuery && !this.isQuery(tokens)) return undefined;
    return _flow(
      this.filterContractions,
      this.filterUnknown,
      this.setQueryCode,
      this.setContextCode,
      this.setDictCode(this.dict),
      this.toHash(this._hash32),
    )(tokens);
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
  setDictCode(dict: Dictionary) {
    return (tokens: string[]) => {
      return tokens.map(token => dict.encodeWord(token));
    };
  }

  /**
   * Uses the xxhash algorithm to convert the specified
   * `tokens` into a unique hash value.
   */
  toHash(hasher: HashObject) {
    return (tokens: string[]) => {
      return hasher.hash(Buffer.from(tokens.join(''))).readInt32BE();
    };
  }
}



