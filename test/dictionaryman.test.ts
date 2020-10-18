import t from 'tape';
import { FileOps } from '../lib/core/file-ops';
import { DictionaryManager, dictSchema, DictErrorCode } from '../lib/database/dictionaryman';
import del from 'del';
import { Constants } from '../lib/variables/constants';
import smap from 'source-map-support';

smap.install();

const fileOps = new FileOps();
const mockFolderPath = `${Constants.mockDir}/dictionary`;
fileOps.createFolder(mockFolderPath);
fileOps.save(`${mockFolderPath}/dictionary.said.gzip`, dictSchema, [], true)
.then(() => {
  const dict = new DictionaryManager(fileOps, `${mockFolderPath}/dictionary.said.gzip`);
  t('Dictionary{}', async t => {
    t.test('constructor() throws error on invalid path.', async t => {
      t.throws(() => new DictionaryManager(fileOps, './invalid/path'));
    });

    t.test('addWord() returns true if no errors occur.', async t => {
      t.is(dict.addWord('test'), true);
      dict.words = [];
    });

    t.test('addWord() returns an Error{} if word exists.', async t => {
      dict.addWord('test');
      t.is(dict.addWord('test'), DictErrorCode.AlreadyExists);
      dict.words = [];
    });

    t.test('addWord() adds a word to the internal word list.', async t => {
      dict.addWord('test');
      t.same(dict.words, [['test']]);
      dict.words = [];
    });

    t.test('addWord() updates internal word reference with added word.', async t => {
      dict.addWord('test');
      dict.addWord('test2');
      t.same(dict.flatWords, ['test', 'test2']);
      dict.words = [];
    });

    t.test('addWordToIndex() appends word to specified index and returns true.', async t => {
      dict.words = [['test']];
      t.is(dict.addWordToIndex('test2', 0), true);
      t.same(dict.words, [['test', 'test2']]);
      dict.words = [];
    });

    t.test('addWordToIndex() returns an error code for all expected errors.', async t => {
      dict.words = [['test']];
      t.is(dict.addWordToIndex('blah', -1), DictErrorCode.IndexLessThanZero);
      t.is(dict.addWordToIndex('test',  0), DictErrorCode.AlreadyExists);
      t.is(dict.addWordToIndex('blah', 10), DictErrorCode.IndexNotFound);
      dict.words = [];
    });

    t.test('addWordToIndex() updates word reference list with new word.', async t => {
      dict.words = [['test']];
      dict.addWordToIndex('test2', 0);
      t.same(dict.flatWords, ['test', 'test2']);
      dict.words = [];
    });

    t.test('findWordPosition() returns the exact row and column of a found word.', async t => {
      dict.words = [['test'], ['test2', 'test3']];
      t.same(dict.findWordPosition('test3'), [1, 1]);
      dict.words = [];
    });

    t.test('findWordPosition() returns position of word at beginning of array.', async t => {
      dict.words = [['test'], ['test2', 'test3']];
      t.same(dict.findWordPosition('test'), [0, 0]);
      dict.words = [];
    });

    t.test('findWordPosition() returns position of word at end of array.', async t => {
      dict.words = [['test'], ['test2', 'test3'], ['test5']];
      t.same(dict.findWordPosition('test5'), [2, 0]);
      dict.words = [];
    });

    t.test('findWordPosition() returns undefined when word is NOT found.', async t => {
      dict.words = [['test'], ['test2', 'test3']];
      t.same(dict.findWordPosition('willNotFind'), undefined);
      dict.words = [];
    });

    t.test('findWordsAtIndex() returns array of words at specified index position.', async t => {
      dict.words = [['test'], ['test2'], ['test3']];
      t.same(dict.findWordsAtIndex(1), ['test2']);
      dict.words = [];
    });

    t.test('findWordsAtIndex() returns a new array.', async t => {
      dict.words = [['test'], ['test2'], ['test3']];
      t.isNot(dict.findWordsAtIndex(1), dict.words[1]);
      dict.words = [];
    });

    t.test('findWordsAtIndex() returns undefined when word is NOT found.', async t => {
      dict.words = [['test'], ['test2'], ['test3']];
      t.is(dict.findWordsAtIndex(-12), undefined);
      t.is(dict.findWordsAtIndex(5), undefined);
      dict.words = [];
    });

    t.test('delWord() returns an error code if word does NOT exist.', async t => {
      dict.words = [['test', 'test4']];
      t.is(dict.delWord('test7'), DictErrorCode.WordNotFound);
      dict.words = [];
    });

    t.test('delWord() returns true if word was deleted.', async t => {
      dict.words = [['test', 'test4'], ['test2', 'test5']];
      t.is(dict.delWord('test2'), true);
      dict.words = [];
    });

    t.test('delWord() updates word list on success.', async t => {
      dict.words = [['test', 'test4'], ['test2', 'test5']];
      dict.delWord('test2');
      t.same(dict.words[1], ['test5']);
      dict.words = [];
    });

    t.test('delWord() updates word reference list on success.', async t => {
      dict.words = [['test', 'test4'], ['test2', 'test5']];
      dict.delWord('test2');
      t.notOk(dict.flatWords.includes('test2'));
      dict.words = [];
    });

    t.test('delWord() deletes word array if specified word is the only value in array.', async t => {
      dict.words = [['test', 'test4'], ['test2', 'test5'], ['test3']];
      dict.delWord('test3');
      t.is(dict.words.length, 2);
      dict.words = [];
    });

    t.test('delWordsAtIndex() return error code when index NOT found.', async t => {
      dict.words = [['test'], ['test2', 'test3'], ['test4']];
      t.is(dict.delWordsAtIndex(5), DictErrorCode.IndexNotFound);
      dict.words = [];
    });

    t.test('delWordsAtIndex() returns true on success.', async t => {
      dict.words = [['test'], ['test2', 'test3'], ['test4']];
      t.is(dict.delWordsAtIndex(1), true);
      dict.words = [];
    });

    t.test('delWordsAtIndex() deletes specified word at index when found.', async t => {
      dict.words = [['test'], ['test2', 'test3'], ['test4']];
      dict.delWordsAtIndex(1);
      t.same(dict.words[1], ['test4']);
      dict.words = [];
    });

    t.test('delWordsAtIndex() removes deleted words from word list.', async t => {
      dict.words = [['test'], ['test2', 'test3'], ['test4']];
      dict.delWordsAtIndex(1);
      t.same(dict.words, [['test'], ['test4']]);
      dict.words = [];
    });

    t.test('delWordsAtIndex() removes deleted words from word reference list.', async t => {
      dict.words = [['test'], ['test2', 'test3'], ['test4']];
      dict.delWordsAtIndex(1);
      t.is(dict.flatWords.length, 2);
      dict.words = [];
    });


    t.test('save() Successfully saves the files.', t => {
      t.plan(2);
      dict.words = [['test', 'test1'], ['pickles']];
      dict.save()
        .then(() => {
          t.pass('save completed without errors');
          const words = fileOps.readDictStore(`${mockFolderPath}/dictionary.said.gzip`);
          t.same(words, [['test', 'test1'], ['pickles']]);
        })
        .catch((err) => t.fail(err.message))
        .finally(() => del(mockFolderPath))
      ;
    });

  });
});