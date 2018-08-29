// STORE should actually be a static variable of class SignalWrapper. Since static class members are not possible with
// ES6 yet, it is defined outside the class.
var STORE = undefined;

/**
 * Class that wraps signal specific methods.
 */
class SignalWrapper {

    constructor() {
        this.keyHelper = libsignal.KeyHelper;
        if (!STORE) {
            STORE = new SignalProtocolStore();
        }
    }

    generateIdentity() {
        return Promise.all([
            this.keyHelper.generateIdentityKeyPair(),
            this.keyHelper.generateRegistrationId(),
        ]).then(result => {
            return Promise.all([
                STORE.put('identityKey', result[0]),
                STORE.put('registrationId', result[1])
            ]);
        });
    }

    generatePreKeyBundle(signedPreKeyId) {
        return Promise.all([
            STORE.getIdentityKeyPair(),
            STORE.getLocalRegistrationId()
        ]).then(result => {
            let identity = result[0];
            let registrationId = result[1];

            const onetimePrekeyPromises = [];
            // important to begin at 1 instead of 0, because of libsignal-protocol.js line 36119!
            for (let keyId = 1; keyId < 6; keyId++) { // in this case, 5 prekeys will be generated.
                onetimePrekeyPromises.push(this.keyHelper.generatePreKey(keyId));
            }

            return Promise.all([
                this.keyHelper.generateSignedPreKey(identity, signedPreKeyId),
                ...onetimePrekeyPromises
            ]).then(keys => {
                let signedPreKey = keys[0];
                STORE.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);

                let preKeys = keys.slice(1);
                let preKeysPublicOnly = preKeys.map((preKey) => {
                    return {
                        keyId: preKey.keyId,
                        publicKey: preKey.keyPair.pubKey
                    }
                });
                preKeys.forEach(preKey => STORE.storePreKey(preKey.keyId, preKey.keyPair));

                return {
                    identityKey: identity.pubKey,
                    registrationId: registrationId,
                    preKeys: preKeysPublicOnly,
                    signedPreKey: {
                        keyId: signedPreKeyId,
                        publicKey: signedPreKey.keyPair.pubKey,
                        signature: signedPreKey.signature
                    }
                };
            });
        });
    }

    createSession(user) {
        let builder = new libsignal.SessionBuilder(STORE, this._getUserAddress(user.name));

        let keyBundle = {
            identityKey: signalUtil.base64ToArrayBuffer(user.identityKey), // public key
            registrationId: user.registrationId,
            signedPreKey: {
                keyId: user.signedPreKeyId,
                publicKey: signalUtil.base64ToArrayBuffer(user.pubSignedPreKey),
                signature: signalUtil.base64ToArrayBuffer(user.signature)
            }
        };

        if (user.preKey) {  // prekeys are optional!
            keyBundle.preKey = {
                keyId: user.preKey.keyId,
                publicKey: signalUtil.base64ToArrayBuffer(user.preKey.pubPreKey)
            }
        }

        return builder.processPreKey(keyBundle);
    }

    encrypt(message, recipient) {
        let sessionCipher = new libsignal.SessionCipher(STORE, this._getUserAddress(recipient.name));
        let messageAsArrayBuffer = signalUtil.toArrayBuffer(message);
        return sessionCipher.encrypt(messageAsArrayBuffer);
    }

    decrypt(message, sender) {
        let ciphertext = signalUtil.base64ToArrayBuffer(message.body);
        let messageType = message.type;

        let sessionCipher = new libsignal.SessionCipher(STORE, this._getUserAddress(sender.name));

        let decryptPromise;
        if (messageType === 3) { // 3 = PREKEY_BUNDLE
            // Decrypt a PreKeyWhisperMessage by first establishing a new session
            // The session will be set up automatically by libsignal.
            // The information to do that is delivered within the message's ciphertext.
            decryptPromise = sessionCipher.decryptPreKeyWhisperMessage(ciphertext, 'binary');
        } else {
            // Decrypt a normal message using an existing session
            decryptPromise = sessionCipher.decryptWhisperMessage(ciphertext, 'binary');
        }

        return decryptPromise
            .then(decryptedText => {
                message.body = signalUtil.toString(decryptedText);
                return message;
            });
    }

    _getUserAddress(username) {
        return new libsignal.SignalProtocolAddress(username, 0); // deviceId is always 0 for the demo
    }

    preKeyBundleToBase64(bundle) {
        bundle.identityKey = signalUtil.arrayBufferToBase64(bundle.identityKey);
        bundle.preKeys.forEach(preKey => {
            preKey.publicKey = signalUtil.arrayBufferToBase64(preKey.publicKey);
        });
        bundle.signedPreKey.publicKey = signalUtil.arrayBufferToBase64(bundle.signedPreKey.publicKey);
        bundle.signedPreKey.signature = signalUtil.arrayBufferToBase64(bundle.signedPreKey.signature);
        return bundle;
    }

}