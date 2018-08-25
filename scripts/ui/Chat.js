class Chat {

    constructor(app) {
        this.$section = document.querySelector('#chat-section');

        this.$recipientName = this.$section.querySelector('#recipient-name');
        this.$refreshMessagesBtn = this.$section.querySelector('#refresh-messages-btn');
        this.$chatHistoryContainer = this.$section.querySelector('#chat-history');
        this.$chatMessage = this.$section.querySelector('#chat-input > input');
        this.$sendMessageBtn = this.$section.querySelector('#send-message-btn');
        this.$backToContactsBtn = this.$section.querySelector('#back-to-contacts-btn');

        this._adapter = new ActionAdapter(); // TODO
        this._app = app; // TODO

        this._backButtonClickCallback = undefined;

        this._addEventListeners();
    }

    _addEventListeners() {
        this.$sendMessageBtn.addEventListener('click', () => {
            let message = this.$chatMessage.value;
            if (!message || !message.length) {
                alert('Sie können keine leere Nachricht versenden.');
                return;
            }
            this._adapter.encrypt(message, this._app._currentChatPartner)
                .then((ciphertext) => {
                    return this._adapter.sendMessage(this._app._currentUser, ciphertext);
                })
                .then(() => {
                    this._addMessageBubble(message);
                });
        });

        this.$refreshMessagesBtn.addEventListener('click', () => {
            this._updateMessagesOfCurrentChatPartner();
        });

        this.$backToContactsBtn.addEventListener('click', () => {
            this._backButtonClickCallback();
        });
    }

    setBackButtonClickCallback(callbackFn) {
        this._backButtonClickCallback = callbackFn;
    }

    _updateMessagesOfCurrentChatPartner() {
        this._adapter.loadUnreadMessages(this._app._currentUser, this._app._currentChatPartner)
            .then(messages => {
                let promises = messages.map(message => this._adapter.decrypt(message, this._app._currentChatPartner));
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

    show() {
        this.$recipientName.innerHTML = this._app._currentChatPartner.name;
        this.$chatHistoryContainer.innerHTML = '';

        this.$section.style.display = 'block';
    }

    hide() {
        this.$section.style.display = 'none';
    }

}