/**
 * BENUTZERFORM.JSX - Formular zum Erstellen und Bearbeiten von Benutzern
 * 
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
    Divider
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Business as BusinessIcon,
    Badge as BadgeIcon
} from '@mui/icons-material';
// import userService from '../services/userService';
import userService from '../services/mockUserService';  // Mock-Daten für lokale Tests ohne Backend

/**
 * BenutzerForm-Komponente
 * @param {boolean} open - Ob das Formular-Dialog geöffnet ist
 * @param {Function} onClose - Callback wenn Dialog geschlossen wird
 * @param {Function} onSuccess - Callback wenn Benutzer erfolgreich gespeichert wurde
 * @param {Object} editUser - Benutzer-Objekt zum Bearbeiten (null für neuen Benutzer)
 */
const BenutzerForm = ({ open, onClose, onSuccess, editUser = null, contextOrgUuid = '' }) => {
    // ========== STATE-VERWALTUNG ==========

    // Formular-Daten
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        mail: '',
        phone: '',
        organisation: '',
        role: ''
    });

    // Validierungsfehler für einzelne Felder
    const [errors, setErrors] = useState({});

    // Ladezustand während API-Anfrage
    const [loading, setLoading] = useState(false);

    // Allgemeine Fehlermeldung
    const [error, setError] = useState(null);

    // Erfolgsmeldung
    const [success, setSuccess] = useState(false);

    // Liste aller verfügbaren Rollen vom Backend
    const [availableRoles, setAvailableRoles] = useState([]);

    // Liste aller verfügbaren Organisationen vom Backend
    const [availableOrganisations, setAvailableOrganisations] = useState([]);

    // Ladezustand für Rollen
    const [rolesLoading, setRolesLoading] = useState(false);

    // ========== LIFECYCLE ==========

    /**
     * Rollen vom Backend laden wenn Dialog geöffnet wird
     */
    useEffect(() => {
        if (open) {
            fetchRoles();
            fetchOrganisations();
        }
    }, [open]);

    /**
     * Alle verfügbaren Rollen vom Backend abrufen
     */
    const fetchRoles = async () => {
        setRolesLoading(true);
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
        } finally {
            setRolesLoading(false);
        }
    };

    /**
     * Alle verfügbaren Organisationen vom Backend abrufen
     */
    const fetchOrganisations = async () => {
        try {
            const orgs = await userService.getOrganisations();
            // API gibt uuid statt id zurück - transformieren
            const transformedOrgs = Array.isArray(orgs)
                ? orgs.map(org => ({ id: org.uuid || org.id, label: org.label }))
                : [];
            setAvailableOrganisations(transformedOrgs);
        } catch (err) {
            console.error('Fehler beim Laden der Organisationen:', err);
            setAvailableOrganisations([]);
        }
    };

    /**
     * Wenn editUser sich ändert, Formular mit Benutzerdaten befüllen
     */
    useEffect(() => {
        if (editUser) {
            // Organisation und Rolle aus dem ersten Eintrag extrahieren, falls vorhanden
            const firstOrg = editUser.organisations && editUser.organisations.length > 0
                ? editUser.organisations[0]
                : null;

            setFormData({
                userUuid: editUser.userUuid || '',
                username: editUser.username || '',
                firstName: editUser.firstName || '',
                lastName: editUser.lastName || '',
                mail: editUser.mail || '',
                phone: editUser.phone || '',
                organisation: firstOrg?.orgName || '',
                role: firstOrg?.roles && firstOrg.roles.length > 0 ? firstOrg.roles[0].roleName : ''
            });
        } else {
            // Formular zurücksetzen für neuen Benutzer
            setFormData({
                username: '',
                firstName: '',
                lastName: '',
                mail: '',
                phone: '',
                organisation: '',
                role: ''
            });
        }
        setErrors({});
        setError(null);
        setSuccess(false);
    }, [editUser, open]);

    // ========== EVENT HANDLER ==========

    /**
     * Behandelt Änderungen in Eingabefeldern
     */
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Fehler für dieses Feld zurücksetzen
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    /**
     * Validiert das Formular
     * @returns {boolean} true wenn valide, false wenn Fehler vorhanden
     */
    const validateForm = () => {
        const newErrors = {};

        // Username ist Pflichtfeld
        if (!formData.username || formData.username.trim() === '') {
            newErrors.username = 'Benutzername ist erforderlich';
        }

        // Vorname ist Pflichtfeld
        if (!formData.firstName || formData.firstName.trim() === '') {
            newErrors.firstName = 'Vorname ist erforderlich';
        }

        // Nachname ist Pflichtfeld
        if (!formData.lastName || formData.lastName.trim() === '') {
            newErrors.lastName = 'Nachname ist erforderlich';
        }

        // Email-Validierung
        if (!formData.mail || formData.mail.trim() === '') {
            newErrors.mail = 'E-Mail ist erforderlich';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
            newErrors.mail = 'Ungültige E-Mail-Adresse';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Behandelt das Absenden des Formulars
     */
    const handleSubmit = async () => {
        // Validierung durchführen
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Entscheiden ob Create oder Update
            if (editUser && editUser.userUuid) {
                // Update bestehender Benutzer
                await userService.updateUser(formData);
            } else {
                // Neuen Benutzer erstellen
                await userService.createUser(formData);
            }

            setSuccess(true);

            // Nach erfolgreicher Speicherung Callback aufrufen und Dialog schließen
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 1000);
        } catch (err) {
            console.error('Fehler beim Speichern:', err);
            setError(
                err.response?.data?.message ||
                'Fehler beim Speichern des Benutzers. Bitte versuchen Sie es erneut.'
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Schließt den Dialog und setzt alle Zustände zurück
     */
    const handleClose = () => {
        setFormData({
            username: '',
            firstName: '',
            lastName: '',
            mail: '',
            phone: '',
            organisation: '',
            role: ''
        });
        setErrors({});
        setError(null);
        setSuccess(false);
        onClose();
    };

    // ========== RENDER ==========

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)'
                }
            }}
            sx={{
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)'
                }
            }}
        >
            {/* Dialog-Titel */}
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: '1.5rem',
                fontWeight: 700,
                py: 3,
                px: 4,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(65, 105, 225, 0.3)'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <PersonIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                    {editUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
                </Typography>
            </DialogTitle>

            {/* Dialog-Inhalt */}
            <DialogContent sx={{ p: 4, mt: 1 }}>
                {/* Erfolgsmeldung */}
                {success && (
                    <Alert
                        severity="success"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                            animation: 'slideIn 0.3s ease-out',
                            '@keyframes slideIn': {
                                from: { opacity: 0, transform: 'translateY(-10px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }}
                    >
                        Benutzer wurde erfolgreich gespeichert!
                    </Alert>
                )}

                {/* Fehlermeldung */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
                            animation: 'slideIn 0.3s ease-out',
                            '@keyframes slideIn': {
                                from: { opacity: 0, transform: 'translateY(-10px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Formular-Grid */}
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {/* Benutzername */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            name="username"
                            label="Benutzername"
                            value={formData.username}
                            onChange={handleChange}
                            error={!!errors.username}
                            helperText={errors.username}
                            disabled={loading || !!editUser}
                            InputProps={{
                                startAdornment: (
                                    <Typography sx={{ mr: 1, color: '#4169E1', fontWeight: 600 }}>@</Typography>
                                )
                            }}
                            InputLabelProps={{
                                sx: {
                                    '&.MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -9px) scale(0.75)',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover:not(.Mui-disabled)': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            borderWidth: 2
                                        }
                                    },
                                    '&.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            boxShadow: '0 0 0 4px rgba(65, 105, 225, 0.1)'
                                        }
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    backgroundColor: 'white',
                                    paddingX: 0.5
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{
                            mt: 2,
                            mb: 2,
                            p: 2,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.08) 0%, rgba(46, 76, 184, 0.08) 100%)',
                            border: '1px solid rgba(65, 105, 225, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)',
                                boxShadow: '0 4px 12px rgba(65, 105, 225, 0.3)'
                            }}>
                                <PersonIcon sx={{ color: 'white', fontSize: 20 }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ color: '#4169E1', fontWeight: 700, letterSpacing: '0.5px' }}>
                                Persönliche Daten
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Vorname */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            required
                            name="firstName"
                            label="Vorname"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover:not(.Mui-disabled)': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            borderWidth: 2
                                        }
                                    },
                                    '&.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            boxShadow: '0 0 0 4px rgba(65, 105, 225, 0.1)'
                                        }
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Nachname */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            required
                            name="lastName"
                            label="Nachname"
                            value={formData.lastName}
                            onChange={handleChange}
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover:not(.Mui-disabled)': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            borderWidth: 2
                                        }
                                    },
                                    '&.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            boxShadow: '0 0 0 4px rgba(65, 105, 225, 0.1)'
                                        }
                                    }
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{
                            mt: 2,
                            mb: 2,
                            p: 2,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.08) 0%, rgba(46, 76, 184, 0.08) 100%)',
                            border: '1px solid rgba(65, 105, 225, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)',
                                boxShadow: '0 4px 12px rgba(65, 105, 225, 0.3)'
                            }}>
                                <EmailIcon sx={{ color: 'white', fontSize: 20 }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ color: '#4169E1', fontWeight: 700, letterSpacing: '0.5px' }}>
                                Kontaktdaten
                            </Typography>
                        </Box>
                    </Grid>

                    {/* E-Mail */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            name="mail"
                            label="E-Mail"
                            type="email"
                            value={formData.mail}
                            onChange={handleChange}
                            error={!!errors.mail}
                            helperText={errors.mail}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <EmailIcon sx={{ mr: 1, color: '#4169E1', fontSize: 20 }} />
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover:not(.Mui-disabled)': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            borderWidth: 2
                                        }
                                    },
                                    '&.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            boxShadow: '0 0 0 4px rgba(65, 105, 225, 0.1)'
                                        }
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Telefon (optional) */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="phone"
                            label="Telefon (optional)"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <PhoneIcon sx={{ mr: 1, color: '#4169E1', fontSize: 20 }} />
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover:not(.Mui-disabled)': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            borderWidth: 2
                                        }
                                    },
                                    '&.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            boxShadow: '0 0 0 4px rgba(65, 105, 225, 0.1)'
                                        }
                                    }
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{
                            mt: 2,
                            mb: 2,
                            p: 2,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.08) 0%, rgba(46, 76, 184, 0.08) 100%)',
                            border: '1px solid rgba(65, 105, 225, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)',
                                boxShadow: '0 4px 12px rgba(65, 105, 225, 0.3)'
                            }}>
                                <BusinessIcon sx={{ color: 'white', fontSize: 20 }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ color: '#4169E1', fontWeight: 700, letterSpacing: '0.5px' }}>
                                Organisation & Rolle
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Organisation */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            name="organisation"
                            label="Organisation"
                            value={formData.organisation}
                            onChange={handleChange}
                            disabled={loading}
                            SelectProps={{
                                native: true,
                            }}
                            InputProps={{
                                startAdornment: (
                                    <BusinessIcon sx={{ mr: 1, color: '#4169E1', fontSize: 20 }} />
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover:not(.Mui-disabled)': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            borderWidth: 2
                                        }
                                    },
                                    '&.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            boxShadow: '0 0 0 4px rgba(65, 105, 225, 0.1)'
                                        }
                                    }
                                }
                            }}
                        >
                            <option value="">-- Bitte wählen --</option>
                            {availableOrganisations.map((org, index) => (
                                <option key={org.id || `org-${index}`} value={org.label}>
                                    {org.label}
                                </option>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Rolle */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            name="role"
                            label="Rolle"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={loading || rolesLoading}
                            SelectProps={{
                                native: true,
                            }}
                            InputProps={{
                                startAdornment: (
                                    <BadgeIcon sx={{ mr: 1, color: '#4169E1', fontSize: 20 }} />
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover:not(.Mui-disabled)': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            borderWidth: 2
                                        }
                                    },
                                    '&.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#4169E1',
                                            boxShadow: '0 0 0 4px rgba(65, 105, 225, 0.1)'
                                        }
                                    }
                                }
                            }}
                        >
                            <option value="">-- Bitte wählen --</option>
                            {availableRoles.map((role, index) => (
                                <option key={role.id || `role-${index}`} value={role.label}>
                                    {role.label}
                                </option>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>

            {/* Dialog-Aktionen */}
            <DialogActions sx={{
                px: 4,
                pb: 3,
                pt: 2,
                gap: 2,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(248, 249, 250, 0.5) 100%)',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    startIcon={<CloseIcon />}
                    sx={{
                        color: '#666',
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Abbrechen
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #4169E1 0%, #2E4CB8 100%)',
                        boxShadow: '0 4px 15px rgba(65, 105, 225, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #2E4CB8 0%, #1e3a8a 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(65, 105, 225, 0.5)'
                        },
                        '&:disabled': {
                            background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                            boxShadow: 'none'
                        }
                    }}
                >
                    {loading ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BenutzerForm;
