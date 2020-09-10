import t from 'tape';
import { FileOps } from '../lib/core/file-ops';
import { Dictionary, dictSchema } from '../lib/database/dictionary';
import del from 'del';

const fileOps = new FileOps();
fileOps.createFolder('./test/dict');
fileOps.save('./test/dict/dictionary.said.gzip', dictSchema, [], true)
.then(() => {
  const dict = new Dictionary(fileOps, './test/dict/dictionary.said.gzip');
  t('Dictionary{}', async t => {
    t.test('addWord(): Error|null', async t => {
      t.is(dict.addWord('test'), null,
        'returns null if no errors occur.'
      );
      t.ok(dict.addWord('test'),
        'returns Error() if word exists.'
      );
      t.same(dict.words, [['test']],
        'adds a word to the internal word list.'
      );
      t.is(dict.flatWords[0], 'test',
        'updates wordsRefList with added word.'
      );
    });

    t.test('addWordToIndex(): Error|null', async t => {
      dict.words = [['test']];
      const goodWordAdd = dict.addWordToIndex('test2', 0);
      t.is(goodWordAdd, null,
        'returns null on success.'
      );
      t.ok(~dict.addWordToIndex('blah', -1)!.message.indexOf('-1'),
        'returns an Error() if index is < 0'
      );
      t.ok(dict.addWordToIndex('test', 0)!.message,
        'returns an Error() if word already exists.'
      );
      t.ok(dict.addWordToIndex('blah', 10)!.message,
        'returns an Error() if index not found.'
      );
      t.same(dict.words[0], ['test', 'test2'],
        'updates word list with new word'
      );
      t.ok(dict.flatWords.includes('test2'),
        'updates word reference list with new word'
      );
    });

    t.test('findWordPosition(): [number, number] | undefined', async t => {
      dict.words = [['test'], ['test2', 'test4', 'test5'], ['test3']];
      const goodResult = dict.findWordPosition('test5');
      const errorResult = dict.findWordPosition('invalid');

      t.ok(goodResult![0] == 1 && goodResult![1] == 2,
        'returns the exact row and column of a found word.'
      );
      t.is(dict.findWordPosition('test')![0], 0,
        'finds word at beginning of array.'
      );
      t.is(dict.findWordPosition('test3')![0], 2,
        'finds word at end of array.');
      t.is(errorResult, undefined,
        'returns undefined when word is NOT found.'
      );
    });

    t.test('findWordsAtIndex(): string[] | undefined', async t => {
      dict.words = [['test'], ['test2'], ['test3']];
      const goodResult = dict.findWordsAtIndex(1);
      const badResult = dict.findWordsAtIndex(10);

      t.same(goodResult, ['test2'],
        'returns an array of words where the specified word was found.'
      );
      t.notEqual(goodResult, dict.words[1],
        'returns a new array.'
      );
      t.is(dict.findWordsAtIndex(-12), undefined,
        'returns undefined on negative numbers as they are NOT truthy.'
      );
      t.is(badResult, undefined,
        'returns undefined when word is NOT found.'
      );
    });

    t.test('delWord(): Error|null', async t => {
      dict.words = [['test', 'test4'], ['test2', 'test5'], ['test3']];
      t.ok(dict.delWord('test7')!.message,
        'returns an Error() if word does NOT exist.'
      );
      t.is(dict.delWord('test2'), null,
        'returns null if word was deleted.'
      );
      t.notOk(dict.words[1].includes('test2'),
        'updates word list on success.'
      );
      t.notOk(dict.flatWords.includes('test2'),
        'updates word reference list on success.'
      );
      t.ok(dict.words[1].includes('test5'),
        'deletes a word using column-index, leaving the row-index.'
      );

      dict.delWord('test5');
      t.same(dict.words[1], ['test3'],
        'deletes row-index if word is the only column-index in row.'
      );
    });

    t.test('delWordsAtIndex(): Error|null', async t => {
      dict.words = [['test'], ['test2', 'test3'], ['test4']];
      const goodDelete = dict.delWordsAtIndex(1);
      t.ok(~dict.delWordsAtIndex(5)!.message.indexOf('NOT found'),
        'returns Error() when index NOT found.'
      );
      t.is(goodDelete, null,
        'returns null on success.'
      );
      t.same(dict.words[1], ['test4'],
        'deletes row index when word is found.'
      );
      t.is(dict.words.length, 2,
        'deletes words from word list'
      );
      t.is(dict.flatWords.length, 2,
        'deletes words from word list reference.'
      );
    });

    t.test('encodeWord(): string', async t => {
      dict.words = [['a'],['b'],['c'],['d'],['e'],['f'],['g'],['h'],['i'],['j'],['k']];
      t.is(dict.encodeWord('z'), 'z',
        'returns the word unmodified if not in Dictionary.'
      );
      t.is(dict.encodeWord('a'), '&00',
        'encodes a word based on its index position.'
      );
      t.is(dict.encodeWord('d'), '&03',
        'will pad encodings that are found with an index < 10.'
      );
      t.is(dict.encodeWord('k'), '&10',
        'will stop padding values when index > 9.'
      );
    });
    del('./test/dict');
  });
});