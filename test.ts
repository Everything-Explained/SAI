import { writeFileSync, createWriteStream, readFileSync, createReadStream, writeFile, promises } from 'fs';
import { h32 } from 'xxhashjs';
import { Base36 } from './src/generator';
import { ReReadable } from 'rereadable-stream';
import avro from 'avsc';
import { createGzip, gunzip, gunzipSync, gzip } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { any } from 'lodash/fp';
import { dictSchema } from './src/database/dictionary';


// const file1 = readFileSync('./test.txt');
// const file2 = readFileSync('./test2.txt', 'utf8');
// const iterations = 10;

// console.time('temptime');
// const arry: number[] = [];
// while(arry.length < 5) {
//   arry.push(1 * arry.length);
// }
// console.timeEnd('temptime');

// for (let i = 0; i < iterations; i++) {
//   console.time('file1');
//   const deserialized1 = jsonScheme.fromBuffer(file1);
//   console.timeEnd('file1');
// }

// for (let i = 0; i < iterations; i++) {
//   console.time('file2');
//   const deserialized2 = JSON.parse(file2);
//   console.timeEnd('file2');
// }


// console.log(deserialized1);
// console.log(deserialized2);

// const wf = promisify(writeFile);
// async function exec() {
//   return new Promise((rs, rj) => {
//     wf('./woobly/blah.txt', Buffer.from('hello world'))
//       .then(() => true)
//       .catch(err => rj(err));
//   });
// }

// exec()
//   .catch(e => {
//     console.log(e);
//   });

const filedata = readFileSync('test.txt', 'ascii');

const doc =
`
/@\\
asdlkj flkasdjf lkjasdf lkjasd f

fasdlkasdjflkasjdf
asdflkjasdflkjas dfklasdj falkfsdj
asdflkjasdflkjas

alsdjkfasdf lkjasdf lkasjdf
`;
const mockupDir = './test/mockups';
const missingQ = readFileSync(`${mockupDir}/missingQTest.txt`, 'utf-8');
console.log(missingQ.match(/\n\/@\\(\r|\n)/g));
// const pipe = promisify(pipeline);
// async function do_gzip(input: string, output: string) {
//   const gzip = createGzip();
//   const source = createReadStream(input);
//   const destination = createWriteStream(output);
//   await pipe(source, gzip, destination);
// }

// do_gzip('./test.txt', './test.txt.gzip');

// const extracted = jsonScheme.fromBuffer(buf).data;
// writeFileSync('test.txt', buf);

// const jsonLight = avro.Type.forSchema({
//   name: 'lightReplies',
//   type: 'record',
//   aliases: ['Replies'],
//   fields: [
//     { name: 'hashes', type: { type: 'array', items: 'long'} }
//   ]
// });

// const resolver = jsonLight.createResolver(jsonScheme);

const answer =
`This is going to be an average size answer that would be gleaned from asking about things
from the bot. We don't know how many of these kinds of long questions might exist, but they should
cover as large a scope as possible to see what kind of data storage we should be looking at.

It should be obvious that deep philosophical questions will have deep resonating answers which
are designed to penetrate on all levels of consciousness, in order to evoke understanding from
within each and every individual looking for answers like these.

We must assume that a moderately long answer is going to be the average answer, when looking
at the data as a whole. This will be used as a benchmark.
`;


const json1 = { questions: ['what is sausage'],  answer: 'one', hashes: [1495080714], dateCreated: 1596929732748, dateEdited: 1596929742649 };
const json2 = { questions: ['where is sausage'], answer: 'two', hashes: [1848581134], dateCreated: 1596752846144, dateEdited: 1596929226720 };
const json3 = { questions: ['who is sausage'],   answer, hashes: [5819234882], dateCreated: 1596929827433, dateEdited: 1596929836658 };
const json4 = { questions: ['when is sausage'],  answer: 'four', hashes: [3819384812], dateCreated: 1596929846221, dateEdited: 1596929853646 };


// const recordAmount = 10000;

// const schemeData = {
//   replies: [] as typeof json1[]
// };
// while (schemeData.replies.length < recordAmount) {
//   schemeData.replies.push(json3);
// }

// const buf = replySchema.toBuffer(schemeData);
// writeFileSync('./test.txt', buf);


// const writeables: typeof json1[] = [];
// while (writeables.length < recordAmount) {
//   writeables.push(json3);
// }

// writeFileSync('./test2.txt', JSON.stringify({ replies: writeables }));



// const encoder = avro.createFileEncoder('./test.txt', jsonScheme);

// function write(item: any) {

//   return new Promise((resolve, reject) => {
//     const result = jsonScheme.isValid(item, {
//       errorHook: err => {
//         err.forEach(key => {
//           console.log('Invalid field name: ' + key);
//           console.log('Invalid field content: ' + JSON.stringify(item[key], null, 2));
//         });
//         reject();
//       },
//     });
//     if (result) {
//       encoder.write(item, resolve);
//     }
//   });
// }

// async function runAll() {
//   await write(json1);
//   await write(json2);
//   await write(json3);
//   await write(json4);
//   encoder.end();
// }

// runAll();


function readStream() {
  const rereadable = createReadStream('./test.txt').pipe(new ReReadable());

  return new Promise((rs, rj) => {
    rereadable.rewind().pipe(new avro.streams.BlockDecoder())
      .on('data', item => {
        console.log(item);
      })
      .on('end', () => {
        console.log('end of stream');
        rs(true);
      });
  });
}

// readStream();




// fr.pipe(new avro.streams.BlockDecoder())
//   .on('data', item => {
//     console.log(item);
//   })
//   .on('end', () => {
//     console.log('All Records Ended');
//   });


// const file = readFileSync('./test.txt');

// const buf = jsonScheme.fromBuffer(file);
// const lightRecord = jsonLight.fromBuffer(jsonLight.toBuffer(file), resolver, true);
// console.log(lightRecord.greeting);



