/**
 * Class for serving an interface between UI and Signal specific functions.
 */
class ActionAdapter {

    constructor() {
        this.wrapper = new SignalWrapper();
        this.api = new Api();
    }

    register(username, password) {
        return this.wrapper
            .generateIdentity(username) // password has no use for Signal
            .then(() => {
                return this.wrapper.generatePreKeyBundle(signalUtil.randomId());
            })
            .then(preKeyBundle => {
                return this.api.registerUser({
                    username: username,
                    preKeyBundle: this.wrapper.preKeyBundleToBase64(preKeyBundle)
                });
            });
    }

    loadAllUsers() {
        return this.api.loadAllUsers();
    }

    loadUserById(id) {
        return this.api.loadUserById(id);
    }

    createSession(user) {
        return this.wrapper.createSession(user);
    }

    encrypt(message, recipient) {
        return this.wrapper.encrypt(message, recipient);
    }

    decrypt(message, sender) {
        return this.wrapper.decrypt(message, sender);
    }

    sendMessage(sender, encryptedMessage) {
        encryptedMessage.body = signalUtil.toArrayBuffer(encryptedMessage.body);
        encryptedMessage.body = signalUtil.arrayBufferToBase64(encryptedMessage.body);
        return this.api.sendMessage(sender, encryptedMessage);
    }

    loadUnreadMessages(recipient, sender) {
        return this.api.loadUnreadMessages(recipient, sender);
    }

}