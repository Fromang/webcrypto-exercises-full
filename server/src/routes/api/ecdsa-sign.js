const router = require('express').Router();
const crypto = require("crypto");
const jwk2pem = require('jwk-to-pem');

const config = require('../../config');


router.post('/verify/:key', (req, res) => {
    // Read the key
    const encodedKey = req.params.key;
    const jwkKey = JSON.parse(Buffer.from(encodedKey, "base64").toString());
    const pemKey = jwk2pem(jwkKey);

    // Generate a message
    const verify = crypto.createVerify('SHA256');
    verify.write(req.body.message);
    verify.end();

    const signature = Buffer.from(req.body.sign, "base64");
    const correct = verify.verify(pemKey, signature);

    res.send({
        message: `The signature is ${correct ? " " : "not "}correct`
    });
});


module.exports = router;
