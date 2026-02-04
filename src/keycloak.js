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
    url: 'http://app2/auth', // Deine Keycloak-URL
    realm: 'entwicklungstest', // Dein Keycloak-Realm
    clientId: 'frontend' // Deine Keycloak Client-ID
})

export default keycloak
