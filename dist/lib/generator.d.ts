interface IEncodeOptions {
    nick: string;
    hours: number;
    keys: number[];
}
export declare class Base36 {
    base62Table: string[];
    constructor();
    toBase36(decimal: number): string;
    toBase62(decimal: number): string;
    decToBase(decimal: number, base: number): string;
    baseToDec(n: string, base: number): number;
    b36ToDec(n: string): number;
    b62ToDec(n: string): number;
    encode(options: IEncodeOptions): string;
    decode(genKey: string, keys: number[], test?: string): string;
    toTimeUnits(milliseconds: number): {
        milliseconds: number;
        seconds: number;
        minutes: number;
        hours: number;
        days: number;
    };
    hoursToTU(hours: number): {
        milliseconds: number;
        seconds: number;
        minutes: number;
        hours: number;
        days: number;
    };
    secondsToTU(seconds: number): {
        milliseconds: number;
        seconds: number;
        minutes: number;
        hours: number;
        days: number;
    };
    daysToTU(days: number): {
        milliseconds: number;
        seconds: number;
        minutes: number;
        hours: number;
        days: number;
    };
    jumbleString(str: string): string;
    randomBase36(length: number): string;
    randomNumberStr(range: number, amount?: number, unique?: boolean): string;
    validateInviteCode(code: string, prefix?: string): boolean;
    getInviteTimeout(code: string, prefix?: string): number;
    test(key: string, msg: string): string;
    decTest(key: string, msg: string): string;
    genKey(len: number): void;
    getInviteCode(hours: number, prefix?: string): string;
    encrypt(text: string): string;
    decipher(text: string): string;
}
export {};
