
export class RandomUtils {

    static randomString(len: number, charSet?: string) {
        const result = [];

        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        while (len--) {
            result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
        }

        return result.join('');
    }

}