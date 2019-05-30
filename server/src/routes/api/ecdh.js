const router = require('express').Router();
const Eckles = require('eckles');
const crypto = require("crypto");


const globals = {
    serverKeys: {
        privateKey: undefined,
        publicKey: undefined
    },
    clientKeys: {
        publicKey: undefined
    },
    sharedSecret: undefined
}


router.get('/keys', (req, res) => {
    // Generate keys
    const keys = crypto.generateKeyPairSync('ec', {
        namedCurve: 'P-384',
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'sec1',
            format: 'pem'
        },
    })

    globals.serverKeys.privateKey = keys.privateKey;
    globals.serverKeys.publicKey = keys.publicKey;

    // Convert formats
    const publicKey = Eckles.importSync({
        pem: keys.publicKey,
        format: 'jwk',
        public: true
    });

    res.json({
        publicKey
    });
});


router.post('/upload-public-key', (req, res) => {
    const publicKey = Eckles.exportSync({
        jwk: req.body,
        format: 'spki',
        public: true
    })
    globals.clientKeys.publicKey = publicKey;
    console.log("Public key uploaded", publicKey);
    res.send();
});

router.post('/', (req, res) => {
    const clientKey = Buffer.from(req.body.publicKey, "base64");

    // Generate a message
    const verify = crypto.createVerify('SHA256');
    verify.write(clientKey);
    verify.end();

    const signature = Buffer.from(req.body.signature, "base64");
    const correct = verify.verify(globals.clientKeys.publicKey, signature);

    if(!correct) {
        res.json({
            error: `The signature is not correct`
        })
    }

    console.log("The signature is valid. Let's generate the shared secret");

    const server = crypto.createECDH('secp384r1');
    const serverKey = server.generateKeys();

    // Exchange and generate the secret...
    global.sharedSecret = server.computeSecret(clientKey).subarray(0, 32);
    console.log(global.sharedSecret.toString("hex"));

    const sign = crypto.createSign("SHA256");
    sign.write(serverKey);
    sign.end();

    const serverSignature = sign.sign({
        key: globals.serverKeys.privateKey
    }, 'base64');

    res.json({
        publicKey: serverKey.toString("base64"),
        signature: serverSignature,
    });
});

router.post('/ciphertext', (req, res) => {
    const inputIv = Buffer.from(req.body.iv, "base64");

    let cleartext;
    const decipher = crypto.createDecipheriv("aes-256-ctr", global.sharedSecret, inputIv);

    cleartext = decipher.update(req.body.ciphertext, 'base64', 'utf-8');
    cleartext += decipher.final('utf-8');

    console.log(`Decrypted message: ${cleartext}`);

    const serverCleartext = cleartext.split('').reverse().join('');
    console.log(`Respond with message: ${serverCleartext}`);

    const responseIv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-ctr", global.sharedSecret, responseIv);

    let serverCiphertext = cipher.update(serverCleartext, 'utf8', 'base64')
    serverCiphertext += cipher.final('base64');

    res.send({
        serverCiphertext,
        iv: responseIv.toString('base64')
    });
});

module.exports = router;
