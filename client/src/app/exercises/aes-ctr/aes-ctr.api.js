import { ajax } from "rxjs/ajax";

import * as utils from "../../../utils";
import config from "../../../config";


export default {
    sendCiphertext(ciphertext, cleartextLen, iv) {
        const body = {
            ciphertext: btoa(utils.uint8ArrayToString(new Uint8Array(ciphertext))),
            iv: btoa(utils.uint8ArrayToString(new Uint8Array(iv))),
            length: cleartextLen
        };
        const headers = { "Content-Type": "application/json" };

        return ajax.post(`${config.baseUrl}/aes-ctr/message`, body, headers).toPromise();
    }
}
