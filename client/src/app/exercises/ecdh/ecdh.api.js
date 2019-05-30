import { ajax } from "rxjs/ajax";

import config from "../../../config";
import * as utils from "../../../utils";


export default {
    getServerPublicKey() {
        return ajax.get(`${config.baseUrl}/ecdh/keys`).toPromise();
    },

    uploadPublicKey(publicKey) {
        const headers = { "Content-Type": "application/json" };
        const body = publicKey;

        return ajax.post(`${config.baseUrl}/ecdh/upload-public-key`, body, headers).toPromise();
    },

    ecdhSend(message) {
        const headers = { "Content-Type": "application/json" };
        const body = message;

        return ajax.post(`${config.baseUrl}/ecdh`, body, headers).toPromise();
    },

    sendCiphertext(ciphertext, iv) {
        const body = {
            ciphertext: btoa(utils.uint8ArrayToString(new Uint8Array(ciphertext))),
            iv: btoa(utils.uint8ArrayToString(new Uint8Array(iv)))
        };
        const headers = { "Content-Type": "application/json" };

        return ajax.post(`${config.baseUrl}/ecdh/ciphertext`, body, headers).toPromise();
    }
}
