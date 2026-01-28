/**
 * MOCK USER SERVICE - Simuliert Backend-API für lokale Entwicklung
 * 
 * Dieser Service ersetzt userService.js für Tests ohne Backend
 */

// Variable für Keycloak-Instanz (wird von außen gesetzt)
let keycloakInstance = null;

/**
 * Keycloak-Instanz setzen
 * Diese Methode muss beim App-Start aufgerufen werden
 * @param {Object} keycloak - Die Keycloak-Instanz aus useKeycloak()
 */
export const setKeycloakInstance = (keycloak) => {
    keycloakInstance = keycloak;
};

// Mock-Daten für Benutzer
const mockUsers = [
    {
        userUid: '1',
        username: 'max.mustermann',
        firstName: 'Max',
        lastName: 'Mustermann',
        mail: 'max.mustermann@example.com',
        organisations: [
            {
                orgUid: 'org1',
                orgName: 'IT-Abteilung',
                deleted: false,
                roles: [
                    { roleUid: 'role1', roleName: 'Administrator' },
                    { roleUid: 'role2', roleName: 'Developer' }
                ]
            },
            {
                orgUid: 'org2',
                orgName: 'Marketing',
                deleted: false,
                roles: [
                    { roleUid: 'role3', roleName: 'Editor' }
                ]
            }
        ]
    },
    {
        userUid: '2',
        username: 'anna.schmidt',
        firstName: 'Anna',
        lastName: 'Schmidt',
        mail: 'anna.schmidt@example.com',
        organisations: [
            {
                orgUid: 'org2',
                orgName: 'Marketing',
                deleted: false,
                roles: [
                    { roleUid: 'role3', roleName: 'Editor' },
                    { roleUid: 'role4', roleName: 'Content Manager' }
                ]
            }
        ]
    },
    {
        userUid: '3',
        username: 'peter.mueller',
        firstName: 'Peter',
        lastName: 'Müller',
        mail: 'peter.mueller@example.com',
        organisations: [
            {
                orgUid: 'org1',
                orgName: 'IT-Abteilung',
                deleted: false,
                roles: [
                    { roleUid: 'role2', roleName: 'Developer' }
                ]
            },
            {
                orgUid: 'org3',
                orgName: 'Vertrieb',
                deleted: false,
                roles: [
                    { roleUid: 'role5', roleName: 'Sales Manager' }
                ]
            },
            {
                orgUid: 'org4',
                orgName: 'Support',
                deleted: false,
                roles: [
                    { roleUid: 'role6', roleName: 'Support Agent' }
                ]
            }
        ]
    },
    {
        userUid: '4',
        username: 'lisa.wagner',
        firstName: 'Lisa',
        lastName: 'Wagner',
        mail: 'lisa.wagner@example.com',
        organisations: [
            {
                orgUid: 'org3',
                orgName: 'Vertrieb',
                deleted: false,
                roles: [
                    { roleUid: 'role5', roleName: 'Sales Manager' },
                    { roleUid: 'role7', roleName: 'Account Manager' }
                ]
            }
        ]
    },
    {
        userUid: '5',
        username: 'tom.weber',
        firstName: 'Tom',
        lastName: 'Weber',
        mail: 'tom.weber@example.com',
        organisations: [
            {
                orgUid: 'org4',
                orgName: 'Support',
                deleted: false,
                roles: [
                    { roleUid: 'role6', roleName: 'Support Agent' }
                ]
            }
        ]
    }
];

// Mock-Organisationen
const mockOrganisations = [
    { uuid: 'org1', label: 'IT-Abteilung' },
    { uuid: 'org2', label: 'Marketing' },
    { uuid: 'org3', label: 'Vertrieb' },
    { uuid: 'org4', label: 'Support' }
];

