class App {

    constructor() {
        this.$registrationSection = document.querySelector('#registration-section');
        this.$contactsSection = document.querySelector('#contacts-section');
        this.$chatSection = document.querySelector('#chat-section');

        this.$registrationForm = this.$registrationSection.querySelector('#reg-form');
        this.$registrationUsername = this.$registrationForm.querySelector('#reg-username');
        this.$registrationPassword = this.$registrationForm.querySelector('#reg-password');

        this.$contactList = this.$contactsSection.querySelector('#contact-list');
        this.$refreshContactListBtn = this.$contactsSection.querySelector('#refresh-contact-list-btn');

        this.$recipientName = this.$chatSection.querySelector('#recipient-name');
        this.$refreshMessagesBtn = this.$chatSection.querySelector('#refresh-messages-btn');
        this.$chatHistoryContainer = this.$chatSection.querySelector('#chat-history');
        this.$chatMessage = this.$chatSection.querySelector('#chat-input > input');
        this.$sendMessageBtn = this.$chatSection.querySelector('#chat-input button');

        this._adapter = new ActionAdapter();

        this._currentUser = null;
        this._currentChatPartner = null;

        this._addEventListeners();
        this._showRegistration();
    }

    _addEventListeners() {
        this.$registrationForm.addEventListener('submit', (e) => {
            e.preventDefault(); // prevent form submitting

            let username = this.$registrationUsername.value;
            let password = this.$registrationPassword.value;
            this._adapter.register(username, password)
                .then(user => {
                    this._setCurrentUser(user);
                    return this._updateContactList();
                })
                .then(() => {
                    this._showContacts();
                });
        });

        this.$sendMessageBtn.addEventListener('click', () => {
            let message = this.$chatMessage.value;
            this._adapter.encrypt(message, this._currentChatPartner)
                .then((ciphertext) => {
                    return this._adapter.sendMessage(this._currentUser, ciphertext);
                })
                .then((s) => {
                    this._addMessageBubble(message);
                });
        });

        this.$refreshContactListBtn.addEventListener('click', () => {
            this._updateContactList();
        });

        this.$refreshMessagesBtn.addEventListener('click', () => {
            this._updateMessagesOfCurrentChatPartner();
        });
    }

    _setCurrentUser(user) {
        this._currentUser = user;
    }

    _setCurrentChatPartner(user) {
        this._currentChatPartner = user;
    }

    _updateContactList() {
        this._adapter.loadAllUsers()
            .then(userList => {
                this.$contactList.innerHTML = '';
                userList
                    .filter(user => user.name !== this._currentUser.name)
                    .forEach(user => {
                        let listItem = document.createElement('a');
                        listItem.href = '#';
                        listItem.className = 'list-group-item list-group-item-action';
                        listItem.dataset.id = user.id;
                        listItem.dataset.name = user.name;
                        listItem.dataset.registrationId = user.registrationId;

                        let label = document.createTextNode(user.name);
                        listItem.appendChild(label);

                        listItem.addEventListener('click', (event) => {
                            this._openChatForUser({
                                id: event.target.dataset.id,
                                name: event.target.dataset.name,
                                registrationId: event.target.dataset.registrationId
                            });
                        });

                        this.$contactList.appendChild(listItem);
                    });
            });
    }

    _openChatForUser(user) {
        this._adapter.loadUserById(user.id)
            .then(user => {
                this._setCurrentChatPartner(user);
                return this._adapter.createSession(user);
            })
            .then(() => {
                this._showChat();
            });
    }

    _updateMessagesOfCurrentChatPartner() {
        this._adapter.loadUnreadMessages(this._currentUser, this._currentChatPartner)
            .then(messages => {
                let promises = messages.map(message => this._adapter.decrypt(message, this._currentChatPartner));
                return Promise.all(promises);
            })
            .then(decryptedMessages => {
                decryptedMessages.forEach(message => {
                    this._addMessageBubble(message, true);
                });
            });
    }

    _addMessageBubble(message, isRemoteMessage = false) {
        let bubbleContainer = document.createElement('div');
        bubbleContainer.className = isRemoteMessage ? 'message-bubble float-left' : 'message-bubble float-right';
        let messageContainer = document.createElement('div');
        messageContainer.className = isRemoteMessage ? 'alert alert-light' : 'alert alert-primary';
        let content = document.createTextNode(message);

        let clearfix = document.createElement('div');
        clearfix.className = 'clearfix';

        messageContainer.appendChild(content);
        bubbleContainer.appendChild(messageContainer);

        this.$chatHistoryContainer.appendChild(bubbleContainer);
        this.$chatHistoryContainer.scrollTop = this.$chatHistoryContainer.scrollHeight;
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