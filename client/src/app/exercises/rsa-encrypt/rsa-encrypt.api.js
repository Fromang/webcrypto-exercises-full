import { ajax } from "rxjs/ajax";

import config from "../../../config";
import * as utils from "../../../utils";


export default {
    getServerPublicKey() {
        return ajax.get(`${config.baseUrl}/rsa-encrypt/public-key`).toPromise();
    },

    decrypt(ciphertext) {
        const headers = { "Content-Type": "application/json" };
        const body = {
            ciphertext: btoa(utils.uint8ArrayToString(new Uint8Array(ciphertext)))
        };

        return ajax.post(`${config.baseUrl}/rsa-encrypt/decrypt`, body, headers).toPromise();
    }
}
