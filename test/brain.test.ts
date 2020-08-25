import { Brain } from "../src/core/brain";
import t from 'tape';
import { contextTokens, queryTokens } from "../src/variables/constants";
import { Dictionary, dictSchema } from "../src/database/dictionary";
import { FileOps } from "../src/core/file-ops";
import del from "del";


const fileOps = new FileOps();
fileOps.createFolder('./test/brain');
fileOps.save('./test/brain/dictionary.said.gzip', dictSchema, [], true)
.then((err) => {
  const dict = new Dictionary(fileOps, './test/brain/dictionary.said.gzip');
  const brain = new Brain(dict);
  t('Brain{}', async t => {
    t.test('isQuery(): boolean', async t => {
      t.is(brain.isQuery([`what's`]), false,
        'returns false with < 2 tokens.'
      );
      t.is(brain.isQuery([`what's`, 'good']), true,
        'filters contractions on query words.'
      );
      t.is(brain.isQuery(['what', 'is', 'good']), true,
        'returns true when query word is found.'
      );
    });

    t.test('filterContractions()', async t => {
      const testTokens = `I cannot won't don't can't and haven't they're`.split(' ');
      t.same(
        brain.filterContractions(testTokens),
        ['I', 'can', 'not', 'will', 'not', 'do', 'not', 'can', 'not', 'and', 'have', 'not', 'they', 'are'],
        'returns an array with contractions normalized.'
      );
      t.isNot(brain.filterContractions(testTokens), testTokens,
        'returns a new array.'
      );
    });

    t.test('stripUnknown(): string[]', async t => {
      const testTokens = '!+=t@#a\\$%^&,/e*@#&$.b%^&*l:(),[}<>c?'.split('');
      t.is(
        brain.stripUnknown(testTokens).join(''),
        'taeblc',
        'Allows lowercase characters only.'
      );
      t.isNot(brain.stripUnknown(testTokens), testTokens,
        'returns a new array.'
      );
    });

    t.test('setQueryCode(): string[]', async t => {
      const testToken = [queryTokens[3]];
      const testToken2 = ['nonToken'];
      t.same(brain.setQueryCode(testToken), ['D'],
        'replaces a query token with a relative uppercase char.'
      );
      t.isNot(brain.setQueryCode(testToken), testToken,
        'returns a new array when changed.'
      );
      t.isNot(brain.setQueryCode(testToken2), testToken2,
        'returns new array when unchanged.'
      );
    });

    t.test('stripOptional: string[]', async t => {
      const testTokens = ['what', 'is', 'the', 'name'];
      t.same(brain.stripOptional(testTokens), ['what', 'name'],
        'removes optional tokens.'
      );
      t.isNot(brain.stripOptional(testTokens), testTokens,
        'returns new array.'
      );
    });

    t.test('setContextCode(): string[]', async t => {
      t.same(brain.setContextCode([contextTokens[10]]), ['%10'],
        'replaces contextual token with a "%" and its index number.'
      );
      t.same(brain.setContextCode([contextTokens[5]]), ['%05'],
       'uses a "0" placeholder when contextual token index is < 10.'
       );
       const willChange = [contextTokens[3]];
       t.isNot(brain.setContextCode(willChange), willChange,
        'returns a new array when changed.'
      );
      const willNotChange = ['unchanged'];
      t.isNot(brain.setContextCode(willNotChange), willNotChange,
        'returns a new array when unchanged.'
      );
    });

    t.test('setDictCode(): string[]', async t => {
      dict.listWords = [
        ['test0', 'sidetest0'],
        ['test1', 'sidetest1'],
        ['test2'], ['test3'], ['test4'], ['test5'], ['test6'],
        ['test7'], ['test8'], ['test9'], ['test10'], ['test11']
      ];
      const dictCodeFunc = brain.setDictCode(dict);
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

    t.test('toHashNumber(): number', async t => {
      t.ok(typeof brain.toHashNumber(['hello', 'world']) == 'number',
        'returns a number.'
      );
    });

    t.test('queryToHash(): number', async t => {
      dict.listWords = [['good', 'right', 'proper']];
      t.is(brain.queryToHash(['not', 'a', 'question']), undefined,
        'returns undefined if question NOT detected.'
      );
      const res1 = brain.queryToHash(['what', 'is', 'good']);
      const res2 = brain.queryToHash(['what', 'is', 'proper']);
      t.ok(typeof res1 == 'number',
        'converts a question to a number.'
      );
      t.is(res1, res2,
        'combines similar questions to a single hash.'
      );
    });
    del('./test/brain');
  });
});

