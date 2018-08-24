class App {

    constructor() {
        this.$registrationSection = document.querySelector('#registration-section');
        this.$contactsSection = document.querySelector('#contacts-section');
        this.$chatSection = document.querySelector('#chat-section');

        this.$registrationForm = document.querySelector('#reg-form');
        this.$registrationUsername = this.$registrationForm.querySelector('#reg-username');
        this.$registrationPassword = this.$registrationForm.querySelector('#reg-password');

        this.adapter = new ActionAdapter();

        this._addEventListeners();
        this._showRegistration();
    }

    _addEventListeners() {
        this.$registrationForm.addEventListener('submit', (e) => {
            e.preventDefault(); // prevent form submitting

            let username = this.$registrationUsername.value;
            let password = this.$registrationPassword.value;
            this.adapter.register(username, password)
                .then(() => {
                    this._showContacts();
                });
        });
    }

    _showRegistration() {
        this.$registrationSection.style.display = 'block';

        this.$contactsSection.style.display = 'none';
        this.$chatSection.style.display = 'none';
    }

    _showContacts() {
        this.$contactsSection.style.display = 'block';

        this.$registrationSection.style.display = 'none';
        this.$chatSection.style.display = 'none';
    }

    _showChat() {
        this.$chatSection.style.display = 'block';

        this.$registrationSection.style.display = 'none';
        this.$contactsSection.style.display = 'none';
    }
}