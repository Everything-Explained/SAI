import { SAI } from "../src/main";
import { existsSync } from 'fs';
import del from 'del';
import t from 'tape';




t('SAI Class', async t => {
  const folderPath = './test/test';
  new SAI(folderPath,
    (err) => {
      t.test('constructor()', async t => {
        t.equal(err, null,
          'returns no errors on proper instantiation'
        );
        if (err) console.log(err);
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
      del(folderPath);
    })
  ;
});



