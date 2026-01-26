/**
 * BENUTZERLISTE.JSX - Haupt-Tabellen-Komponente
 * 
 * Diese Komponente verwaltet:
 * - Anzeige aller Benutzer in einer Tabelle
 * - Suchfunktion nach Name/Email/Benutzername
 * - Filterung nach Organisationen
 * - Anzeige von Benutzerdetails in einem Modal
 * - Löschen von Benutzern mit Bestätigungsdialog
 * - Kommunikation mit dem Backend über userService
 */

import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Box,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    InputAdornment,
    Tooltip,
    Chip,
    Typography
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Search as SearchIcon, Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
// import userService from '../services/userService';
import userService from '../services/mockUserService';  // Mock-Daten für lokale Tests ohne Backend
import BenutzerDetail from './BenutzerDetail';
import BenutzerFormStepper from './BenutzerFormStepper';

const Benutzerliste = () => {
    // ========== STATE-VERWALTUNG ==========

    // Vollständige Benutzerliste (ungefiltert)
    const [allUsers, setAllUsers] = useState([]);

    // Gefilterte Benutzerdaten für Anzeige
    const [users, setUsers] = useState([]);

    // Ladezustand während API-Anfragen
    const [loading, setLoading] = useState(false);

    // Fehlermeldungen für API-Fehler
    const [error, setError] = useState(null);

    // Suchbegriff für Name/Email-Suche
    const [searchTerm, setSearchTerm] = useState('');

    // Ausgewählte Organisation für Filterung
    const [organisationFilter, setOrganisationFilter] = useState('');

    // Aktuell ausgewählter Benutzer für Detailansicht
    const [selectedUser, setSelectedUser] = useState(null);

    // Status des Detail-Dialogs (offen/geschlossen)
    const [detailOpen, setDetailOpen] = useState(false);

    // Status des Lösch-Bestätigungsdialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // ID des zu löschenden Benutzers
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // Liste aller verfügbaren Organisationen (für Filter-Dropdown)
    const [organisations, setOrganisations] = useState([]);

    // Liste aller verfügbaren Rollen (für Filter-Dropdown)
    const [availableRoles, setAvailableRoles] = useState([]);

    // Ausgewählte Rolle für Filterung
    const [roleFilter, setRoleFilter] = useState('');

    // Status des Formular-Dialogs (offen/geschlossen)
    const [formOpen, setFormOpen] = useState(false);

    // Benutzer für Bearbeitung (null = neuer Benutzer erstellen)
    const [editingUser, setEditingUser] = useState(null);

    /**
     * useEffect: Wird beim ersten Laden der Komponente ausgeführt
     * - Lädt alle Benutzer vom Backend
     * - Lädt alle verfügbaren Organisationen
     * - Lädt alle verfügbaren Rollen
     */
    useEffect(() => {
        fetchUsers();              // Benutzer vom Backend laden
        fetchOrganisations();      // Organisationen vom Backend laden
        fetchRoles();              // Alle verfügbaren Rollen laden
    }, []); // Leeres Array [] bedeutet: nur einmal beim Komponentenstart ausführen

    // ========== API-KOMMUNIKATION ==========

    /**
     * Benutzer vom Backend laden
     * @param {Object} params - Optionale Suchparameter für die API
     * 
     * Diese Funktion:
     * 1. Setzt den Ladezustand
     * 2. Ruft die API über userService auf
     * 3. Verarbeitet verschiedene Antwortformate (HAL, Array, Content)
     * 4. Extrahiert und speichert die Benutzerdaten
     * 5. Extrahiert die Organisationen für den Filter
     */
    const fetchUsers = async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            // API-Aufruf über userService
            const response = await userService.getUsers(params);
            console.log('API Response:', response);

            // ===== Verschiedene API-Antwortformate verarbeiten =====
            let userList = [];

            if (response._embedded && response._embedded.users) {
                userList = response._embedded.users;
            }
            else if (Array.isArray(response)) {
                userList = response;
            }
            else if (response.content && Array.isArray(response.content)) {
                userList = response.content;
            }

            console.log('Extracted users:', userList);
            const userArray = Array.isArray(userList) ? userList : [];
            setAllUsers(userArray);  // Vollständige Liste speichern
            setUsers(userArray);      // Gefilterte Liste initial gleich
        } catch (err) {
            setError('Fehler beim Laden der Benutzer');
            console.error('Error details:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Alle verfügbaren Organisationen vom Backend laden
     */
    const fetchOrganisations = async () => {
        try {
            const orgs = await userService.getOrganisations();
            // API gibt [{uuid, label}] zurück, wir brauchen nur die Labels für Filter
            const orgLabels = Array.isArray(orgs) ? orgs.map(org => org.label) : [];
            setOrganisations(orgLabels.sort());
        } catch (err) {
            console.error('Fehler beim Laden der Organisationen:', err);
            setOrganisations([]);
        }
    };

    /**
     * Alle verfügbaren Rollen vom Backend laden
     */
    const fetchRoles = async () => {
        try {
            const roles = await userService.getRoles();
            // API gibt uuid statt id zurück - transformieren
            const transformedRoles = Array.isArray(roles)
                ? roles.map(role => ({ id: role.uuid || role.id, label: role.label }))
                : [];
            setAvailableRoles(transformedRoles);
        } catch (err) {
            console.error('Fehler beim Laden der Rollen:', err);
            setAvailableRoles([]);
        }
    };

    // ========== SUCH- UND FILTER-FUNKTIONEN ==========

    /**
     * Handler für Name/Email/Benutzername-Suche
     * @param {Event} e - Input-Change-Event
     * 
     * Wird bei jeder Eingabe im Suchfeld aufgerufen
     */
    const handleNameSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        applyFilters(value, organisationFilter, roleFilter);
    };

    /**
     * Handler für Organisations-Filter
     * @param {Event} e - Select-Change-Event
     * 
     * Wird aufgerufen, wenn eine Organisation im Dropdown ausgewählt wird.
     */
    const handleOrganisationFilter = (e) => {
        const value = e.target.value;
        setOrganisationFilter(value);
        applyFilters(searchTerm, value, roleFilter);
    };

    /**
     * Handler für Rollen-Filter
     * @param {Event} e - Select-Change-Event
     * 
     * Wird aufgerufen, wenn eine Rolle im Dropdown ausgewählt wird.
     */
    const handleRoleFilter = (e) => {
        const value = e.target.value;
        setRoleFilter(value);
        applyFilters(searchTerm, organisationFilter, value);
    };

    /**
     * Alle Filter gleichzeitig anwenden
     * @param {string} nameFilter - Suchbegriff für Name/Email/Username
     * @param {string} orgFilter - Ausgewählte Organisation
     * @param {string} roleFilterValue - Ausgewählte Rolle
     * 
     * Diese Funktion kombiniert alle Filter:
     * 1. Suche nach Name/Email/Username (Case-insensitive)
     * 2. Filterung nach Organisation
     * 3. Filterung nach Rolle
     * 
     * WICHTIG: Filter werden CLIENT-SEITIG angewendet!
     */
    const applyFilters = (nameFilter, orgFilter, roleFilterValue) => {
        // Wenn keine Filter aktiv sind, vollständige Liste anzeigen
        if (!nameFilter && !orgFilter && !roleFilterValue) {
            setUsers(allUsers);
            return;
        }

        // WICHTIG: Immer auf der vollständigen Liste filtern!
        let filtered = allUsers;

        // ===== Name/Email/Username-Filter =====
        if (nameFilter) {
            const searchLower = nameFilter.toLowerCase();  // Kleinbuchstaben für Case-Insensitive-Suche

            filtered = filtered.filter(user =>
                // Suche in verschiedenen Feldern (Vorname, Nachname, Username, Email)
                (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
                (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
                (user.username && user.username.toLowerCase().includes(searchLower)) ||
                (user.mail && user.mail.toLowerCase().includes(searchLower))
            );
        }

        // ===== Organisations-Filter =====
        if (orgFilter) {
            filtered = filtered.filter(user =>
                user.organisations &&
                user.organisations.some(org => !org.deleted && org.orgName === orgFilter)
            );
        }

        // ===== Rollen-Filter =====
        if (roleFilterValue) {
            filtered = filtered.filter(user =>
                user.organisations &&
                user.organisations.some(org =>
                    !org.deleted && org.roles && org.roles.some(role => role.roleName === roleFilterValue)
                )
            );
        }

        setUsers(filtered);
    };

    // ========== DETAIL-ANSICHT FUNKTIONEN ==========

    /**
     * Benutzerdetails in Modal anzeigen
     * @param {string} userId - UUID des anzuzeigenden Benutzers
     * 
     * Diese Funktion:
     * 1. Lädt vollständige Benutzerdaten vom Backend
     * 2. Öffnet das Detail-Modal
     * 3. Zeigt die Daten in der BenutzerDetail-Komponente an
     */
    const handleViewDetails = async (userId) => {
        try {
            const response = await userService.getUserById(userId);

            const userData = response.content || response;

            setSelectedUser(userData);
            setDetailOpen(true);
        } catch (err) {
            setError('Fehler beim Laden der Benutzerdetails');
        }
    };

    /**
     * Detail-Modal schließen und State zurücksetzen
     */
    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedUser(null);
    };

    // ========== LÖSCH-FUNKTIONEN ==========

    /**
     * Lösch-Bestätigungsdialog öffnen
     * @param {string} userId - UUID des zu löschenden Benutzers
     * 
     * Öffnet einen Bestätigungsdialog, bevor der Benutzer
     * tatsächlich gelöscht wird (Best Practice: Sicherheitsabfrage)
     */
    const handleOpenDeleteDialog = (userId) => {
        setDeleteTargetId(userId);
        setDeleteDialogOpen(true);
    };

    /**
     * Lösch-Bestätigungsdialog schließen ohne zu löschen
     */
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
    };

    /**
     * Benutzer endgültig löschen (nach Bestätigung)
     * 
     * Diese Funktion:
     * 1. Sendet DELETE-Request an Backend
     * 2. Entfernt Benutzer aus der lokalen Liste (UI-Update)
     * 3. Schließt den Bestätigungsdialog
     * 4. Zeigt Fehlermeldung bei Problemen
     */
    const handleConfirmDelete = async () => {
        try {
            // API-Aufruf zum Löschen
            await userService.deleteUser(deleteTargetId);

            setUsers(users.filter(user => user.userUid !== deleteTargetId));

            handleCloseDeleteDialog();

            setError(null);
        } catch (err) {
            setError('Fehler beim Löschen des Benutzers');
            console.error(err);
        }
    };

    // ========== CREATE/EDIT-FUNKTIONEN ==========

    /**
     * Formular zum Erstellen eines neuen Benutzers öffnen
     */
    const handleOpenCreateForm = () => {
        setEditingUser(null);
        setFormOpen(true);
    };

    /**
     * Formular zum Bearbeiten eines Benutzers öffnen
     * @param {Object} user - Zu bearbeitender Benutzer
     */
    const handleOpenEditForm = (user) => {
        setEditingUser(user);
        setFormOpen(true);
    };

    /**
     * Formular schließen und State zurücksetzen
     */
    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingUser(null);
    };

    /**
     * Nach erfolgreichem Speichern: Benutzerliste neu laden
     */
    const handleFormSuccess = () => {
        fetchUsers();
        handleCloseForm();
    };

    if (loading && users.length === 0) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)',
            width: '100%',
            overflow: 'hidden'
        }}>
            {/* Filter Card mit "Neuer Benutzer"-Button */}
            <Box sx={{ mb: 2, mx: 2, mt: 2, display: 'flex', gap: 2, alignItems: 'flex-start', flexShrink: 0 }}>
                <Card sx={{ flex: 1, p: 3, background: 'linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%)', borderLeft: '4px solid #4169E1' }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Benutzer suchen"
                            placeholder="Name, Email, Benutzername..."
                            value={searchTerm}
                            onChange={handleNameSearch}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#4169E1', mr: 1 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <Tooltip title="Filter löschen">
                                            <Button
                                                size="small"
                                                onClick={() => handleNameSearch({ target: { value: '' } })}
                                                sx={{ minWidth: 'auto', p: 0 }}
                                            >
                                                <CloseIcon sx={{ fontSize: 18 }} />
                                            </Button>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#4169E1',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#4169E1',
                                        boxShadow: '0 0 0 3px rgba(65, 105, 225, 0.1)',
                                    },
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Nach Organisation filtern"
                            value={organisationFilter}
                            onChange={handleOrganisationFilter}
                            variant="outlined"
                            size="small"
                            SelectProps={{
                                native: true,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#4169E1',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#4169E1',
                                        boxShadow: '0 0 0 3px rgba(65, 105, 225, 0.1)',
                                    },
                                },
                            }}
                        >
                            <option value=""> </option>
                            {organisations.map((org) => (
                                <option key={org} value={org}>
                                    {org}
                                </option>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            select
                            label="Nach Rolle filtern"
                            value={roleFilter}
                            onChange={handleRoleFilter}
                            variant="outlined"
                            size="small"
                            SelectProps={{
                                native: true,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#4169E1',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#4169E1',
                                        boxShadow: '0 0 0 3px rgba(65, 105, 225, 0.1)',
                                    },
                                },
                            }}
                        >
                            <option value=""></option>
                            {availableRoles.map((role, index) => (
                                <option key={role.id || `role-${index}`} value={role.label}>
                                    {role.label}
                                </option>
                            ))}
                        </TextField>
                    </Box>
                </Card>

                {/* Button "Neuer Benutzer" */}
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateForm}
                        sx={{
                            height: '100%',
                            minHeight: 56,
                            px: 3,
                            background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #45A049 0%, #388E3C 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Neuer Benutzer
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2, mx: 2, borderRadius: 1 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            {loading && users.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#4169E1' }} />
                </Box>
            ) : (
                <TableContainer
                    component={Paper}
                    sx={{
                        boxShadow: '0 4px 12px rgba(65, 105, 225, 0.12)',
                        borderRadius: 0,
                        overflow: 'auto',
                        flex: 1,
                        mx: 2,
                        mb: 2
                    }}
                >
                    <Table sx={{ minWidth: 750 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#4169E1' }}>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Benutzername</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Vorname</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Nachname</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Email</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Organisationen & Rollen</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>Aktionen</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#9E9E9E' }}>
                                        <Box sx={{ fontSize: 14 }}>Keine Benutzer gefunden</Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user, index) => {
                                    // Get all active (not deleted) organizations
                                    const activeOrgs = user.organisations?.filter(org => !org.deleted) || [];

                                    return (
                                        <TableRow
                                            key={user.userUid}
                                            hover
                                            sx={{
                                                backgroundColor: index % 2 === 0 ? '#F5F7FA' : '#FFFFFF',
                                                '&:hover': {
                                                    backgroundColor: '#E8EEF7',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 600, color: '#4169E1' }}>@{user.username || '-'}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{user.firstName || '-'}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{user.lastName || '-'}</TableCell>
                                            <TableCell sx={{ color: '#4169E1', fontSize: 13 }}>{user.mail || '-'}</TableCell>
                                            <TableCell>
                                                {activeOrgs.length > 0 ? (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                                        {activeOrgs.slice(0, 2).map((org, orgIdx) => (
                                                            <Box
                                                                key={`${user.userUid}-org-${orgIdx}`}
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    alignItems: 'center',
                                                                    gap: 0.5,
                                                                    p: 0.8,
                                                                    backgroundColor: '#F9FAFB',
                                                                    borderRadius: 1,
                                                                    border: '1px solid #E5E7EB'
                                                                }}
                                                            >
                                                                <Chip
                                                                    label={org.orgName}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: '#FF9800',
                                                                        color: '#FFFFFF',
                                                                        fontWeight: 700,
                                                                        height: 22,
                                                                    }}
                                                                />
                                                                {org.roles && org.roles.length > 0 ? (
                                                                    org.roles.map((role, roleIdx) => (
                                                                        <Chip
                                                                            key={`${user.userUid}-org-${orgIdx}-role-${roleIdx}`}
                                                                            label={role.roleName}
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: '#4169E1',
                                                                                color: '#FFFFFF',
                                                                                fontWeight: 600,
                                                                                height: 22,
                                                                            }}
                                                                        />
                                                                    ))
                                                                ) : (
                                                                    <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: 11 }}>
                                                                        Keine Rollen
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        ))}
                                                        {activeOrgs.length > 2 && (
                                                            <Chip
                                                                label={`+${activeOrgs.length - 2} weitere`}
                                                                size="small"
                                                                onClick={() => handleViewDetails(user.userUid)}
                                                                sx={{
                                                                    backgroundColor: '#E0E0E0',
                                                                    color: '#666',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer',
                                                                    width: 'fit-content',
                                                                    '&:hover': {
                                                                        backgroundColor: '#D0D0D0',
                                                                    },
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" sx={{ color: '#9E9E9E' }}>-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Details anzeigen">
                                                        <Button
                                                            size="small"
                                                            startIcon={<VisibilityIcon />}
                                                            onClick={() => handleViewDetails(user.userUid)}
                                                            variant="outlined"
                                                            sx={{
                                                                color: '#4169E1',
                                                                borderColor: '#4169E1',
                                                                '&:hover': {
                                                                    backgroundColor: '#E8EEF7',
                                                                    borderColor: '#2E4CB8',
                                                                },
                                                            }}
                                                        >
                                                            Details
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Benutzer bearbeiten">
                                                        <Button
                                                            size="small"
                                                            startIcon={<EditIcon />}
                                                            onClick={() => handleOpenEditForm(user)}
                                                            variant="outlined"
                                                            sx={{
                                                                color: '#FF9800',
                                                                borderColor: '#FF9800',
                                                                '&:hover': {
                                                                    backgroundColor: '#FFF3E0',
                                                                    borderColor: '#F57C00',
                                                                },
                                                            }}
                                                        >
                                                            Bearbeiten
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Benutzer löschen">
                                                        <Button
                                                            size="small"
                                                            startIcon={<DeleteIcon />}
                                                            color="error"
                                                            variant="outlined"
                                                            onClick={() => handleOpenDeleteDialog(user.userUid)}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: '#FFEBEE',
                                                                },
                                                            }}
                                                        >
                                                            Löschen
                                                        </Button>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Detail View Modal */}
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)', color: '#FFFFFF', fontWeight: 700 }}>
                    Benutzerdetails
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedUser && <BenutzerDetail user={selectedUser} />}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #E0E0E0', p: 2 }}>
                    <Button onClick={handleCloseDetail} sx={{ color: '#666' }}>
                        Schließen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle sx={{ fontWeight: 700, color: '#D32F2F' }}>
                    Benutzer löschen?
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={{ color: '#666' }}>
                        Abbrechen
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)' }}>
                        Löschen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Formular für Create/Edit mit Stepper */}
            <BenutzerFormStepper
                open={formOpen}
                onClose={handleCloseForm}
                onSuccess={handleFormSuccess}
                editUser={editingUser}
            />
        </Box>
    );
};

export default Benutzerliste;