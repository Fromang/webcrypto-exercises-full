import { observable, action, flow } from "mobx";

import rsaEncryptApi from "./rsa-encrypt.api";
import * as utils from "../../../utils";


export default observable({
    // State
    publicKey: undefined,
    cleartext: undefined,
    ciphertext: new ArrayBuffer(0),

    // Flows
    getServerPublicKey: flow(function *getServerPublicKey() {
        const apiResponse = yield rsaEncryptApi.getServerPublicKey();
        const response = apiResponse.response;
    
        console.log("Get public key", response);
        this.publicKey = response;

        // Import key. We need to do so if we want to use webcrypto!
        const keyType = { name: "RSA-OAEP", hash: { name: "SHA-1" } };
        this.internalPublicKey = yield self.crypto.subtle.importKey("jwk", this.publicKey,
                keyType, false, ["encrypt"]);
    }),

    encrypt: flow(function *encrypt() {
        const cleartext = this.cleartext;

        // Encrypt the cleartext
        const ciphertext = yield self.crypto.subtle.encrypt({
            name: "RSA-OAEP"
        }, this.internalPublicKey, utils.stringToUint8Array(cleartext).buffer);

        // Since we are inside a flow we can modify the state!
        this.ciphertext = ciphertext;
    }),

    // Methods
    sendCipherText() {
        rsaEncryptApi.decrypt(this.ciphertext);
    }
});
