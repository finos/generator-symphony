const keypair = require('keypair');
const fs = require('fs');

class RsaKeyPairCreator {
    constructor(username) {
        this.username = username;
    }

    create() {
        let pair = keypair({'bits': 4096});
        const rsa_folder = 'rsa';

        fs.mkdirSync(rsa_folder)
        fs.writeFileSync(rsa_folder + "/" + "rsa-public-" + this.username + ".pem", pair.public);
        fs.writeFileSync(rsa_folder + "/" + "rsa-private-" + this.username + ".pem", pair.private);
    }
}
module.exports = RsaKeyPairCreator;
