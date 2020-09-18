import { contextTokens, optionalTokens, queryTokens } from "../lib/variables/constants";
import { intersection as _intersection } from 'lodash/fp';
import t from 'tape';




function tokensAreUnique(tokens: string[], tokenType: string) {
  const clonedTokens = tokens.slice();
  while (clonedTokens.length) {
    const token = clonedTokens.shift() as string;
    if (~clonedTokens.indexOf(token)) {
      throw new Error(`Duplicate ${tokenType} token found: "${token}"`);
    }
  }
  return true;
}


function tokensHaveNoSpaces(tokens: string[], tokenType: string) {
  tokens.forEach(v => {
    if (v.includes(' '))
      throw new Error(`Whitespace found within ${tokenType} token: "${v}"`)
    ;
  });
  return true;
}

t('Constants', async t => {
  t.test('[test setup]', async t => {
    let tokens = ['1', '2', '3', '4', '5'];
    t.ok(
      tokensAreUnique(tokens, 'validation'),
      'tokensAreUnique(): returns true on no duplicate tokens.'
    );

    tokens = ['1', '2', '3', '4', '5', '3'];
    t.throws(
      () => tokensAreUnique(tokens, 'invalidation'),
      'tokensAreUnique(): throws an error on duplicate tokens'
    );

    tokens = ['1', '2', '3', '4', '5'];
    t.ok(
      tokensHaveNoSpaces(tokens, 'NoSpaces'),
      'tokensHaveNoSpaces(): enforces no space in tokens.'
    );

    tokens = ['1', '2', '3 ', '4', '5'];
    t.throws(
      () => tokensHaveNoSpaces(tokens, 'HaveSpaces'),
      'tokensHaveNoSpaces(): throws when spaces found in tokens.'
    );
  });


  t.test('queryTokens', async t => {
    t.ok(
      tokensAreUnique(queryTokens, 'query'),
      'are unique.'
    );
    t.ok(
      tokensHaveNoSpaces(queryTokens, 'query'),
      'contain no spaces.'
    );
    t.ok(queryTokens.length < 26,
      'should have less than 26 items.'
    );
  });


  t.test('contextTokens', async t => {
    t.ok(
      tokensAreUnique(contextTokens, 'context'),
      'are unique.'
    );
    t.ok(
      tokensHaveNoSpaces(contextTokens, 'context'),
      'contain no spaces.'
    );
  });


  t.test('optionalTokens', async t => {
    t.ok(
      tokensAreUnique(optionalTokens, 'optional'),
      'are unique.'
    );

    t.ok(
      tokensHaveNoSpaces(optionalTokens, 'optional'),
      'contain no spaces.'
    );

    const diff = _intersection(optionalTokens, contextTokens);
    t.equal(
      diff.length, 0,
      'do not intersect with contextual tokens.'
    );
  });
});