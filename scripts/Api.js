/**
 * Class containing methods to communicate with the server via REST-API.
 */
class Api {

    constructor() {
        this.BASE_URL = 'localhost';
        this.PORT = 8081;
        this.API_URL = `http://${this.BASE_URL}:${this.PORT}`;
    }

    registerUser(data) {
        return axios({
            method: 'post',
            url: `${this.API_URL}/user`,
            data: {
                username: data.username,
                preKeyBundle: data.preKeyBundle,
            }
        })
            .then(response => response.data.user)
            .catch(error => {
                throw new Error(`Fehler bei der Registrierung: ${error.message}`);
            });
    }

    loadAllUsers() {
        return axios({method: 'get', url: `${this.API_URL}/users`})
            .then(response => response.data)
            .catch(error => {
                throw new Error(`Fehler beim Laden aller User: ${error.message}`);
            });
    }

    loadUserById(id) {
        return axios({method: 'get', url: `${this.API_URL}/user/${id}`})
            .then(response => response.data)
            .catch(error => {
                throw new Error(`Fehler beim Laden des User mit ID ${id}: ${error.message}`);
            });
    }

    sendMessage(sender, encryptedMessage) {
        return axios({
            method: 'post',
            url: `${this.API_URL}/message`,
            data: {
                sourceRegistrationId: sender.registrationId,
                recipientRegistrationId: encryptedMessage.registrationId,
                body: encryptedMessage.body,
                type: encryptedMessage.type
            }
        })
            .catch(error => {
                throw new Error(`Fehler beim Senden einer Nachricht: ${error.message}`);
            });
    }

    loadUnreadMessages(recipient, sender) {
        return axios({method: 'get', url: `${this.API_URL}/messages/${sender.registrationId}/${recipient.registrationId}`})
            .then(response => response.data)
            .catch(error => {
                throw new Error(`Fehler beim Laden der ungelesenen Nachrichten: ${error.message}`);
            });
    }

}