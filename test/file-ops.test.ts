import { createFolder, createGzipFile, readDictStore, readReplyStore } from "../src/file-ops";
import del from 'del';
import { existsSync } from "fs";
import t from 'tape';
import { dictSchema, replySchema } from "../src/schema";

t('File Operations', async t => {
  t.test('createFolder()', async t => {
    let folderPath = './test/newfolder1';
    createFolder(folderPath);
    t.ok(existsSync(folderPath),
      'will create specified folder.'
    );
    del(folderPath);

    folderPath = './test/newfolder2';
    createFolder(folderPath);
    t.ok(createFolder(folderPath),
      'returns if folder already exists.'
    );
    del(folderPath);
  });

  t.test('createGzipFile()', async t => {
    let filePath = './test/test1.file';
    let gzipPath = `${filePath}.gzip`;
    createGzipFile(filePath, Buffer.from('testing'));
    t.ok(existsSync(gzipPath),
      'creates a gzipped file.'
    );
    del(gzipPath);

    filePath = './test/test2.file';
    gzipPath = `${filePath}.gzip`;
    createGzipFile(filePath, Buffer.from('testing'));
    t.ok(createGzipFile(filePath, Buffer.from('testing')),
      'returns if folder already exists.'
    );
    del(gzipPath);
  });

  t.test('readReplyStore()', async t => {
    const fileName = 'replies.ext';
    const schema = replySchema.toBuffer([
      { questions: ['hello'],
        answer: 'world',
        hashes: [3812834],
        dateCreated: 1234,
        dateEdited: 4321 }
    ]);
    createGzipFile(`./test/${fileName}`, schema);
    const replyObj = readReplyStore(`./test/${fileName}`, replySchema);
    t.equal(replyObj[0].answer, 'world',
      'reads a reply buffer into a JSON object'
    );
    del(`./test/${fileName}.gzip`);
  });

  t.test('readDictStore()', async t => {
    const fileName = 'dictionary.ext';
    const schema = dictSchema.toBuffer([
      ['god', 'pickles'], ['love', 'lobster']
    ]);
    createGzipFile(`./test/${fileName}`, schema);
    const dictObj = readDictStore(`./test/${fileName}`, dictSchema);
    t.equal(dictObj[0][0], 'god',
      'reads a dictionary buffer into a JSON object'
    );
    del(`./test/${fileName}.gzip`);
  });
});