class ActionAdapter {

    constructor() {
        this.wrapper = new SignalWrapper();
    }

    register(username, password) {
        return this.wrapper
            .generateIdentity(username) // password has no use for Signal
            .then(() => {
                return this.wrapper.generatePreKeyBundle(signalUtil.randomId());
            })
        ;
    }

    encrypt() {

    }

    decrypt() {

    }

}