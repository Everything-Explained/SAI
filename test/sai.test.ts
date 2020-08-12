import SAI from "../src/sai";
import { existsSync } from 'fs';
import del from 'del';
import t from 'tape';


t('SAI Class', async t => {
  t.test('constructor()', async t => {
    const folderPath = './test/test1';
    new SAI(folderPath);
    t.ok(existsSync(folderPath),
      'creates test folder'
    );

    t.ok(existsSync(`${folderPath}/replies.said.gzip`),
      'creates replies file.'
    );

    t.ok(existsSync(`${folderPath}/dictionary.said.gzip`),
      'creates a dictionary file.'
    );

    del(folderPath);
  });


  t.test('addWord()', async t => {
    const folderPath = './test/test2';
    const sai = new SAI(folderPath);

    t.same(sai.addWord('god'), null,
      'returns null on success.'
    );
    t.ok(sai.addWord('god')!.message,
      'returns error obj if word exists.'
    );
    t.same(sai.wordList[0], ['god'],
      'updates wordList with added word.'
    );
    t.is(sai.wordsRefList[0], 'god',
      'updates wordsRefList with added word.'
    );
    del(folderPath);
  });


  t.test('findWord()', async t => {
    const folderPath = './test/test3';
    const sai = new SAI(folderPath);
    sai.addWord('god');
    const findWordGoodResult = sai.findWord('god');
    const findWordErrorResult = sai.findWord('pickles');

    t.same(findWordGoodResult[1], ['god'],
      'returns an array of words on success.'
    );
    t.is(findWordGoodResult[0], null,
      'error value should be null if word is found.'
    );
    t.ok(findWordErrorResult[0]!.message,
      'will set error value on word not found.'
    );
    del(folderPath);
  });
});



