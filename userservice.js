/**
 * USER SERVICE - API-Kommunikationsschicht
 * 
 * Diese Datei verwaltet alle HTTP-Anfragen zum Backend:
 * - CRUD-Operationen für Benutzer (Create, Read, Update, Delete)
 * - Axios-Konfiguration mit CORS-Unterstützung
 * - Keycloak-Token-Integration für Authentifizierung
 * - Fehlerbehandlung für API-Aufrufe
 */

import axios from 'axios';

// Basis-URL des Spring Boot Backend-Servers
const API_BASE_URL = 'http://localhost:8080/api';

// Variable für Keycloak-Instanz (wird von außen gesetzt)
let keycloakInstance = null;

// contextOrgUuid: wird vom Backend als Response-Header geschickt und bei jedem Request mitgesendet
let storedContextOrgUuid = '';

export const setContextOrgUuid = (uuid) => {
    storedContextOrgUuid = uuid;
};

/**
 * Keycloak-Instanz setzen
 * Diese Methode muss beim App-Start aufgerufen werden
 * @param {Object} keycloak - Die Keycloak-Instanz aus useKeycloak()
 */
export const setKeycloakInstance = (keycloak) => {
    keycloakInstance = keycloak;
};

/**
 * Konfigurierte Axios-Instanz für API-Anfragen
 * - baseURL: Automatisches Voranstellen der API-URL bei allen Anfragen
 * - headers: JSON-Content-Type für Request und Response
 * - withCredentials: Ermöglicht das Senden von Cookies für CORS-Anfragen
 */
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',  // Daten als JSON senden
        'Accept': 'application/json'          // JSON-Antworten erwarten
    },
    withCredentials: true  // Wichtig für Cross-Origin-Requests mit Authentifizierung
});

/**
 * Request Interceptor: Fügt Keycloak-Token zu jedem Request hinzu
 */
