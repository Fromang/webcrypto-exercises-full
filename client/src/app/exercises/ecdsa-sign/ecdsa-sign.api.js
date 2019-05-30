import { ajax } from "rxjs/ajax";

import config from "../../../config";


export default {
    sendSignedMessage(publicKey, signedMessage) {
        const headers = { "Content-Type": "application/json" };
        const keyParam = btoa(JSON.stringify(publicKey));
        const body = signedMessage;

        return ajax.post(`${config.baseUrl}/ecdsa-sign/verify/${keyParam}`, body, headers).toPromise()
    }
}
