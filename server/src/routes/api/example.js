const router = require('express').Router();
const { fortune } = require('fortune-teller');

let i = 0;


router.get('', (req, res) => {
    res.json({
        id: i++,
        message: fortune()
    });
});

module.exports = router;
