class App {

    constructor() {
        this._adapter = new ActionAdapter();

        this._currentUser = null;
        this._currentChatPartner = null;

        // chat view
        this.chatView = new Chat(this); // TODO
        this.chatView.setBackButtonClickCallback(() => this._showContacts());

        // contact list view
        this.contactListView = new ContactList(this); // TODO
        this.contactListView.setListItemClickCallback(user => {
            this._adapter.loadUserById(user.id)
                .then(user => {
                    this._setCurrentChatPartner(user);
                    return this._adapter.createSession(user);
                })
                .then(() => {
                    this._showChat();
                });
        });
        this.contactListView.setBackButtonClickCallback(() => this._showRegistration());

        // registration view
        this.registrationView = new Registration();
        this.registrationView.setRegistrationCallback(user => {
            this._setCurrentUser(user);
            this.contactListView.updateContactList().then(() => this._showContacts());
        });

        this._showRegistration();
    }

    _setCurrentUser(user) {
        this._currentUser = user;
    }

    _setCurrentChatPartner(user) {
        this._currentChatPartner = user;
    }

    _showRegistration() {
        this.registrationView.show();
        this.contactListView.hide();
        this.chatView.hide();
    }

    _showContacts() {
        this.registrationView.hide();
        this.contactListView.show();
        this.chatView.hide();
    }

    _showChat() {
        this.registrationView.hide();
        this.contactListView.hide();
        this.chatView.show();
    }
}