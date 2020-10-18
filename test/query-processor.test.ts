import { QueryProcessor } from "../lib/core/query-processor";
import t from 'tape';
import { Constants } from "../lib/variables/constants";
import { ParityManager, paritySchema } from "../lib/database/parity_manager";
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
fileOps.save('./test/contemplator/parity.said.gzip', paritySchema, [], true)
.then((err) => {
  const parityMngr = new ParityManager(fileOps, './test/contemplator/parity.said.gzip');
  const contemplate = new QueryProcessor(parityMngr);

  t('QueryProcessor{}', async t => {

    t.test('isValidQuery() returns false with < 2 words.', async t => {
      t.notOk(contemplate.isValidQuery([`what's`]));
    });

    t.test('isValidQuery() returns true even when contractions are used within a query.', async t => {
      t.ok(contemplate.isValidQuery([`what's`, 'good']));
    });

    t.test('isValidQuery() returns true when query word is found.', async t => {
      t.ok(contemplate.isValidQuery(['what', 'is', 'good']));
    });

    t.test('filterContractions() returns an array with contractions normalized.', async t => {
      const testWords = `I cannot won't don't can't and haven't they're`.split(' ');
      t.same(
        contemplate.filterContractions(testWords),
        ['I', 'can', 'not', 'will', 'not', 'do', 'not', 'can', 'not', 'and', 'have', 'not', 'they', 'are'],
      );
    });

    t.test('filterContractions() returns a new array.', async t => {
      const testWords = `I cannot won't don't can't and haven't they're`.split(' ');
      t.isNot(contemplate.filterContractions(testWords), testWords);
    });

    t.test('filterContractions() filters query-word is-contractions.', async t => {
      t.same(contemplate.filterContractions(['what\'s', 'good']), ['what', 'is', 'good']);
    });

    t.test('trimUnknownChars() returns lowercase characters only, given a string[] of any characters.', async t => {
      const testWords = '!+=tL@#a\\$%C^&,/e*@#&$.b%^B&*l:(),[D}<>c?'.split('');
      t.is(contemplate.trimUnknownChars(testWords).join(''),'taeblc');
    });

    t.test('trimUnknownChars() returns a new array.', async t => {
      const testWords = '!+=tL@#a\\$%C^&,/e*@#&$.b%^B&*l:(),[D}<>c?'.split('');
      t.isNot(contemplate.trimUnknownChars(testWords), testWords);
    });

    t.test('applyQuestionCode() replaces a question word with a relative uppercase char.', async t => {
      const testWord = [Constants.questionWords[3]];
      t.same(contemplate.applyQuestionCode(testWord), ['D']);
    });

    t.test('applyQuestionCode() returns a new array when code is applied.', async t => {
      const testWord = [Constants.questionWords[3]];
      t.isNot(contemplate.applyQuestionCode(testWord), testWord);
    });

    t.test('applyQuestionCode() returns new array even when no code is applied.', async t => {
      const testWord = ['notAQuestionWord'];
      t.isNot(contemplate.applyQuestionCode(testWord), testWord);
    });

    t.test('trimOptionalWords() returns words with optional words removed.', async t => {
      const testWord = ['what', 'is', 'the', 'name'];
      t.same(contemplate.trimOptionalWords(testWord), ['what', 'name']);
    });

    t.test('trimOptionalWords() returns new array.', async t => {
      const testWord = ['what', 'is', 'the', 'name'];
      t.isNot(contemplate.trimOptionalWords(testWord), testWord);
    });

    t.test('applyContextCodes() returns word array with contextual words replaced by a code.', async t => {
      t.same(contemplate.applyContextCodes([Constants.contextWords[10]]), ['%10']);
    });

    t.test('applyContextCodes() adds 0 placeholder to codes when context-word index < 10.', async t => {
      t.same(contemplate.applyContextCodes([Constants.contextWords[5]]), ['%05']);
    });

    t.test('applyContextCodes() returns a new array of words when words are mutated.', async t => {
      const mutates = [Constants.contextWords[3]];
      t.isNot(contemplate.applyContextCodes(mutates), mutates);
    });

    t.test('applyContextCodes() returns a new array of words when words are NOT mutated.', async t => {
      const notMutated = ['willnotmutate'];
      t.isNot(contemplate.applyContextCodes(notMutated), notMutated);
    });

    t.test('applyParityCodes() returns word array with parity words replaced by a code.', async t => {
      parityMngr.words = testWords;
      const parityCodeFunc = contemplate.applyParityCodes(parityMngr);
      t.same(parityCodeFunc(['i', 'am', 'test11']), ['i', 'am', '&11']);
    });

    t.test('applyParityCodes() adds 0 placeholder to codes when parity-word index < 10.', async t => {
      parityMngr.words = testWords;
      const parityCodeFunc = contemplate.applyParityCodes(parityMngr);
      t.same(parityCodeFunc(['test5']), ['&05']);
    });

    t.test('applyParityCodes() uses parity-word row position to create code.', async t => {
      parityMngr.words = testWords;
      const parityCodeFunc = contemplate.applyParityCodes(parityMngr);
      t.same(parityCodeFunc(['sidetest1']), ['&01']);
    });

    t.test('applyParityCodes() returns a new array of words when words are mutated.', async t => {
      parityMngr.words = testWords;
      const mutates = [parityMngr.words[0][1]];
      const parityCodeFunc = contemplate.applyParityCodes(parityMngr);
      t.isNot(parityCodeFunc(mutates), mutates);
    });

    t.test('applyParityCodes() returns a new array of words when words are NOT mutated.', async t => {
      const notMutated = ['willnotmutate'];
      const parityCodeFunc = contemplate.applyParityCodes(parityMngr);
      t.isNot(parityCodeFunc(notMutated), notMutated);
    });

    t.test('convertWordsToId() returns a base64 encoded string.', async t => {
      const code = contemplate.convertWordsToId(['some', 'words']);
      const str = Buffer.from(code, 'base64').toString('utf-8');
      t.ok(str.includes('some|words'));
    });

    t.test('convertWordsToId() concatenates all words with a pipe character.', async t => {
      const code = contemplate.convertWordsToId(['some', 'words']);
      const str = Buffer.from(code, 'base64').toString('utf-8');
      t.is(str, 'some|words');
    });

    t.test('encodeQueryToId() returns undefined if question NOT detected.', async t => {
      t.is(contemplate.encodeQueryToId('not a question'), undefined);
    });

    t.test('encodeQueryToId() converts a complex question to an encoded base64 string.', async t => {
      parityMngr.words = [['large', 'big']];
      const res = contemplate.encodeQueryToId(`why "can't" i see how large @god is`)!;
      t.is(res, 'RnwlMTd8JTAzfHNlZXwlMTZ8JjAwfGdvZA==');
      parityMngr.words = [];
    });

    t.test('encodeQueryToId() combines similar words to a single code.', async t => {
      parityMngr.words = [['large', 'big']];
      const res1 = contemplate.encodeQueryToId(`why "can't" i see how large @god is`)!;
      const res2 = contemplate.encodeQueryToId(`why can't; i see how big |\\god is`)!;
      t.is(res1, res2);
      parityMngr.words = [];
    });

    t.test('encodeQueryToId() uses all internal functions to encode query.', async t => {
      parityMngr.words = [['large', 'big']];
      const res = contemplate.encodeQueryToId(`why can't; i see how big |\\god is`)!;
      t.is(contemplate.decodeIdToQuery(res), 'why not i see how large god');
      parityMngr.words = [];
    });

    t.test('decodeIdToQuery() returns a question relative to the provided code.', async t => {
      parityMngr.words = [['large', 'big']];
      const str = contemplate.decodeIdToQuery(
        contemplate.encodeQueryToId('how big is this sun', false)!)
      ;
      t.is(str, 'how large this sun');
    });

    t.test('partialEncodeQuery() returns a unique id without base64 encoding.', async t => {
      parityMngr.words = [['god']];
      const q = 'what is the love of god'.split(' ');
      const test = contemplate.partialEncodeQuery(q).join('');
      t.is(test, 'Clove%04&00');
      parityMngr.words = [];
    });


    del('./test/contemplator');
  });
});

