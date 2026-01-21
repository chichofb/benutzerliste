/**
 * BENUTZERFORMSTEPPER.JSX - Mehrstufiges Formular zum Erstellen und Bearbeiten von Benutzern
 * 
 * 4-Schritte-Prozess:
 * 1. Organisationen auswählen (mehrere möglich)
 * 2. Rollen pro Organisation zuweisen
 * 3. Persönliche Informationen eingeben
 * 4. Übersicht und Bestätigung
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Box,
    Alert,
    CircularProgress,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Paper,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Business as BusinessIcon,
    Badge as BadgeIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import userService from '../services/userService';

const steps = ['Organisationen', 'Rollen zuweisen', 'Persönliche Daten', 'Übersicht'];

const BenutzerFormStepper = ({ open, onClose, onSuccess, editUser = null }) => {
    // ========== STATE-VERWALTUNG ==========

    // Aktueller Schritt (0-3)
    const [activeStep, setActiveStep] = useState(0);

    // Ausgewählte Organisationen (Array von {id, label})
    const [selectedOrganisations, setSelectedOrganisations] = useState([]);

    // Temporäre Organisation für Selectbox
    const [tempOrgId, setTempOrgId] = useState('');

    // Rollen pro Organisation ({orgId: [roleId1, roleId2, ...]})
    const [organisationRoles, setOrganisationRoles] = useState({});

    // Persönliche Daten
    const [personalData, setPersonalData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        mail: '',
        phone: ''
    });

    // Verfügbare Daten von API
    const [availableOrganisations, setAvailableOrganisations] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);

    // Ladezustände
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);

    // Fehler und Validierung
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);

    // ========== LIFECYCLE ==========

    useEffect(() => {
        if (open) {
            fetchOrganisations();
            fetchRoles();
        }
    }, [open]);

    useEffect(() => {
        if (open && editUser) {
            loadEditUser();
        } else if (open && !editUser) {
            resetForm();
        }
    }, [open, editUser]);

    // ========== API-AUFRUFE ==========

    const fetchOrganisations = async () => {
        setDataLoading(true);
        try {
            const orgs = await userService.getOrganisations();
            // API gibt uuid statt id zurück - transformieren
            const transformedOrgs = Array.isArray(orgs)
                ? orgs.map(org => ({ id: org.uuid || org.id, label: org.label }))
                : [];
            setAvailableOrganisations(transformedOrgs);
        } catch (err) {
            console.error('Fehler beim Laden der Organisationen:', err);
            setError('Organisationen konnten nicht geladen werden');
        } finally {
            setDataLoading(false);
        }
    };

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
            setError('Rollen konnten nicht geladen werden');
        }
    };

    // ========== FORM-VERWALTUNG ==========

    const resetForm = () => {
        setActiveStep(0);
        setSelectedOrganisations([]);
        setTempOrgId('');
        setOrganisationRoles({});
        setPersonalData({
            username: '',
            firstname: '',
            lastname: '',
            mail: '',
            phone: ''
        });
        setErrors({});
        setError(null);
    };

    const loadEditUser = () => {
        if (!editUser) return;

        // Persönliche Daten laden
        setPersonalData({
            userUid: editUser.userUid || '',
            username: editUser.username || '',
            firstname: editUser.firstName || '',
            lastname: editUser.lastName || '',
            mail: editUser.mail || '',
            phone: editUser.phone || ''
        });

        // Organisationen und Rollen laden
        if (editUser.organisations && Array.isArray(editUser.organisations)) {
            const activeOrgs = editUser.organisations.filter(org => !org.deleted);
            const orgs = activeOrgs.map(org => ({ id: org.orgUid, label: org.orgName }));
            setSelectedOrganisations(orgs);

            const roles = {};
            activeOrgs.forEach(org => {
                if (org.roles && Array.isArray(org.roles)) {
                    roles[org.orgUid] = org.roles.map(role => role.roleId);
                }
            });
            setOrganisationRoles(roles);
        }
    };

    // ========== SCHRITT-NAVIGATION ==========

    const handleNext = () => {
        if (validateCurrentStep()) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const validateCurrentStep = () => {
        setErrors({});

        switch (activeStep) {
            case 0: // Organisationen
                if (selectedOrganisations.length === 0) {
                    setError('Bitte wählen Sie mindestens eine Organisation aus');
                    return false;
                }
                break;
            case 1: // Rollen
                for (const org of selectedOrganisations) {
                    if (!organisationRoles[org.id] || organisationRoles[org.id].length === 0) {
                        setError(`Bitte weisen Sie der Organisation "${org.label}" mindestens eine Rolle zu`);
                        return false;
                    }
                }
                break;
            case 2: // Persönliche Daten
                const newErrors = {};
                if (!personalData.username?.trim()) newErrors.username = 'Benutzername ist erforderlich';
                if (!personalData.firstname?.trim()) newErrors.firstname = 'Vorname ist erforderlich';
                if (!personalData.lastname?.trim()) newErrors.lastname = 'Nachname ist erforderlich';
                if (!personalData.mail?.trim()) {
                    newErrors.mail = 'E-Mail ist erforderlich';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.mail)) {
                    newErrors.mail = 'Ungültige E-Mail-Adresse';
                }

                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return false;
                }
                break;
        }

        setError(null);
        return true;
    };

    // ========== SCHRITT 1: ORGANISATIONEN ==========

    const handleAddOrganisation = () => {
        if (!tempOrgId) return;

        const org = availableOrganisations.find(o => o.id === tempOrgId);
        if (!org) return;

        // Prüfen ob bereits ausgewählt
        if (selectedOrganisations.some(o => o.id === org.id)) {
            setError('Diese Organisation wurde bereits hinzugefügt');
            return;
        }

        setSelectedOrganisations(prev => [...prev, org]);
        setTempOrgId(''); // Selectbox zurücksetzen
        setError(null);
    };

    const handleRemoveOrganisation = (orgId, event) => {
        if (event) {
            event.stopPropagation();
        }
        setSelectedOrganisations(prev => prev.filter(o => o.id !== orgId));
        const newRoles = { ...organisationRoles };
        delete newRoles[orgId];
        setOrganisationRoles(newRoles);
    };

    // ========== SCHRITT 2: ROLLEN ==========

    const handleToggleRole = (orgId, roleId, event) => {
        if (event) {
            event.stopPropagation();
        }
        setOrganisationRoles(prev => {
            const orgRoles = prev[orgId] || [];
            const hasRole = orgRoles.includes(roleId);

            return {
                ...prev,
                [orgId]: hasRole
                    ? orgRoles.filter(id => id !== roleId)
                    : [...orgRoles, roleId]
            };
        });
    };

    // ========== SCHRITT 3: PERSÖNLICHE DATEN ==========

    const handlePersonalDataChange = (e) => {
        const { name, value } = e.target;
        setPersonalData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // ========== SUBMIT ==========

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            // Payload aufbauen
            const payload = {
                ...personalData,
                organisations: selectedOrganisations.map(org => ({
                    orgUid: org.id,
                    roles: (organisationRoles[org.id] || []).map(roleId => ({ roleId }))
                }))
            };

            console.log('Payload:', payload);

            if (editUser) {
                await userService.updateUser(payload);
            } else {
                await userService.createUser(payload);
            }

            onSuccess();
            handleClose();
        } catch (err) {
            console.error('Fehler beim Speichern:', err);
            setError(err.response?.data?.message || 'Fehler beim Speichern des Benutzers');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // ========== RENDER: STEP CONTENT ==========

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return renderOrganisationsStep();
            case 1:
                return renderRolesStep();
            case 2:
                return renderPersonalDataStep();
            case 3:
                return renderOverviewStep();
            default:
                return null;
        }
    };

    // Organisation direkt per Klick auswählen/abwählen
    const handleToggleOrganisation = (org) => {
        const isSelected = selectedOrganisations.some(o => o.id === org.id);
        if (isSelected) {
            // Entfernen
            setSelectedOrganisations(prev => prev.filter(o => o.id !== org.id));
            const newRoles = { ...organisationRoles };
            delete newRoles[org.id];
            setOrganisationRoles(newRoles);
        } else {
            // Hinzufügen
            setSelectedOrganisations(prev => [...prev, org]);
        }
        setError(null);
    };

    // Schritt 1: Organisationen auswählen
    const renderOrganisationsStep = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#4169E1', fontWeight: 700 }}>
                Wählen Sie Organisationen aus
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                Der Benutzer kann mehreren Organisationen zugeordnet werden. Klicken Sie auf eine Organisation, um sie auszuwählen.
            </Typography>

            {dataLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Organisationen als klickbare Karten */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {availableOrganisations.map((org) => {
                            const isSelected = selectedOrganisations.some(o => o.id === org.id);
                            return (
                                <Grid item xs={12} sm={6} md={4} key={org.id}>
                                    <Box
                                        onClick={() => handleToggleOrganisation(org)}
                                        sx={{
                                            p: 2,
                                            border: isSelected ? '2px solid #4169E1' : '2px solid #E0E0E0',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            backgroundColor: isSelected ? 'rgba(65, 105, 225, 0.08)' : '#FFF',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: '#4169E1',
                                                backgroundColor: 'rgba(65, 105, 225, 0.08)',
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <BusinessIcon sx={{ color: isSelected ? '#4169E1' : '#666', mr: 1 }} />
                                                <Typography variant="body1" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                                                    {org.label}
                                                </Typography>
                                            </Box>
                                            {isSelected && <CheckCircleIcon sx={{ color: '#4169E1', fontSize: 24 }} />}
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {selectedOrganisations.length > 0 && (
                        <Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#4169E1' }}>
                                Ausgewählte Organisationen ({selectedOrganisations.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {selectedOrganisations.map((org) => (
                                    <Chip
                                        key={org.id}
                                        label={org.label}
                                        onDelete={(e) => handleRemoveOrganisation(org.id, e)}
                                        color="primary"
                                        sx={{ fontWeight: 600 }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );

    // Schritt 2: Rollen zuweisen
    const renderRolesStep = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#4169E1', fontWeight: 700 }}>
                Rollen zuweisen
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                Weisen Sie jeder Organisation die passenden Rollen zu.
            </Typography>

            {selectedOrganisations.map((org, index) => (
                <Paper key={org.id} sx={{ p: 3, mb: 2, border: '2px solid rgba(65, 105, 225, 0.2)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BusinessIcon sx={{ color: '#4169E1', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4169E1' }}>
                            {org.label}
                        </Typography>
                    </Box>

                    <Grid container spacing={1}>
                        {availableRoles.map((role) => {
                            const isSelected = (organisationRoles[org.id] || []).includes(role.id);
                            return (
                                <Grid item xs={12} sm={6} md={4} key={role.id}>
                                    <Box
                                        onClick={(e) => handleToggleRole(org.id, role.id, e)}
                                        sx={{
                                            p: 1.5,
                                            border: isSelected ? '2px solid #4169E1' : '2px solid #E0E0E0',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            backgroundColor: isSelected ? 'rgba(65, 105, 225, 0.08)' : '#FFF',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: '#4169E1',
                                                backgroundColor: 'rgba(65, 105, 225, 0.08)',
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                                                {role.label}
                                            </Typography>
                                            {isSelected && <CheckCircleIcon sx={{ color: '#4169E1', fontSize: 20 }} />}
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {(organisationRoles[org.id] || []).length === 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Bitte wählen Sie mindestens eine Rolle aus
                        </Alert>
                    )}
                </Paper>
            ))}
        </Box>
    );

    // Schritt 3: Persönliche Daten
    const renderPersonalDataStep = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#4169E1', fontWeight: 700 }}>
                Persönliche Informationen
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                Geben Sie die persönlichen Daten des Benutzers ein.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        name="username"
                        label="Benutzername"
                        value={personalData.username}
                        onChange={handlePersonalDataChange}
                        error={!!errors.username}
                        helperText={errors.username}
                        required
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1, color: '#4169E1', fontWeight: 600 }}>@</Typography>
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="firstname"
                        label="Vorname"
                        value={personalData.firstname}
                        onChange={handlePersonalDataChange}
                        error={!!errors.firstname}
                        helperText={errors.firstname}
                        required
                        InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, color: '#4169E1' }} />
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="lastname"
                        label="Nachname"
                        value={personalData.lastname}
                        onChange={handlePersonalDataChange}
                        error={!!errors.lastname}
                        helperText={errors.lastname}
                        required
                        InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, color: '#4169E1' }} />
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="mail"
                        label="E-Mail"
                        type="email"
                        value={personalData.mail}
                        onChange={handlePersonalDataChange}
                        error={!!errors.mail}
                        helperText={errors.mail}
                        required
                        InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: '#4169E1' }} />
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="phone"
                        label="Telefon"
                        value={personalData.phone}
                        onChange={handlePersonalDataChange}
                        InputProps={{
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: '#4169E1' }} />
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );

    // Schritt 4: Übersicht
    const renderOverviewStep = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#4169E1', fontWeight: 700 }}>
                Übersicht und Bestätigung
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                Bitte überprüfen Sie alle Angaben vor dem Speichern.
            </Typography>

            {/* Persönliche Daten */}
            <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#4169E1' }}>
                    Persönliche Daten
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">Benutzername</Typography>
                        <Typography variant="body1" fontWeight={600}>@{personalData.username}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Vorname</Typography>
                        <Typography variant="body1" fontWeight={600}>{personalData.firstname}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Nachname</Typography>
                        <Typography variant="body1" fontWeight={600}>{personalData.lastname}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">E-Mail</Typography>
                        <Typography variant="body1" fontWeight={600}>{personalData.mail}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Telefon</Typography>
                        <Typography variant="body1" fontWeight={600}>{personalData.phone || '-'}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Organisationen & Rollen */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#4169E1' }}>
                    Organisationen & Rollen
                </Typography>
                {selectedOrganisations.map((org) => {
                    const roles = (organisationRoles[org.id] || [])
                        .map(roleId => availableRoles.find(r => r.id === roleId))
                        .filter(Boolean);

                    return (
                        <Box key={org.id} sx={{ mb: 2, p: 2, backgroundColor: 'rgba(65, 105, 225, 0.04)', borderRadius: 2 }}>
                            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                                {org.label}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {roles.map((role) => (
                                    <Chip
                                        key={role.id}
                                        label={role.label}
                                        size="small"
                                        sx={{ backgroundColor: '#4169E1', color: '#FFF', fontWeight: 600 }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    );
                })}
            </Paper>
        </Box>
    );

    // ========== MAIN RENDER ==========

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minHeight: '80vh'
                }
            }}
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)',
                color: 'white',
                py: 3
            }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {editUser ? 'Benutzer bearbeiten' : 'Neuen Benutzer anlegen'}
                </Typography>
            </DialogTitle>

            <Box sx={{ px: 3, pt: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <DialogContent sx={{ px: 4, py: 3, minHeight: 400 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {renderStepContent()}
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 3, pt: 2, gap: 2 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    startIcon={<CloseIcon />}
                    sx={{ color: '#666' }}
                >
                    Abbrechen
                </Button>

                <Box sx={{ flex: 1 }} />

                {activeStep > 0 && (
                    <Button
                        onClick={handleBack}
                        disabled={loading}
                        startIcon={<ArrowBackIcon />}
                        variant="outlined"
                    >
                        Zurück
                    </Button>
                )}

                {activeStep < steps.length - 1 ? (
                    <Button
                        onClick={handleNext}
                        disabled={loading}
                        endIcon={<ArrowForwardIcon />}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)',
                        }}
                    >
                        Weiter
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
                        }}
                    >
                        {loading ? 'Speichern...' : 'Speichern'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default BenutzerFormStepper;
