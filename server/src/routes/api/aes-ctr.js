const router = require('express').Router();
const crypto = require("crypto");

const config = require('../../config');


router.post('/message', (req, res, next) => {
    const secret = Buffer.from("Don\'t tell this to anybody!");
    const inputIv = Buffer.from(req.body.iv, "base64");


    crypto.scrypt(secret, Buffer.from('salt'), 32, async (err, key) => {
        if(err) {
            console.log(err);
            throw new Error("Error generating symmetric key");
        }

        let cleartext;
        const decipher = crypto.createDecipheriv("aes-256-ctr", key, inputIv);

        cleartext = decipher.update(req.body.ciphertext, 'base64', 'utf-8');
        cleartext += decipher.final('utf-8');

        console.log(`Decrypted message: ${cleartext}`);

        const serverCleartext = cleartext.split('').reverse().join('');
        console.log(`Respond with message: ${serverCleartext}`);

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);

        let serverCiphertext = cipher.update(serverCleartext, 'utf8', 'base64')
        serverCiphertext += cipher.final('base64');

        res.send({
            serverCiphertext,
            iv: iv.toString('base64')
        });
    });

});

module.exports = router;
