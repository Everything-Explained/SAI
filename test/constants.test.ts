import { Constants } from "../lib/variables/constants";
import { intersection as _intersection } from 'lodash/fp';
import t from 'tape';
import smap from 'source-map-support';

smap.install();



function wordsAreUnique(words: string[], wordType: string) {
  const clonedTokens = words.slice();
  while (clonedTokens.length) {
    const token = clonedTokens.shift() as string;
    if (~clonedTokens.indexOf(token)) {
      throw new Error(`Duplicate ${wordType} token found: "${token}"`);
    }
  }
  return true;
}


function wordsHaveNoSpaces(words: string[], wordType: string) {
  words.forEach(v => {
    if (v.includes(' '))
      throw new Error(`Whitespace found within ${wordType} token: "${v}"`)
    ;
  });
  return true;
}

t('Constants', async t => {

  t.test('[setup]:wordsAreUnique() returns true when there are NO duplicate tokens.', async t => {
    const tokens = ['1', '2', '3', '4', '5'];
    t.ok(wordsAreUnique(tokens, 'validation'));
  });
  t.test('[setup]:wordsAreUnique() throws an error when duplicate tokens are found.', async t => {
    const tokens = ['1', '2', '3', '4', '5', '3'];
    t.throws(() => wordsAreUnique(tokens, 'invalidation'));
  });

  t.test('[setup]:wordsHaveNoSpaces() returns true when there are NO spaces between tokens.', async t => {
    const tokens = ['1', '2', '3', '4', '5'];
    t.ok(wordsHaveNoSpaces(tokens, 'NoSpaces'));
  });
  t.test('[setup]:wordsHaveNoSpaces() throws an error when spaces are found in tokens.', async t => {
    const tokens = ['1', '2', '3 ', '4', '5'];
    t.throws(() => wordsHaveNoSpaces(tokens, 'HaveSpaces'));
  });

  t.test('queryTokens should be unique', async t => {
    t.ok(wordsAreUnique(Constants.questionWords, 'query'));
  });
  t.test('queryTokens should contain no spaces', async t => {
    t.ok(wordsHaveNoSpaces(Constants.questionWords, 'query'));
  });
  t.test('queryTokens should have less than 26 items.', async t => {
    t.ok(Constants.questionWords.length < 26);
  });

  t.test('contextTokens should be unique.', async t => {
    t.ok(wordsAreUnique(Constants.contextWords, 'context'));
  });
  t.test('contextTokens should contain no spaces.', async t => {
    t.ok(wordsHaveNoSpaces(Constants.contextWords, 'context'));
  });

  t.test('optionalTokens should be unique.', async t => {
    t.ok(wordsAreUnique(Constants.optionalWords, 'optional'));
  });
  t.test('optionalTokens should contain no spaces.', async t => {
    t.ok(wordsHaveNoSpaces(Constants.optionalWords, 'optional'));
  });
  t.test('optionalTokens should not intersect with contextual tokens.', async t => {
    const diff = _intersection(Constants.optionalWords, Constants.contextWords);
    t.equal(diff.length, 0);
  });
});