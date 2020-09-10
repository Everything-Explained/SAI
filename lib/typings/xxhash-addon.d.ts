declare module 'xxhash-addon' {
  interface HashInterface {
    new(seed?: number): HashObject;
  }

  export interface HashObject {
    hash: (buf: Buffer) => Buffer;
  }

  export const XXHash32: HashInterface;
  export const XXHash64: HashInterface;
}