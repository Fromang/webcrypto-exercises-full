import { observable, flow } from "mobx";

import * as utils from "../../../utils";
import edsaSignApi from "./ecdsa-sign.api";


export default observable({
    // State
    keys: undefined,
    publicKey: undefined,
    message: "",
    signedMessage: {},
    serverResponse: "NO SERVER RESPONSE",

    // Flows
    generateKeys: flow(function *generateKeys() {
        // Generate keys
        const keys = yield self.crypto.subtle.generateKey({
            name: "ECDSA",
            namedCurve: "P-256", //can be "P-256", "P-384", or "P-521"
        }, true, ["sign", "verify"]);

        // Encrypt the cleartext
        const publicKey = yield self.crypto.subtle.exportKey(
            "jwk", keys.publicKey);

        this.keys = keys;
        this.publicKey = publicKey;
    }),

    sign: flow(function *sign() {
        const message = this.message;

        // Generate signature
        const sign = yield self.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
            },
            this.keys.privateKey,
            utils.stringToUint8Array(message).buffer
        ).then(utils.signatureP1363ToDer); // IMORTANT! Convert signature format from P1363 to DER

        this.signedMessage = {
            message,
            sign: btoa(utils.uint8ArrayToString(new Uint8Array(sign)))
        };
    }),

    sendSignedMessage: flow(function *() {

        // Send the message to the client
        const { response } = yield edsaSignApi.sendSignedMessage(this.publicKey, this.signedMessage);

        // Fill the server response
        this.serverResponse = response.message;
    })
}, {
});
