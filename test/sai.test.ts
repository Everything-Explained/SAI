import SAI from "../src/sai";
import { existsSync } from 'fs';
import del from 'del';
import t from 'tape';




t('SAI Class', async t => {

  const folderPath = './test/test';
  const sai = new SAI(folderPath,
    () => {
      t.test('constructor()', async t => {
        t.ok(existsSync(folderPath),
          'creates test folder'
        );
        t.ok(existsSync(`${folderPath}/replies.said.gzip`),
          'creates replies file.'
        );
        t.ok(existsSync(`${folderPath}/dictionary.said.gzip`),
          'creates a dictionary file.'
        );
        t.pass('executes isReady() callback after SAI{}.init()');
      });

      t.test('findReply(): undefined | IReply', async t => {
        // to be implemented
      });

      t.test('init(): void', t => {
        t.plan(1);
        // A readonly folder must be created for this test
        new SAI('./test/readonly', err => {
          if (err) t.pass('bubbles up errors to callback.');
          else t.fail('did not bubble up error to callback');
        });
      });

      t.test('addWord(): Error|null', async t => {
        t.same(sai.addWord('god'), null,
          'returns null on success.'
        );
        t.ok(sai.addWord('god')!.message,
          'returns Error() if word exists.'
        );
        t.same(sai.wordList[0], ['god'],
          'updates wordList with added word.'
        );
        t.is(sai.wordsRefList[0], 'god',
          'updates wordsRefList with added word.'
        );
      });

      t.test('addWordToIndex(): Error|null', async t => {
        const goodWordAdd = sai.addWordToIndex('deity', 0);
        t.equal(goodWordAdd, null,
          'returns null if word is added successfully.'
        );
        t.ok(~sai.addWordToIndex('blah', -1)!.message.indexOf('-1'),
          'returns an Error() if index is < 0'
        );
        t.ok(sai.addWordToIndex('god', 0)!.message,
          'returns an Error() if word already exists.'
        );
        t.ok(sai.addWordToIndex('blah', 10)!.message,
          'returns an Error() if index not found.'
        );
        t.same(sai.wordList[0], ['god', 'deity'],
          'updates word list with new word'
        );
        t.ok(sai.wordsRefList.includes('deity'),
          'updates word reference list with new word'
        );
      });

      t.test('findWord(): [Error|null, string[], number, number]', async t => {
        const findWordGoodResult = sai.findWordPosition('god');
        const findWordErrorResult = sai.findWordPosition('pickles');

        t.equal(findWordGoodResult![0], 0,
          'row index is > -1 when a word is found.',
        );
        t.equal(findWordGoodResult![1], 0,
          'column index is > -1 when a word is found.',
        );
        t.equal(findWordErrorResult, undefined,
          'return undefined when word is NOT found.'
        );
      });

      t.test('findWordsAtIndex(): null | string[]', async t => {
        sai.addWord('god2');
        sai.addWordToIndex('god3', 1);
        const goodWordResult = sai.findWordsAtIndex(1);
        const badWordResult = sai.findWordsAtIndex(10);

        t.deepEqual(goodWordResult![1], 'god3',
          'returns the array of words where the specified word was found.'
        );
        t.equal(sai.findWordsAtIndex(-12), undefined,
          'returns undefined on negative numbers as they are NOT truthy.'
        );
        t.equal(badWordResult, undefined,
          'returns undefined when word is NOT found.'
        );
      });

      t.test('delWord(): Error|null', async t => {
        // "deity" added by addWordToIndex()
        const goodDelete = sai.delWord('deity');
        t.ok(sai.delWord('blah')!.message,
          'returns an Error() if word does NOT exist.'
        );
        t.equal(goodDelete, null,
          'returns null if word was deleted.'
        );
        t.notOk(sai.wordList[0].includes('deity'),
          'updates word list on success.'
        );
        t.notOk(sai.wordsRefList.includes('deity'),
          'updates word reference list on success.'
        );
        t.ok(sai.wordList[0].includes('god'),
          'deletes a word using column-index, leaving the row-index.'
        );

        sai.delWord('god'); // god was first index (0)
        t.same(sai.wordList[0], ['god2', 'god3'], // god2 and god3 added by findWordIndex()
          'deletes row-index if word is the only column-index in row.'
        );
      });

      t.test('delWordsAtIndex(): Error|null', async t => {
        t.ok(~sai.delWordsAtIndex(-1)!.message.indexOf('-1'),
          'returns Error when index is less than 0'
        );
        t.ok(~sai.delWordsAtIndex(5)!.message.indexOf('NOT found'),
          'returns Error when index does NOT exist.'
        );

        sai.addWordToIndex('god3', 0);
        sai.addWordToIndex('god4', 0);
        sai.addWord('pickles');
        sai.addWordToIndex('lobsters', 1);
        const goodDelete = sai.delWordsAtIndex(0);
        t.equal(goodDelete, null,
          'returns null when index successfully deleted.'
        );
        t.same(sai.wordList[0], ['pickles', 'lobsters'],
          'deletes row index when word is found.'
        );
        t.equal(sai.wordList.length, 1,
          'deletes words from word list'
        );
        t.equal(sai.wordsRefList.length, 2,
          'deletes words from word list reference.'
        );
        sai.delWordsAtIndex(0);
      });

      del(folderPath);
    })
  ;
});