// Mock-Rollen
const mockRoles = [
    { uuid: 'role1', label: 'Administrator' },
    { uuid: 'role2', label: 'Developer' },
    { uuid: 'role3', label: 'Editor' },
    { uuid: 'role4', label: 'Content Manager' },
    { uuid: 'role5', label: 'Sales Manager' },
    { uuid: 'role6', label: 'Support Agent' },
    { uuid: 'role7', label: 'Account Manager' }
];

// Simuliert API-Delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const mockUserService = {
    /**
     * Alle Benutzer abrufen
     */
    getUsers: async (params = {}) => {
        await delay();
        return {
            content: mockUsers,
            totalElements: mockUsers.length
        };
    },

    /**
     * Einzelnen Benutzer nach ID abrufen
     */
    getUserById: async (userId) => {
        await delay();
        const user = mockUsers.find(u => u.userUid === userId);
        if (!user) {
            throw new Error('Benutzer nicht gefunden');
        }
        return { content: user };
    },

    /**
     * Alle Organisationen abrufen
     */
    getOrganisations: async () => {
        await delay();
        return mockOrganisations;
    },

    /**
     * Alle Rollen abrufen
     */
    getRoles: async () => {
        await delay();
        return mockRoles;
    },

    /**
     * Benutzer erstellen
     */
    createUser: async (userData) => {
        await delay();

        // Transformiere die Organisationen im richtigen Format
        const organisations = userData.organisations?.map(org => {
            // Finde die Organisation in mockOrganisations um den Namen zu bekommen
            const orgData = mockOrganisations.find(o => o.uuid === org.orgUid);

            return {
                orgUid: org.orgUid,
                orgName: orgData ? orgData.label : org.orgName || 'Unbekannt',
                deleted: false,
                roles: org.roles?.map(role => {
                    // Finde die Rolle in mockRoles um den Namen zu bekommen
                    const roleData = mockRoles.find(r => r.uuid === role.roleUid);
                    return {
                        roleUid: role.roleUid,
                        roleName: roleData ? roleData.label : role.roleName || 'Unbekannt'
                    };
                }) || []
            };
        }) || [];

        const newUser = {
            userUid: `user-${Date.now()}`,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            mail: userData.mail,
            organisations: organisations
        };

        mockUsers.push(newUser);
        console.log('Mock: Benutzer erstellt', newUser);
        return { content: newUser };
    },

    /**
     * Benutzer aktualisieren
     */
    updateUser: async (userId, userData) => {
        await delay();
        const index = mockUsers.findIndex(u => u.userUid === userId);
        if (index === -1) {
            throw new Error('Benutzer nicht gefunden');
        }

        // Transformiere die Organisationen im richtigen Format
        const organisations = userData.organisations?.map(org => {
            // Finde die Organisation in mockOrganisations um den Namen zu bekommen
            const orgData = mockOrganisations.find(o => o.uuid === org.orgUid);

            return {
                orgUid: org.orgUid,
                orgName: orgData ? orgData.label : org.orgName || 'Unbekannt',
                deleted: false,
                roles: org.roles?.map(role => {
                    // Finde die Rolle in mockRoles um den Namen zu bekommen
                    const roleData = mockRoles.find(r => r.uuid === role.roleUid);
                    return {
                        roleUid: role.roleUid,
                        roleName: roleData ? roleData.label : role.roleName || 'Unbekannt'
                    };
                }) || []
            };
        }) || [];

        // Aktualisiere den Benutzer mit den neuen Daten
        mockUsers[index] = {
            ...mockUsers[index],
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            mail: userData.mail,
            organisations: organisations
        };

        console.log('Mock: Benutzer aktualisiert', mockUsers[index]);
        return { content: mockUsers[index] };
    },

    /**
     * Benutzer löschen
     */
    deleteUser: async (userId) => {
        await delay();
        const index = mockUsers.findIndex(u => u.userUid === userId);
        if (index === -1) {
            throw new Error('Benutzer nicht gefunden');
        }
        mockUsers.splice(index, 1);
        return { success: true };
    }
};

export default mockUserService;
