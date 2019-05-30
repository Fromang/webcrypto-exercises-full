import { observable, flow } from "mobx";

import * as utils from "../../../utils";
import aesCtrApi from "./aes-ctr.api";


export default observable({
    // State
    secret: "Don't tell this to anybody!", // Pre-shared secret to generate keys
    keyType: {
        name: "AES-CTR"
    },

    cleartext: "",
    ciphertext: new ArrayBuffer(0),
    iv: new ArrayBuffer(0),
    response: {},
    serverCleartext: "",

    // Flows
    encrypt: flow(function *encrypt() {
        // Get key
        const key = yield this.getKey();

        // Encrypt the cleartext
        const iv = window.crypto.getRandomValues(new Uint8Array(16));
        const ciphertext = yield window.crypto.subtle.encrypt({
            name: this.keyType.name,
            counter: iv,
            length: 128 // 2^16*128 = 1MB
        }, key, utils.stringToUint8Array(this.cleartext).buffer);

        this.ciphertext = ciphertext;
        this.iv = iv;
        this.cleartextLen = this.cleartext.length;
    }),

    sendCiphertext: flow(function *sendCiphertext() {
        const apiResponse = yield aesCtrApi.sendCiphertext(
            this.ciphertext,
            this.cleartextLen,
            this.iv,
        );

        // Store server response
        this.response = apiResponse.response;
    }),

    decrypt: flow(function *decrypt() {
        // Get key
        const key = yield this.getKey();

        // Encrypt the cleartext
        const iv = utils.stringToUint8Array(atob(this.response.iv));
        const cleartextArrayBuffer = yield window.crypto.subtle.decrypt({
            name: this.keyType.name,
            counter: iv,
            // additionalData: new ArrayBuffer([1, 2, 3, 4, 5, 6, 7, 8, 9]),
            length: 128 // In bits
        }, key, utils.stringToUint8Array(atob(this.response.serverCiphertext)).buffer);

        this.serverCleartext = utils.uint8ArrayToString(new Uint8Array(cleartextArrayBuffer));
    }),

    // Methods
    async getKey() {
        // Derivate key
        const derivedKey = await utils.scryptPromise(
            utils.stringToUint8Array(this.secret),
            utils.stringToUint8Array("salt"),
            32
        );

        // Import key
        const key = await window.crypto.subtle.importKey("raw", derivedKey,
            this.keyType, false, ["encrypt", "decrypt"]);

        return key;
    },
});;
