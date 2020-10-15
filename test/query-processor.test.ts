import { QueryProcessor } from "../lib/core/query-processor";
import t from 'tape';
import { Constants } from "../lib/variables/constants";
import { DictionaryManager, dictSchema } from "../lib/database/dictionaryman";
import { FileOps } from "../lib/core/file-ops";
import del from "del";
import smap from 'source-map-support';

smap.install();


const fileOps = new FileOps();
const testWords = [
  ['test0', 'sidetest0'],
  ['test1', 'sidetest1'],
  ['test2'], ['test3'], ['test4'], ['test5'], ['test6'],
  ['test7'], ['test8'], ['test9'], ['test10'], ['test11']
];
fileOps.createFolder('./test/contemplator');
fileOps.save('./test/contemplator/dictionary.said.gzip', dictSchema, [], true)
.then((err) => {
  const dict = new DictionaryManager(fileOps, './test/contemplator/dictionary.said.gzip');
  const contemplate = new QueryProcessor(dict);

  t('QueryProcessor{}', async t => {

    t.test('isQuery() returns false with < 2 tokens.', async t => {
      t.notOk(contemplate.isQuery([`what's`]));
    });

    t.test('isQuery() returns true even when contractions are used within a query.', async t => {
      t.ok(contemplate.isQuery([`what's`, 'good']));
    });

    t.test('isQuery() returns true when query word is found.', async t => {
      t.ok(contemplate.isQuery(['what', 'is', 'good']));
    });

    t.test('filterContractions() returns an array with contractions normalized.', async t => {
      const testTokens = `I cannot won't don't can't and haven't they're`.split(' ');
      t.same(
        contemplate.filterContractions(testTokens),
        ['I', 'can', 'not', 'will', 'not', 'do', 'not', 'can', 'not', 'and', 'have', 'not', 'they', 'are'],
      );
    });

    t.test('filterContractions() returns a new array.', async t => {
      const testTokens = `I cannot won't don't can't and haven't they're`.split(' ');
      t.isNot(contemplate.filterContractions(testTokens), testTokens);
    });

    t.test('filterContractions() filters query-word is-contractions.', async t => {
      t.same(contemplate.filterContractions(['what\'s', 'good']), ['what', 'is', 'good']);
    });

    t.test('trimUnknownChars() returns lowercase characters only, given a string[] of any characters.', async t => {
      const testTokens = '!+=tL@#a\\$%C^&,/e*@#&$.b%^B&*l:(),[D}<>c?'.split('');
      t.is(contemplate.trimUnknownChars(testTokens).join(''),'taeblc');
    });

    t.test('trimUnknownChars() returns a new array.', async t => {
      const testTokens = '!+=tL@#a\\$%C^&,/e*@#&$.b%^B&*l:(),[D}<>c?'.split('');
      t.isNot(contemplate.trimUnknownChars(testTokens), testTokens);
    });

    t.test('applyQueryCode() replaces a query token with a relative uppercase char.', async t => {
      const testToken = [Constants.queryTokens[3]];
      t.same(contemplate.applyQueryCode(testToken), ['D']);
    });

    t.test('applyQueryCode() returns a new array when changed.', async t => {
      const testToken = [Constants.queryTokens[3]];
      t.isNot(contemplate.applyQueryCode(testToken), testToken);
    });

    t.test('applyQueryCode() returns new array when unchanged.', async t => {
      const testToken = ['nonToken'];
      t.isNot(contemplate.applyQueryCode(testToken), testToken);
    });

    t.test('trimOptional() returns tokens with optional tokens removed.', async t => {
      const testTokens = ['what', 'is', 'the', 'name'];
      t.same(contemplate.trimOptional(testTokens), ['what', 'name']);
    });

    t.test('trimOptional() returns new array.', async t => {
      const testTokens = ['what', 'is', 'the', 'name'];
      t.isNot(contemplate.trimOptional(testTokens), testTokens);
    });

    t.test('applyContextCodes() returns token array with contextual tokens replaced by a code.', async t => {
      t.same(contemplate.applyContextCodes([Constants.contextTokens[10]]), ['%10']);
    });

    t.test('applyContextCodes() adds 0 placeholder to codes when context-token index < 10.', async t => {
      t.same(contemplate.applyContextCodes([Constants.contextTokens[5]]), ['%05']);
    });

    t.test('applyContextCodes() returns a new array of tokens when tokens are mutated.', async t => {
      const mutates = [Constants.contextTokens[3]];
      t.isNot(contemplate.applyContextCodes(mutates), mutates);
    });

    t.test('applyContextCodes() returns a new array of tokens when tokens are NOT mutated.', async t => {
      const notMutated = ['willnotmutate'];
      t.isNot(contemplate.applyContextCodes(notMutated), notMutated);
    });

    t.test('applyDictionaryCodes() returns token array with dictionary words replaced by a code.', async t => {
      dict.words = testWords;
      const dictCodeFunc = contemplate.applyDictionaryCodes(dict);
      t.same(dictCodeFunc(['i', 'am', 'test11']), ['i', 'am', '&11']);
    });

    t.test('applyDictionaryCodes() adds 0 placeholder to codes when dictionary-token index < 10.', async t => {
      dict.words = testWords;
      const dictCodeFunc = contemplate.applyDictionaryCodes(dict);
      t.same(dictCodeFunc(['test5']), ['&05']);
    });

    t.test('applyDictionaryCodes() uses dictionary row position to create code.', async t => {
      dict.words = testWords;
      const dictCodeFunc = contemplate.applyDictionaryCodes(dict);
      t.same(dictCodeFunc(['sidetest1']), ['&01']);
    });

    t.test('applyDictionaryCodes() returns a new array of tokens when tokens are mutated.', async t => {
      dict.words = testWords;
      const mutates = [dict.words[0][1]];
      const dictCodeFunc = contemplate.applyDictionaryCodes(dict);
      t.isNot(dictCodeFunc(mutates), mutates);
    });

    t.test('applyDictionaryCodes() returns a new array of tokens when tokens are NOT mutated.', async t => {
      const notMutated = ['willnotmutate'];
      const dictCodeFunc = contemplate.applyDictionaryCodes(dict);
      t.isNot(dictCodeFunc(notMutated), notMutated);
    });

    t.test('toBase64WithPipe() returns a base64 encoded string.', async t => {
      const code = contemplate.toBase64WithPipe(['some', 'tokens']);
      const str = Buffer.from(code, 'base64').toString('utf-8');
      t.ok(str.includes('some|tokens'));
    });

    t.test('toBase64WithPipe() concatenates all tokens with a pipe character.', async t => {
      const code = contemplate.toBase64WithPipe(['some', 'tokens']);
      const str = Buffer.from(code, 'base64').toString('utf-8');
      t.is(str, 'some|tokens');
    });

    t.test('encodeQuery() returns undefined if question NOT detected.', async t => {
      t.is(contemplate.toQueryId(['not', 'a', 'question']), undefined);
    });

    t.test('encodeQuery() converts a complex question to an encoded base64 string.', async t => {
      dict.words = [['large', 'big']];
      const q = "why \"can't\" i see how large @god is".split(' ');
      const res = contemplate.toQueryId(q)!;
      t.is(res, 'RnwlMTd8JTAzfHNlZXwlMTZ8JjAwfGdvZA==');
      dict.words = [];
    });

    t.test('encodeQuery() combines similar questions to a single code.', async t => {
      dict.words = [['large', 'big']];
      const q = "why \"can't\" i see how large @god is".split(' ');
      const q2 = "why can't; i see how big |\\god is".split(' ');
      const res1 = contemplate.toQueryId(q)!;
      const res2 = contemplate.toQueryId(q2)!;
      t.is(res1, res2);
      dict.words = [];
    });

    t.test('toQueryId() uses all internal functions to encode query.', async t => {
      dict.words = [['large', 'big']];
      const q = "why can't; i see how big |\\god is".split(' ');
      const res = contemplate.toQueryId(q)!;
      t.is(contemplate.toQueryTokens(res), 'why not i see how large god');
      dict.words = [];
    });

    t.test('toQueryTokens() returns a question relative to the provided code.', async t => {
      dict.words = [['large', 'big']];
      const str = contemplate.toQueryTokens(
        contemplate.toQueryId('how big is this sun'.split(' '), false)!)
      ;
      t.is(str, 'how large this sun');
    });

    t.test('partialEncodeQuery() returns a unique id without base64 encoding.', async t => {
      dict.words = [['god']];
      const q = 'what is the love of god'.split(' ');
      const test = contemplate.partialEncodeQuery(q).join('');
      t.is(test, 'Clove%04&00');
      dict.words = [];
    });


    del('./test/contemplator');
  });
});

