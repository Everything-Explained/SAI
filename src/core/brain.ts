import { Dictionary } from "../database/dictionary";
import {
  contextTokens,
  contractionCorrections,
  hashSeed,
  matchInvalidChars,
  optionalTokens,
  queryTokens
} from "../variables/constants";
import { h32 } from 'xxhashjs';
import { flow as _flow } from 'lodash/fp';


export class Brain {
  constructor(private dict: Dictionary) {  }

  queryToHash(tokens: string[], checkQuery = true) {
    if (checkQuery && !this.isQuery(tokens)) return undefined;
    return _flow(
      this.filterContractions,
      this.stripUnknown,
      this.setQueryCode,
      this.setContextCode,
      this.setDictCode(this.dict),
      this.toHashNumber,
    )(tokens);
  }

  isQuery(tokens: string[]) {
    // There are no questions shorter than 2 words.
    if (tokens.length < 2) return false;
    const queryToken = this.filterContractions([tokens[0], tokens[1]])[0];
    return !!~queryTokens.indexOf(queryToken);
  }

  filterContractions(tokens: string[]) {
    return contractionCorrections.reduce(
      (pv, cv) => (pv.replace(cv[0], cv[1])),
      tokens.join(' ')
    ).split(' ');
  }

  stripUnknown(tokens: string[]) {
    return tokens.map(v => v.replace(matchInvalidChars, ''));
  }

  setQueryCode(tokens: string[]) {
    const index = queryTokens.indexOf(tokens[0]);
    return (
      ~index
        ? [String.fromCharCode(65 + index), ...tokens.slice(1)]
        : tokens.slice()
    );
  }

  stripOptional(tokens: string[]) {
    return tokens.filter(v => !~optionalTokens.indexOf(v));
  }

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

  setDictCode(dict: Dictionary) {
    return (tokens: string[]) => {
      return tokens.map(token => {
        const wordPos = dict.findWordPosition(token);
        if (wordPos) {
          return (
            wordPos[0] < 10
              ? `&0${wordPos[0]}`
              : `&${wordPos[0]}`
          );
        }
        return token;
      });
    };
  }

  toHashNumber(tokens: string[]) {
    return h32(tokens.join(''), hashSeed).toNumber();
  }
}



