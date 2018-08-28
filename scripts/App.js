/**
 * Class for handling the app's state and views.
 */
class App {

    constructor() {
        this._adapter = new ActionAdapter();

        // the app's state
        this._currentUser = null;
        this._currentChatPartner = null;

        // create chat view
        this.chatView = new Chat(this);
        this.chatView.setBackButtonClickCallback(() => this._showContacts());

        // create contact list view
        this.contactListView = new ContactList(this);
        this.contactListView.setListItemClickCallback(user => {
            this._adapter.loadUserById(user.id)
                .then(user => {
                    this.setCurrentChatPartner(user);
                    return this._adapter.createSession(user);
                })
                .then(() => {
                    this._showChat();
                });
        });
        this.contactListView.setBackButtonClickCallback(() => this._showRegistration());

        // create registration view
        this.registrationView = new Registration();
        this.registrationView.setRegistrationCallback(user => {
            this.setCurrentUser(user);
            this.contactListView.updateContactList().then(() => this._showContacts());
        });

        // registration is shown at first load
        this._showRegistration();
    }

    setCurrentUser(user) {
        this._currentUser = user;
    }

    getCurrentUser() {
        return this._currentUser;
    }

    setCurrentChatPartner(user) {
        this._currentChatPartner = user;
    }

    getCurrentChatPartner() {
        return this._currentChatPartner;
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