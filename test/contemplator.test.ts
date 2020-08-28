import { Contemplator } from "../src/core/contemplator";
import t from 'tape';
import { contextTokens, queryTokens } from "../src/variables/constants";
import { Dictionary, dictSchema } from "../src/database/dictionary";
import { FileOps } from "../src/core/file-ops";
import del from "del";


const fileOps = new FileOps();
fileOps.createFolder('./test/contemplator');
fileOps.save('./test/contemplator/dictionary.said.gzip', dictSchema, [], true)
.then((err) => {
  const dict = new Dictionary(fileOps, './test/contemplator/dictionary.said.gzip');
  const contemplate = new Contemplator(dict);
  t('Contemplator{}', async t => {
    t.test('isQuery(): boolean', async t => {
      t.is(contemplate.isQuery([`what's`]), false,
        'returns false with < 2 tokens.'
      );
      t.is(contemplate.isQuery([`what's`, 'good']), true,
        'filters contractions on query words.'
      );
      t.is(contemplate.isQuery(['what', 'is', 'good']), true,
        'returns true when query word is found.'
      );
    });

    t.test('filterContractions()', async t => {
      const testTokens = `I cannot won't don't can't and haven't they're`.split(' ');
      t.same(
        contemplate.filterContractions(testTokens),
        ['I', 'can', 'not', 'will', 'not', 'do', 'not', 'can', 'not', 'and', 'have', 'not', 'they', 'are'],
        'returns an array with contractions normalized.'
      );
      t.isNot(contemplate.filterContractions(testTokens), testTokens,
        'returns a new array.'
      );
    });

    t.test('stripUnknown(): string[]', async t => {
      const testTokens = '!+=t@#a\\$%^&,/e*@#&$.b%^&*l:(),[}<>c?'.split('');
      t.is(
        contemplate.stripUnknown(testTokens).join(''),
        'taeblc',
        'Allows lowercase characters only.'
      );
      t.isNot(contemplate.stripUnknown(testTokens), testTokens,
        'returns a new array.'
      );
    });

    t.test('setQueryCode(): string[]', async t => {
      const testToken = [queryTokens[3]];
      const testToken2 = ['nonToken'];
      t.same(contemplate.setQueryCode(testToken), ['D'],
        'replaces a query token with a relative uppercase char.'
      );
      t.isNot(contemplate.setQueryCode(testToken), testToken,
        'returns a new array when changed.'
      );
      t.isNot(contemplate.setQueryCode(testToken2), testToken2,
        'returns new array when unchanged.'
      );
    });

    t.test('stripOptional: string[]', async t => {
      const testTokens = ['what', 'is', 'the', 'name'];
      t.same(contemplate.stripOptional(testTokens), ['what', 'name'],
        'removes optional tokens.'
      );
      t.isNot(contemplate.stripOptional(testTokens), testTokens,
        'returns new array.'
      );
    });

    t.test('setContextCode(): string[]', async t => {
      t.same(contemplate.setContextCode([contextTokens[10]]), ['%10'],
        'replaces contextual token with a "%" and its index number.'
      );
      t.same(contemplate.setContextCode([contextTokens[5]]), ['%05'],
       'uses a "0" placeholder when contextual token index is < 10.'
       );
       const willChange = [contextTokens[3]];
       t.isNot(contemplate.setContextCode(willChange), willChange,
        'returns a new array when changed.'
      );
      const willNotChange = ['unchanged'];
      t.isNot(contemplate.setContextCode(willNotChange), willNotChange,
        'returns a new array when unchanged.'
      );
    });

    t.test('setDictCode(): string[]', async t => {
      dict.wordList = [
        ['test0', 'sidetest0'],
        ['test1', 'sidetest1'],
        ['test2'], ['test3'], ['test4'], ['test5'], ['test6'],
        ['test7'], ['test8'], ['test9'], ['test10'], ['test11']
      ];
      const dictCodeFunc = contemplate.setDictCode(dict);
      t.same(dictCodeFunc(['i', 'am', 'test11']), ['i', 'am', '&11'],
        'returns token array with words replaced by code.'
      );
      t.same(dictCodeFunc(['test5']), ['&05'],
        'adds padding to codes below 10.'
      );
      t.same(dictCodeFunc(['sidetest1']), ['&01'],
        'uses dictionary row position to create code.'
      );
    });

    t.test('toHash(): () => number', async t => {
      const toHash = contemplate.toHash(contemplate.hasher);
      const result = toHash(['hello', 'world']);
      t.ok(typeof result == 'number',
        'returns a hash number.'
      );
      t.is(result, -1951427130,
        'returns a predictable hash.'
      );
    });

    t.test('queryToHash(): number', async t => {
      dict.wordList = [['good', 'right', 'proper']];
      const res1 = contemplate.queryToHash(['what', 'is', 'good']);
      const res2 = contemplate.queryToHash(['what', 'is', 'proper']);
      t.is(contemplate.queryToHash(['not', 'a', 'question']), undefined,
        'returns undefined if question NOT detected.'
      );
      t.ok(typeof res1 == 'number',
        'converts a question to a number.'
      );
      t.is(res1, res2,
        'combines similar questions to a single hash.'
      );
    });
    del('./test/contemplator');
  });
});

