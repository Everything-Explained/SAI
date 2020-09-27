import { Contemplator } from "../lib/core/contemplator";
import t from 'tape';
import { contextTokens, queryTokens } from "../lib/variables/constants";
import { Dictionary, dictSchema } from "../lib/database/dictionary";
import { FileOps } from "../lib/core/file-ops";
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
      t.same(contemplate.filterContractions(['what\'s', 'good']),
        ['what', 'is', 'good'],
        'filters query-word is-contractions.'
      );
    });

    t.test('stripUnknown(): string[]', async t => {
      const testTokens = '!+=t@#a\\$%^&,/e*@#&$.b%^&*l:(),[}<>c?'.split('');
      t.is(
        contemplate.filterUnknown(testTokens).join(''),
        'taeblc',
        'Allows lowercase characters only.'
      );
      t.isNot(contemplate.filterUnknown(testTokens), testTokens,
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
      dict.words = [
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

    t.test('toBase64(): string', async t => {
      const tokens = ['here', 'are', 'some', 'tokens'];
      const code = contemplate.toBase64(tokens);
      const str =
        Buffer
          .from(code, 'base64')
          .toString('utf-8')
      ;
      t.is(str.indexOf('here|are'), 0,
        'should return a base64 encoded string.'
      );
      t.is(str, 'here|are|some|tokens',
        'concatenates all tokens with a pipe character.'
      );
    });

    t.test('encodeQuery(): string', async t => {
      dict.words = [['large', 'big']];
      const q = "why \"can't\" i see how large @god is".split(' ');
      const q2 = "why can't; i see how big |\\god is".split(' ');
      const res1 = contemplate.encodeQuery(q)!;
      const res2 = contemplate.encodeQuery(q2)!
      ;
      t.is(contemplate.encodeQuery(['not', 'a', 'question']), undefined,
        'returns undefined if question NOT detected.'
      );
      t.ok(Buffer.from(res1, 'base64').toString('utf-8').indexOf('|'),
        'converts a question to an encoded base64 string.'
      );
      t.is(res1, res2,
        'combines similar questions to a single code.'
      );
      t.is(contemplate.decode(res2), 'why not i see how large god',
        'uses all helper functions to encode query.'
      );
    });

    t.test('partialEncodeQuery(): string', async t => {
      dict.words = [['god']];
      const q = 'what is the love of god'.split(' ');
      const test = contemplate.partialEncodeQuery(q).join('');
      t.is(test, 'Clove%04&00',
        'returns a unique id without base64 encoding.'
      );
    });

    t.test('decode(): string', async t => {
      dict.words = [['large', 'big']];
      const q = 'how big is this sun'.split(' ');
      const code = contemplate.encodeQuery(q, false)!;
      const str = contemplate.decode(code)
      ;
      t.is(str, 'how large this sun',
        'returns a relative version of the original query.'
      );
    });
    del('./test/contemplator');
  });
});

