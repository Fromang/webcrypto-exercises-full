const router = require('express').Router();


router.use('/example', require('./example'));

// El primer parametro es la ruta relativa al enrutador que incorpore a este y el segundo es
// el enrutador que acabamos de crear
router.use('/rsa-encrypt', require('./rsa-encrypt'));

module.exports = router;
