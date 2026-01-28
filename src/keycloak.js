/**
 * KEYCLOAK.JS - Keycloak-Konfiguration
 * 
 * Diese Datei konfiguriert die Keycloak-Authentifizierung für die Anwendung
 */

import Keycloak from 'keycloak-js'

/**
 * Keycloak-Instanz mit Konfiguration
 * Passe die Werte entsprechend deiner Keycloak-Installation an
 */
const keycloak = new Keycloak({
    url: 'http://localhost:8080', // Deine Keycloak-URL
    realm: 'your-realm', // Dein Keycloak-Realm
    clientId: 'your-client-id' // Deine Keycloak Client-ID
})

export default keycloak