axiosInstance.interceptors.request.use(
    async (config) => {
        if (keycloakInstance && keycloakInstance.token) {
            // Token automatisch erneuern, wenn es bald abläuft (5 Sekunden vor Ablauf)
            try {
                await keycloakInstance.updateToken(5);
            } catch (error) {
                console.error('Token konnte nicht erneuert werden:', error);
                keycloakInstance.login();
            }

            // Bearer Token zu Authorization-Header hinzufügen
            config.headers.Authorization = `Bearer ${keycloakInstance.token}`;
        }
        // contextOrgUuid als Request-Header immer mitsenden
        config.headers['ignrw-context-org'] = storedContextOrgUuid;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor: Liest contextOrgUuid aus Response-Header und behandelt 401-Fehler
 */
axiosInstance.interceptors.response.use(
    (response) => {
        // contextOrgUuid aus Response-Header lesen (Axios gibt Header lowercase zurück)
        const headerValue = response.headers['contextorguuid'];
        if (headerValue) {
            storedContextOrgUuid = headerValue;
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401 && keycloakInstance) {
            // Bei 401 Fehler: Benutzer zur Anmeldung weiterleiten
            keycloakInstance.login();
        }
        return Promise.reject(error);
    }
);

/**
 * UserService-Objekt mit allen API-Methoden für Benutzerverwaltung
 */
const userService = {
    /**
     * Alle Benutzer abrufen mit optionalen Suchparametern
     * @param {Object} searchParams - Optional: Filter-Parameter für die Suche
     * @param {string} searchParams.searchUsernameOrLastname - Suche nach Username oder Nachname
     * @param {string} searchParams.orgUid - Organisation UID zum Filtern
     * @param {string} searchParams.roleName - Rollenname zum Filtern
     * @returns {Promise} Promise mit Benutzerdaten vom Server
     */
    getUsers: async (searchParams = {}, contextOrgUuid = '') => {
        try {
            const body = {
                searchMode: 'SUBSTRING'
            };

            if (searchParams.username) {
                body.username = searchParams.username;
            }

            if (searchParams.userUuid) {
                body.userUuid = searchParams.userUuid;
            }

            if (searchParams.searchUsernameOrLastname) {
                body.searchUsernameOrLastname = searchParams.searchUsernameOrLastname;
            }

            if (searchParams.orgUuid) {
                body.orgUuid = searchParams.orgUuid;
            }

            if (searchParams.roleIds && searchParams.roleIds.length > 0) {
                body.roleIds = searchParams.roleIds;
            }

            const response = await axiosInstance.post('/users/list', body);
            return response.data;
        } catch (error) {
            console.error('Fehler beim Abrufen der Benutzer:', error.response?.status, error.response?.data);
            throw error;
        }
    },

    /**
    * Alle verfügbaren Rollen abrufen
    * @returns {Promise} Promise mit Liste aller Rollen
    */
    getRoles: async () => {
        try {
            // GET-Request an /api/roles/select
            const response = await axiosInstance.get('/roles/select');
            return response.data.options || [];  // API gibt { options: [...] } zurück
        } catch (error) {
            console.error('Fehler beim Abrufen der Rollen:', error);
            throw error;
        }
    },

    /**
    * Eigene Organisationen des eingeloggten Users abrufen
    * @returns {Promise} Promise mit Liste der eigenen Organisationen
    */
    getMyOrganisations: async () => {
        try {
            const response = await axiosInstance.get('/me/organisations/select');
            return response.data.options || [];
        } catch (error) {
            console.error('Fehler beim Abrufen der eigenen Organisationen:', error);
            throw error;
        }
    },

    /**
    * Alle verfügbaren Organisationen abrufen
    * @returns {Promise} Promise mit Liste aller Organisationen
    */
    getOrganisations: async () => {
        try {
            // GET-Request an /api/organisations/select
            const response = await axiosInstance.get('/organisations/select');
            return response.data.options || [];  // API gibt { options: [{id, label}] } zurück
        } catch (error) {
            console.error('Fehler beim Abrufen der Organisationen:', error);
            throw error;
        }
    },

    /**
    * Alle verfügbaren Organisationstypen abrufen (z.B. Gemeinde, Stadt, etc.)
    * @returns {Promise} Promise mit Liste aller Organisationstypen
    */
    getOrganisationLevelTypes: async () => {
        try {
            // GET-Request an /api/organisations/leveltypes/select
            const response = await axiosInstance.get('/organisations/leveltypes/select');
            return response.data.options || [];  // API gibt { options: [{id, label}] } zurück
        } catch (error) {
            console.error('Fehler beim Abrufen der Organisationstypen:', error);
            throw error;
        }
    },

    /**
    * Alle verfügbaren Organisationsebenen abrufen (z.B. Aachen, Köln, etc.)
    * @returns {Promise} Promise mit Liste aller Organisationsebenen
    */
    getOrganisationLevels: async () => {
        try {
            // GET-Request an /api/organisations/level/select
            const response = await axiosInstance.get('/organisations/level/select');
            return response.data.options || [];  // API gibt { options: [{id, label}] } zurück
        } catch (error) {
            console.error('Fehler beim Abrufen der Organisationsebenen:', error);
            throw error;
        }
    },

    /**
     * Einzelnen Benutzer anhand der UUID abrufen
    * @param {string} userUuid - Eindeutige Benutzer-ID (UUID)
     * @returns {Promise} Promise mit Benutzerdetails
     */
    getUserById: async (userUuid) => {
        try {
            const response = await axiosInstance.get(`/users/${userUuid}`);
            return response.data;
        } catch (error) {
            console.error(`Fehler beim Abrufen von Benutzer ${userUuid}:`, error);
            throw error;
        }
    },

    /**
     * Neuen Benutzer erstellen
     * @param {Object} userData - Benutzerdaten (firstname, lastname, email, etc.)
     * @returns {Promise} Promise mit dem erstellten Benutzer
     */
    createUser: async (userData) => {
        try {
            const response = await axiosInstance.post('/users', userData);
            return response.data;
        } catch (error) {
            console.error('Fehler beim Erstellen des Benutzers:', error.response?.status, error.response?.data);
            throw error;
        }
    },

    /**
     * Bestehenden Benutzer aktualisieren
     * @param {Object} userData - Aktualisierte Benutzerdaten (muss userUid enthalten)
     * @returns {Promise} Promise mit dem aktualisierten Benutzer
     */
    updateUser: async (userData) => {
        try {
            const userUuid = userData.userUuid || userData.uuid || userData.id || userData.userUid || userData.userId;
            if (!userUuid) {
                throw new Error('userUuid ist erforderlich für Update-Operation');
            }
            const response = await axiosInstance.put(`/users/${userUuid}`, { ...userData, userUuid });
            return response.data;
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Benutzers:', error.response?.status, error.response?.data);
            throw error;
        }
    },

    /**
     * Benutzer löschen
     * @param {string} userUid - UUID des zu löschenden Benutzers
     * @returns {Promise} Promise mit Bestätigung des Löschvorgangs
     */
    deleteUser: async (userUid) => {
        try {
            // DELETE-Request an /api/users/{userUid}
            const response = await axiosInstance.delete(`/users/${userUid}`);
            return response.data;  // Gibt Bestätigung zurück
        } catch (error) {
            console.error(`Fehler beim Löschen von Benutzer ${userUid}:`, error);
            throw error;
        }
    }


};

export default userService;
