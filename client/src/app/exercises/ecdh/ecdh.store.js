import { observable, action, flow } from "mobx";

import ecdhApi from "./ecdh.api";
import * as utils from "../../../utils";


function loadStorage(key) {
    return JSON.parse(localStorage.getItem(key) || "null")
}


export default observable({
    // * This fields must be changed to execute te example *
    serverPublicKey: loadStorage('ecdh.serverPublicKey'),
    privateKey: loadStorage('ecdh.privateKey'),
    publicKey: loadStorage('ecdh.publicKey'),

    // Keys state
    keys: undefined,
    isPrepared: false,

    ecdsaCurve: "P-384", //can be "P-256", "P-384", or "P-521"
    serverKeys: undefined,
    clientKeys: undefined,

    // DH STATE
    ecdhCurve:  "P-384", //can be "P-256", "P-384", or "P-521"
    ecdhMessage: undefined,
    dhKeys: undefined,

    // AES-CTR
    sharedSecret: undefined,
    cleartext: "",
    symmetricKey: undefined,

    // Flows
    prepare: flow(function *prepare() {
        if(this.serverPublicKey && this.privateKey && this.publicKey) {
            this.isPrepared = true;
            yield this.prepareKeys();
        } else {
            yield this.getKeys();
        }
    }),

    prepareKeys: flow(function *prepareKeys() {
        const serverPublicKey = yield self.crypto.subtle.importKey(
            "jwk",
            this.serverPublicKey,
            { name: "ECDSA", namedCurve: this.ecdsaCurve },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["verify"]);

        this.serverKeys = { publicKey: serverPublicKey };

        const privateKey = yield self.crypto.subtle.importKey(
            "jwk",
            this.privateKey,
            { name: "ECDSA", namedCurve: this.ecdsaCurve },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["sign"]);

        const publicKey = yield self.crypto.subtle.importKey(
            "jwk",
            this.publicKey,
            { name: "ECDSA", namedCurve: this.ecdsaCurve },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["verify"]);


        this.clientKeys = { privateKey, publicKey };
    }),

    getKeys: flow(function *getKeys() {
        // Generate client keys
        const keys = yield self.crypto.subtle.generateKey({
            name: "ECDSA",
            namedCurve: this.ecdsaCurve,
        }, true, ["sign", "verify"]);

        // Encrypt the cleartext
        const privateKey = yield self.crypto.subtle.exportKey(
            "jwk", keys.privateKey);

        const publicKey = yield self.crypto.subtle.exportKey(
            "jwk", keys.publicKey);

        // Clean client keys
        delete privateKey["key_ops"];
        delete publicKey["key_ops"];
        delete privateKey["ext"];
        delete publicKey["ext"];

        // Get server public key
        const { response } = yield ecdhApi.getServerPublicKey();
        const serverKeys = response;

        // Upload client public key
        yield ecdhApi.uploadPublicKey(publicKey);

        this.keys = {
            serverKeys,
            clientKeys: {
                privateKey,
                publicKey
            }
        }
    }),

    ecdhGenerate: flow(function *ecdhGenerate() {
        this.dhKeys = yield self.crypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: this.ecdhCurve,
            }, false, ["deriveKey", "deriveBits"]);

        const publicKey = yield self.crypto.subtle.exportKey(
            "raw", //can be "jwk" (public or private), "raw" (public only), "spki" (public only), or "pkcs8" (private only)
            this.dhKeys.publicKey //can be a publicKey or privateKey, as long as extractable was true
        );

        const signature = yield self.crypto.subtle.sign(
            { name: "ECDSA", hash: { name: "SHA-256" } },
            this.clientKeys.privateKey,
            publicKey
        ).then(utils.signatureP1363ToDer); // IMORTANT! Convert signature format from P1363 to DER

        this.ecdhMessage = {
            publicKey: btoa(utils.uint8ArrayToString(new Uint8Array(publicKey))),
            signature: btoa(utils.uint8ArrayToString(new Uint8Array(signature)))
        }
    }),

    ecdhSend: flow(function *ecdhSend() {
        const { response } = yield ecdhApi.ecdhSend(this.ecdhMessage);

        const dhServerKey = utils.stringToUint8Array(atob(response.publicKey)).buffer;
        const signatureDer = utils.stringToUint8Array(atob(response.signature)).buffer;
        const signatureP1363 = utils.signatureDerToP1363(signatureDer, this.ecdsaCurve);

        // Check signature
        const correct = yield self.crypto.subtle.verify(
            { name: "ECDSA", hash: { name: "SHA-256" } },
            this.serverKeys.publicKey,
            signatureP1363,
            dhServerKey
        ).catch((err) => {
            console.log(err.message)
        });

        if(!correct) {
            throw Error("The signature is not correct!");
        }

        // Generate shared key
        const serverPublicKey = yield self.crypto.subtle.importKey(
            "raw",
            dhServerKey,
            { name: "ECDH", namedCurve: this.ecdhCurve },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            []
        );

        this.sharedSecret = yield self.crypto.subtle.deriveBits(
            {
                name: "ECDH",
                namedCurve: this.ecdhCurve,
                public: serverPublicKey,
            },
            this.dhKeys.privateKey,
            256
        );

        this.symmetricKey = yield self.crypto.subtle.importKey(
            "raw",
            this.sharedSecret,
            { name: "AES-CTR" },
            false,
            ["encrypt", "decrypt"]
        );
    }),

    encrypt: flow(function *encrypt() {
        // Encrypt the cleartext
        const iv = yield self.crypto.getRandomValues(new Uint8Array(16));
        const ciphertext = yield self.crypto.subtle.encrypt({
            name: "AES-CTR",
            counter: iv,
            length: 128 // 2^16*128 = 1MB
        }, this.symmetricKey, utils.stringToUint8Array(this.cleartext).buffer);

        this.ciphertext = ciphertext;
        this.iv = iv;
        this.cleartextLen = this.cleartext.length;
    }),

    sendCiphertext: flow(function *sendCiphertext() {
        const apiResponse = yield ecdhApi.sendCiphertext(
            this.ciphertext,
            this.iv,
        );

        // Store server response
        this.response = apiResponse.response;
    }),

    decrypt: flow(function *decrypt() {

        // Encrypt the cleartext
        const iv = utils.stringToUint8Array(atob(this.response.iv));
        const cleartextArrayBuffer = yield self.crypto.subtle.decrypt({
            name: "AES-CTR",
            counter: iv,
            length: 128 // In bits
        }, this.symmetricKey, utils.stringToUint8Array(atob(this.response.serverCiphertext)).buffer);

        this.serverCleartext = utils.uint8ArrayToString(new Uint8Array(cleartextArrayBuffer));
    }),

    // Methods
    updateStorage: function() {
        localStorage.setItem('ecdh.serverPublicKey', JSON.stringify(this.keys.serverKeys.publicKey));
        localStorage.setItem('ecdh.publicKey', JSON.stringify(this.keys.clientKeys.publicKey));
        localStorage.setItem('ecdh.privateKey', JSON.stringify(this.keys.clientKeys.privateKey));

        location.reload();
    },

    cleanStorage: function() {
        localStorage.removeItem('ecdh.serverPublicKey');
        localStorage.removeItem('ecdh.publicKey');
        localStorage.removeItem('ecdh.privateKey');

        location.reload();
    }
});
