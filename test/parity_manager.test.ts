import t from 'tape';
import { FileOps } from '../lib/core/file-ops';
import { ParityManager, paritySchema, ParityErrorCode } from '../lib/database/parity_manager';
import del from 'del';
import { Constants } from '../lib/variables/constants';
import smap from 'source-map-support';

smap.install();

const fileOps = new FileOps();
const mockFolderPath = `${Constants.mockDir}/parity`;
fileOps.createFolder(mockFolderPath);
fileOps.save(`${mockFolderPath}/parity.said.gzip`, paritySchema, [], true)
.then(() => {
  const parityMngr = new ParityManager(fileOps, `${mockFolderPath}/parity.said.gzip`);
  t('ParityManager{}', async t => {
    t.test('constructor() throws error on invalid path.', async t => {
      t.throws(() => new ParityManager(fileOps, './invalid/path'));
    });

    t.test('addWord() returns true if no errors occur.', async t => {
      t.is(parityMngr.addWord('test'), true);
      parityMngr.words = [];
    });
    t.test('addWord() returns AlreadyExists error code if word exists.', async t => {
      parityMngr.addWord('test');
      t.is(parityMngr.addWord('test'), ParityErrorCode.AlreadyExists);
      parityMngr.words = [];
    });
    t.test('addWord() adds a word to the internal word list.', async t => {
      parityMngr.addWord('test');
      t.same(parityMngr.words, [['test']]);
      parityMngr.words = [];
    });
    t.test('addWord() updates internal word reference with added word.', async t => {
      parityMngr.addWord('test');
      parityMngr.addWord('test2');
      t.same(parityMngr.flatWords, ['test', 'test2']);
      parityMngr.words = [];
    });

    t.test('addWordToIndex() appends word to specified index and returns true.', async t => {
      parityMngr.words = [['test']];
      t.is(parityMngr.addWordToIndex('test2', 0), true);
      t.same(parityMngr.words, [['test', 'test2']]);
      parityMngr.words = [];
    });
    t.test('addWordToIndex() returns an error code for all expected errors.', async t => {
      parityMngr.words    = [['test']];
      const negativeOne   = parityMngr.addWordToIndex('blah', -1);
      const alreadyExists = parityMngr.addWordToIndex('test',  0);
      const notFound      = parityMngr.addWordToIndex('blah', 10)
      ;
      t.is(negativeOne, ParityErrorCode.IndexLessThanZero, 'IndexLessThanZero');
      t.is(alreadyExists, ParityErrorCode.AlreadyExists,   'AlreadyExists');
      t.is(notFound, ParityErrorCode.IndexNotFound,        'IndexNotFound');
      parityMngr.words = [];
    });
    t.test('addWordToIndex() updates word reference list with new word.', async t => {
      parityMngr.words = [['test']];
      parityMngr.addWordToIndex('test2', 0);
      t.same(parityMngr.flatWords, ['test', 'test2']);
      parityMngr.words = [];
    });

    t.test('findWordPosition() returns the exact row and column of a found word.', async t => {
      parityMngr.words = [['test'], ['test2', 'test3']];
      t.same(parityMngr.findWordPosition('test3'), [1, 1]);
      parityMngr.words = [];
    });
    t.test('findWordPosition() returns position of word at beginning of array.', async t => {
      parityMngr.words = [['test'], ['test2', 'test3']];
      t.same(parityMngr.findWordPosition('test'), [0, 0]);
      parityMngr.words = [];
    });
    t.test('findWordPosition() returns position of word at end of array.', async t => {
      parityMngr.words = [['test'], ['test2', 'test3'], ['test5']];
      t.same(parityMngr.findWordPosition('test5'), [2, 0]);
      parityMngr.words = [];
    });
    t.test('findWordPosition() returns undefined when word is NOT found.', async t => {
      parityMngr.words = [['test'], ['test2', 'test3']];
      t.same(parityMngr.findWordPosition('willNotFind'), undefined);
      parityMngr.words = [];
    });

    t.test('findWordsAtIndex() returns array of words at specified index position.', async t => {
      parityMngr.words = [['test'], ['test2'], ['test3']];
      t.same(parityMngr.findWordsAt(1), ['test2']);
      parityMngr.words = [];
    });
    t.test('findWordsAtIndex() returns a new array.', async t => {
      parityMngr.words = [['test'], ['test2'], ['test3']];
      t.isNot(parityMngr.findWordsAt(1), parityMngr.words[1]);
      parityMngr.words = [];
    });
    t.test('findWordsAtIndex() returns undefined when word is NOT found.', async t => {
      parityMngr.words = [['test'], ['test2'], ['test3']];
      t.is(parityMngr.findWordsAt(-12), undefined);
      t.is(parityMngr.findWordsAt(5), undefined);
      parityMngr.words = [];
    });

    t.test('delWord() returns WordNotFound error code if word does NOT exist.', async t => {
      parityMngr.words = [['test', 'test4']];
      t.is(parityMngr.delWord('test7'), ParityErrorCode.WordNotFound);
      parityMngr.words = [];
    });
    t.test('delWord() returns true if word was deleted.', async t => {
      parityMngr.words = [['test', 'test4'], ['test2', 'test5']];
      t.is(parityMngr.delWord('test2'), true);
      parityMngr.words = [];
    });
    t.test('delWord() updates word list on success.', async t => {
      parityMngr.words = [['test', 'test4'], ['test2', 'test5']];
      parityMngr.delWord('test2');
      t.same(parityMngr.words[1], ['test5']);
      parityMngr.words = [];
    });
    t.test('delWord() updates word reference list on success.', async t => {
      parityMngr.words = [['test', 'test4'], ['test2', 'test5']];
      parityMngr.delWord('test2');
      t.notOk(parityMngr.flatWords.includes('test2'));
      parityMngr.words = [];
    });
    t.test('delWord() deletes word array if specified word is the only value in array.', async t => {
      parityMngr.words = [['test', 'test4'], ['test2', 'test5'], ['test3']];
      parityMngr.delWord('test3');
      t.is(parityMngr.words.length, 2);
      parityMngr.words = [];
    });

    t.test('delWordsAtIndex() return IndexNotFound error code when index NOT found.', async t => {
      parityMngr.words = [['test'], ['test2', 'test3'], ['test4']];
      t.is(parityMngr.delWordsAtIndex(5), ParityErrorCode.IndexNotFound);
      parityMngr.words = [];
    });
    t.test('delWordsAtIndex() returns true on success.', async t => {
      parityMngr.words = [['test'], ['test2', 'test3'], ['test4']];
      t.is(parityMngr.delWordsAtIndex(1), true);
      parityMngr.words = [];
    });
    t.test('delWordsAtIndex() deletes specified word at index when found.', async t => {
      parityMngr.words = [['test'], ['test2', 'test3'], ['test4']];
      parityMngr.delWordsAtIndex(1);
      t.same(parityMngr.words[1], ['test4']);
      parityMngr.words = [];
    });
    t.test('delWordsAtIndex() removes deleted words from word list.', async t => {
      parityMngr.words = [['test'], ['test2', 'test3'], ['test4']];
      parityMngr.delWordsAtIndex(1);
      t.same(parityMngr.words, [['test'], ['test4']]);
      parityMngr.words = [];
    });
    t.test('delWordsAtIndex() removes deleted words from word reference list.', async t => {
      parityMngr.words = [['test'], ['test2', 'test3'], ['test4']];
      parityMngr.delWordsAtIndex(1);
      t.is(parityMngr.flatWords.length, 2);
      parityMngr.words = [];
    });

    t.test('save() Successfully saves the files.', t => {
      t.plan(2);
      parityMngr.words = [['test', 'test1'], ['pickles']];
      parityMngr.save()
        .then(() => {
          t.pass('save completed without errors');
          const words = fileOps.readParityStore(`${mockFolderPath}/parity.said.gzip`);
          t.same(words, [['test', 'test1'], ['pickles']]);
        })
        .catch((err) => t.fail(err.message))
        .finally(() => del(mockFolderPath))
      ;
    });
  });
});