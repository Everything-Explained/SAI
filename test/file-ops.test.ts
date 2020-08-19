import { FileOps } from "../src/core/file-ops";
import del from 'del';
import { existsSync, writeFile } from "fs";
import t from 'tape';
import { Type as AvroType } from 'avsc';
import { dictSchema } from "../src/database/dictionary";
import { replySchema } from "../src/database/replies";
import { promisify } from "util";


const fileOps = new FileOps();
const testScheme = AvroType.forSchema({
  name: 'test',
  type: 'array', items: 'string'
});
const writeFileAsync = promisify(writeFile);


t('File Operations', async t => {

  t.test('createFolder()', async t => {
    let folderPath = './test/newfolder1';
    fileOps.createFolder(folderPath);
    t.ok(existsSync(folderPath),
      'will create specified folder.'
    );
    del(folderPath);

    folderPath = './test/newfolder2';
    fileOps.createFolder(folderPath);
    t.ok(fileOps.createFolder(folderPath),
      'returns if folder already exists.'
    );
    del(folderPath);
  });

  t.test('save(): Promise<null>', t => {
    const validPath = `./test/test1.test`;
    const validPath2 = `./test/test2.gzip`;
    const invalidPath = `./blah/blah.test`;
    const validValue = ['valid value'];
    const invalidValue = ['valid value', ['invalid value']];
    t.plan(5);

    fileOps.save(validPath, testScheme, validValue, false)
      .then(data => {
        t.equal(data, null,
          'resolves null on success.'
        );
      })
    ;
    fileOps.save(validPath, testScheme, validValue, false)
      .catch((err: Error) => {
        t.ok(~err.message.indexOf('Cannot save'),
          'rejects when saving too fast.'
        );
        del(validPath);
      })
    ;
    fileOps.save(validPath, testScheme, invalidValue, false, false)
      .catch((err: Error) => {
        t.ok(~err.message.indexOf('data fails'),
          'rejects on invalid scheme value.'
        );
      })
    ;
    fileOps.save(invalidPath, testScheme, validValue, false, false)
      .catch((err: Error) => {
        t.ok(~err.message.indexOf('ENOENT'),
          'rejects on invalid file path.'
        );
      })
    ;
    fileOps.save(validPath2, testScheme, validValue, true, false)
      .then(resp => {
        t.equal(resp, null,
          'resolves null on file compression and save.'
        );
        del(validPath2);
      })
    ;

  });

  t.test('readReplyStore()', async t => {
    const goodPath = './test/replies.gzip';
    const badPath = './test/badReplies.gzip';
    const data = [
      { questions: ['hello'],
        answer: 'world',
        hashes: [3812834],
        dateCreated: 1234,
        dateEdited: 4321 }
    ];
    await fileOps.save(goodPath, replySchema, data, true, false);
    await writeFileAsync(badPath, JSON.stringify({ hello: ''}), { encoding: 'binary'});
    const replyObj = fileOps.readReplyStore(goodPath);
    t.equal(replyObj[0].answer, 'world',
      'reads a reply buffer into a JSON object'
    );
    t.throws(() => fileOps.readReplyStore(badPath),
      /(truncated buffer)|(incorrect header)/g,
      'throws an error if data fails schema conversion.'
    );
    del([goodPath, badPath]);
  });


  t.test('readDictStore()', async t => {
    const goodPath = './test/dictionary.gzip';
    const badPath = './test/badDictionary.gzip';
    const data = [['god', 'pickles'], ['love', 'lobster']];
    await fileOps.save(goodPath, dictSchema, data, true, false);
    await writeFileAsync(badPath, JSON.stringify({ hello: ''}), { encoding: 'binary'});
    const dictObj = fileOps.readDictStore(goodPath);
    t.equal(dictObj[0][0], 'god',
      'reads a dictionary buffer into a JSON object'
    );
    t.throws(() => fileOps.readDictStore(badPath),
      /(truncated buffer)|(incorrect header)/g,
      'throws an error if data fails schema conversion.'
    );
    del([goodPath, badPath]);
  });
});