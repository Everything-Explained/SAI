import { contextTokens, optionalTokens, queryTokens } from "../lib/variables/constants";
import { intersection as _intersection } from 'lodash/fp';
import t from 'tape';
import smap from 'source-map-support';

smap.install();



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

  t.test('[setup]:tokensAreUnique() returns true when there are NO duplicate tokens.', async t => {
    const tokens = ['1', '2', '3', '4', '5'];
    t.ok(tokensAreUnique(tokens, 'validation'));
  });

  t.test('[setup]:tokensAreUnique() throws an error when duplicate tokens are found.', async t => {
    const tokens = ['1', '2', '3', '4', '5', '3'];
    t.throws(() => tokensAreUnique(tokens, 'invalidation'));
  });

  t.test('[setup]:tokensHaveNoSpaces() returns true when there are NO spaces between tokens.', async t => {
    const tokens = ['1', '2', '3', '4', '5'];
    t.ok(tokensHaveNoSpaces(tokens, 'NoSpaces'));
  });

  t.test('[setup]:tokensHaveNoSpaces() throws an error when spaces are found in tokens.', async t => {
    const tokens = ['1', '2', '3 ', '4', '5'];
    t.throws(() => tokensHaveNoSpaces(tokens, 'HaveSpaces'));
  });

  t.test('queryTokens should be unique', async t => {
    t.ok(tokensAreUnique(queryTokens, 'query'));
  });

  t.test('queryTokens should contain no spaces', async t => {
    t.ok(tokensHaveNoSpaces(queryTokens, 'query'));
  });

  t.test('queryTokens should have less than 26 items.', async t => {
    t.ok(queryTokens.length < 26);
  });

  t.test('contextTokens should be unique.', async t => {
    t.ok(tokensAreUnique(contextTokens, 'context'));
  });

  t.test('contextTokens should contain no spaces.', async t => {
    t.ok(tokensHaveNoSpaces(contextTokens, 'context'));
  });

  t.test('optionalTokens should be unique.', async t => {
    t.ok(tokensAreUnique(optionalTokens, 'optional'));
  });

  t.test('optionalTokens should contain no spaces.', async t => {
    t.ok(tokensHaveNoSpaces(optionalTokens, 'optional'));
  });

  t.test('optionalTokens should not intersect with contextual tokens.', async t => {
    const diff = _intersection(optionalTokens, contextTokens);
    t.equal(diff.length, 0);
  });
});