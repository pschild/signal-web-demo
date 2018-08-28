/**
 * Class defining the contact list view.
 */
class ContactList {

    constructor(app) {
        this.$section = document.querySelector('#contacts-section');

        this.$contactList = this.$section.querySelector('#contact-list');
        this.$refreshContactListBtn = this.$section.querySelector('#refresh-contact-list-btn');
        this.$backToRegistrationBtn = this.$section.querySelector('#back-to-registration-btn');

        this._adapter = new ActionAdapter();
        this._app = app;

        this._listItemClickCallback = undefined;
        this._backButtonClickCallback = undefined;

        this._addEventListeners();
    }

    _addEventListeners() {
        this.$refreshContactListBtn.addEventListener('click', () => {
            this.updateContactList();
        });

        this.$backToRegistrationBtn.addEventListener('click', () => {
            this._backButtonClickCallback();
        });
    }

    setListItemClickCallback(callbackFn) {
        this._listItemClickCallback = callbackFn;
    }

    setBackButtonClickCallback(callbackFn) {
        this._backButtonClickCallback = callbackFn;
    }

    updateContactList() {
        return this._adapter.loadAllUsers()
            .then(userList => {
                this.$contactList.innerHTML = '';
                userList
                    // filter current user, so that he's not shown in the contacts list
                    .filter(user => user.name !== this._app.getCurrentUser().name)
                    .forEach(user => {
                        let listItem = document.createElement('a');
                        listItem.href = '#';
                        listItem.className = 'list-group-item list-group-item-action';
                        listItem.dataset.id = user.id;
                        listItem.dataset.name = user.name;
                        listItem.dataset.registrationId = user.registrationId;

                        let label = document.createTextNode(user.name);
                        listItem.appendChild(label);

                        // click event for each list item
                        listItem.addEventListener('click', (event) => {
                            this._listItemClickCallback({
                                id: event.target.dataset.id,
                                name: event.target.dataset.name,
                                registrationId: event.target.dataset.registrationId
                            });
                        });

                        this.$contactList.appendChild(listItem);
                    });
            });
    }

    show() {
        this.$section.style.display = 'block';
    }

    hide() {
        this.$section.style.display = 'none';
    }

}