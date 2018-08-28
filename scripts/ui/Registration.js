/**
 * Class defining the registration view.
 */
class Registration {

    constructor() {
        this.$section = document.querySelector('#registration-section');

        this.$registrationForm = this.$section.querySelector('#reg-form');
        this.$registrationUsername = this.$registrationForm.querySelector('#reg-username');

        this._adapter = new ActionAdapter();

        this._registrationCallback = undefined;

        this._addEventListeners();
    }

    _addEventListeners() {
        this.$registrationForm.addEventListener('submit', (e) => {
            e.preventDefault(); // prevent form submitting

            let username = this.$registrationUsername.value;
            let password = ''; // for Signal, there is no password needed for registration
            this._adapter.register(username, password).then(user => this._registrationCallback(user));
        });
    }

    setRegistrationCallback(callbackFn) {
        this._registrationCallback = callbackFn;
    }

    show() {
        this.$section.style.display = 'block';
    }

    hide() {
        this.$section.style.display = 'none';
    }

}