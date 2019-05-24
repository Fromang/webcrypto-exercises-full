const path = require("path");
const fs = require("fs");


const rootDir = path.resolve(__dirname, "..");
module.exports = {
    rootDir,

    key:  fs.readFileSync(path.resolve(rootDir, 'private/privkey.default.key')),
    pubkey: fs.readFileSync(path.resolve(rootDir, 'public/pubkey.default.key'))
};
