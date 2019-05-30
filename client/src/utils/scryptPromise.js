import scrypt from "scrypt-js";


export function scryptPromise(password, salt, keylen) {
    return new Promise((resolve, reject) => {
        let resolved = false;

        scrypt(password, salt, 16384, 8, 1, keylen, (err, progress, derivedKey) => {
            if(err) {
                reject(err);
            } else if(derivedKey && !resolved) {
                resolved = true;
                resolve(new Uint8Array(derivedKey));
            }
        });
    });
}
