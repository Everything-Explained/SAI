import { FileOps } from "../lib/core/file-ops";
import del from 'del';
import { existsSync, writeFile } from "fs";
import t from 'tape';
import { Type as AvroType } from 'avsc';
import { dictSchema } from "../lib/database/dictionaryman";
import { Inquiry, inquiryScheme } from "../lib/database/inquiryman";
import { promisify } from "util";
import { mockDir } from "../lib/variables/constants";
import smap from 'source-map-support';

smap.install();


const fileOps = new FileOps();
const testScheme = AvroType.forSchema({
  name: 'test',
  type: 'array', items: 'string'
});
const writeFileAsync = promisify(writeFile);


t('File Operations', async t => {

  t.test('createFolder()', async t => {
    let folderPath = `${mockDir}/createFolder`;
    fileOps.createFolder(folderPath);
    t.ok(existsSync(folderPath),
      'will create specified folder.'
    );
    del(folderPath);

    folderPath = `${mockDir}/folderPath2`;
    fileOps.createFolder(folderPath);
    t.ok(fileOps.createFolder(folderPath),
      'returns if folder already exists.'
    );
    del(folderPath);
  });

  t.test('save(): Promise<null>', t => {
    const path = `${mockDir}/save`;
    fileOps.createFolder(path);
    const validPath = `${path}/test1.test`;
    const validPath2 = `${path}/test2.gzip`;
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
        del(path);
      })
    ;
  });

  t.test('readInquiryStore()', async t => {
    const path = `${mockDir}/readInquiryStore`;
    fileOps.createFolder(path);
    const goodPath = `${path}/inquiries.gzip`;
    const badPath = `${path}/badInquiries.gzip`;
    const inquiriesTestData = [
      {
        title: 'blah',
        answer: 'world',
        ids: ['aAheoadf=='],
        tags: [],
        authors: [],
        level: 0,
        dateCreated: 1234,
        dateEdited: 4321,
        editedBy: '',
      }
    ] as Inquiry[];
    await fileOps.save(goodPath, inquiryScheme, inquiriesTestData, true, false);
    await writeFileAsync(badPath, JSON.stringify({ hello: ''}), { encoding: 'binary'});
    const inquiries = fileOps.readInquiryStore(goodPath);
    t.equal(inquiries[0].answer, 'world',
      'reads the Inquiry buffer into a JSON object'
    );
    t.throws(() => fileOps.readInquiryStore(badPath),
      /(truncated buffer)|(incorrect header)/g,
      'throws an error if data fails schema conversion.'
    );
    del(path);
  });

  t.test('readDictStore()', async t => {
    const path = `${mockDir}/readDictStore`;
    fileOps.createFolder(path);
    const goodPath = `${path}/dictionary.gzip`;
    const badPath = `${path}/badDictionary.gzip`;
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
    del(path);
  });
});