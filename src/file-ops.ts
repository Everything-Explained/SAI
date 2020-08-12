import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { createGzip, gunzipSync, gzipSync } from 'zlib';
import avro from 'avsc';
import { Replies } from "./types";



// const pipe = promisify(pipeline);
// async function do_gzip(input: string, output: string) {
//   const gzip = createGzip();
//   const source = createReadStream(input);
//   const destination = createWriteStream(output);
//   await pipe(source, gzip, destination);
// }

// do_gzip('./test2.txt', './test2.txt.gzip');


export function createFolder(path: string): boolean {
  if (existsSync(path)) return true;
  mkdirSync(path);
  return true;
}


export function createGzipFile(filePath: string, def: Buffer): boolean {
  const gzipFilePath = `${filePath}.gzip`;

  if (existsSync(gzipFilePath)) return true;

  const zippedFile = gzipSync(def);
  writeFileSync(gzipFilePath, zippedFile, { encoding: 'binary' });

  return true;
}


export function readReplyStore(filePath: string, schema: avro.Type): Replies {
  const zippedReplies = readFileSync(`${filePath}.gzip`);
  const unzippedReplies = gunzipSync(zippedReplies);
  return schema.fromBuffer(unzippedReplies);
}

export function readDictStore(filePath: string, schema: avro.Type): string[][] {
  const zippedWords = readFileSync(`${filePath}.gzip`);
  const unzippedWords = gunzipSync(zippedWords);
  return schema.fromBuffer(unzippedWords);
}



