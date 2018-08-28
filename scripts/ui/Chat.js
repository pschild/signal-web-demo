/**
 * Class defining the chat view.
 */
class Chat {

    constructor(app) {
        this.$section = document.querySelector('#chat-section');

        this.$recipientName = this.$section.querySelector('#recipient-name');
        this.$refreshMessagesBtn = this.$section.querySelector('#refresh-messages-btn');
        this.$chatHistoryContainer = this.$section.querySelector('#chat-history');
        this.$chatMessage = this.$section.querySelector('#chat-input > input');
        this.$sendMessageBtn = this.$section.querySelector('#send-message-btn');
        this.$backToContactsBtn = this.$section.querySelector('#back-to-contacts-btn');

        this._adapter = new ActionAdapter();
        this._app = app;

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
            // encrypt message
            this._adapter.encrypt(message, this._app.getCurrentChatPartner())
                .then((ciphertext) => {
                    // send message to server
                    return this._adapter.sendMessage(this._app.getCurrentUser(), ciphertext);
                })
                .then(() => {
                    // add sent message directly to UI
                    this._addMessageBubble({
                        body: message,
                        timestamp: new Date() // now
                    });
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
        this._adapter.loadUnreadMessages(this._app.getCurrentUser(), this._app.getCurrentChatPartner())
            .then(messages => {
                // decrypt all messages
                let promises = messages.map(message => this._adapter.decrypt(message, this._app.getCurrentChatPartner()));
                return Promise.all(promises);
            })
            .then(decryptedMessages => {
                decryptedMessages.forEach(message => {
                    // add each decrypted message to UI
                    this._addMessageBubble(message, true);
                });
            });
    }

    _addMessageBubble(messageObject, isRemoteMessage = false) {
        let bubbleContainer = document.createElement('div');
        bubbleContainer.className = isRemoteMessage ? 'message-bubble float-left' : 'message-bubble float-right';
        let messageContainer = document.createElement('div');
        messageContainer.className = isRemoteMessage ? 'alert alert-light' : 'alert alert-primary';

        let messageContent = document.createTextNode(messageObject.body);

        let datetimeLabel = document.createElement('div');
        datetimeLabel.className = 'datetime-label';
        let dateTimeContent = document.createTextNode(new Date(messageObject.timestamp).toLocaleString());

        datetimeLabel.appendChild(dateTimeContent);
        messageContainer.appendChild(datetimeLabel);
        messageContainer.appendChild(messageContent);
        bubbleContainer.appendChild(messageContainer);
        this.$chatHistoryContainer.appendChild(bubbleContainer);

        this.$chatHistoryContainer.scrollTop = this.$chatHistoryContainer.scrollHeight;
    }

    show() {
        this.$recipientName.innerHTML = this._app.getCurrentChatPartner().name;
        this.$chatHistoryContainer.innerHTML = '';

        this.$section.style.display = 'block';
    }

    hide() {
        this.$section.style.display = 'none';
    }

}