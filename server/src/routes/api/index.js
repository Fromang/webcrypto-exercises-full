const router = require('express').Router();


router.use('/example', require('./example'));

// El primer parametro es la ruta relativa al enrutador que incorpore a este y el segundo es
// el enrutador que acabamos de crear
router.use('/rsa-encrypt', require('./rsa-encrypt'));
router.use('/ecdsa-sign', require('./ecdsa-sign'));
router.use('/aes-ctr', require('./aes-ctr'));
router.use('/ecdh', require('./ecdh'));

module.exports = router;
