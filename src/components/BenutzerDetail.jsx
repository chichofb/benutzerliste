/**
 * BENUTZERDETAIL.JSX - Detail-Ansicht für einzelnen Benutzer
 */

import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Divider,
    Chip,
    TextField,
    Paper,
} from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Business as BusinessIcon } from '@mui/icons-material';

/**
 * BenutzerDetail-Komponente
 * @param {Object} user - Benutzerobjekt mit allen Details
 */
const BenutzerDetail = ({ user }) => {
    // Fallback, falls keine Benutzerdaten vorhanden sind
    if (!user) {
        return <Typography>Keine Benutzerdaten verfügbar</Typography>;
    }

    return (
        <Box sx={{ pt: 0 }}>
            {/* Grid-Layout für responsive Anordnung der Felder */}
            <Grid container spacing={3}>

                {/* ===== PERSÖNLICHE DATEN ===== */}
                <Grid item xs={12}>
                    {/* Überschrift mit Icon */}
                    <Box sx={{
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
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4169E1' }}>
                            Persönliche Daten
                        </Typography>
                    </Box>
                </Grid>

                {/* Vorname - 50% Breite auf Desktop (sm), volle Breite auf Mobil (xs) */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Vorname"
                        value={user.firstName || ''}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#E8EEF7',
                                    '& fieldset': {
                                        borderColor: '#4169E1'
                                    }
                                }
                            },
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Nachname"
                        value={user.lastName || ''}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#E8EEF7',
                                    '& fieldset': {
                                        borderColor: '#4169E1'
                                    }
                                }
                            },
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Benutzername"
                        value={user.username || ''}
                        InputProps={{
                            readOnly: true,
                            startAdornment: <Typography sx={{ mr: 1, color: '#4169E1', fontWeight: 600 }}>@</Typography>
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#E8EEF7',
                                    '& fieldset': {
                                        borderColor: '#4169E1'
                                    }
                                }
                            },
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Email"
                        value={user.mail || ''}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#E8EEF7',
                                    '& fieldset': {
                                        borderColor: '#4169E1'
                                    }
                                }
                            },
                            '& .MuiOutlinedInput-input': {
                                color: '#4169E1',
                            },
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Telefon"
                        value={user.phone || ''}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F5F7FA',
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#E8EEF7',
                                    '& fieldset': {
                                        borderColor: '#4169E1'
                                    }
                                }
                            },
                        }}
                    />
                </Grid>

                {/* ===== ORGANISATIONEN & ROLLEN ===== */}
                {user.organisations && user.organisations.filter(org => !org.deleted).length > 0 && (
                    <>
                        <Grid item xs={12}>
                            {/* Trennlinie */}
                            <Divider sx={{ my: 2 }} />

                            {/* Überschrift mit Icon */}
                            <Box sx={{
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
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4169E1' }}>
                                    Organisationen & Rollen
                                </Typography>
                            </Box>
                        </Grid>

                        {/* 
                            Durch alle Organisationen iterieren (nur nicht-gelöschte)
                            Ein Benutzer kann mehrere Organisationen angehören,
                            und jede Organisation kann mehrere Rollen enthalten
                        */}
                        {user.organisations.filter(org => !org.deleted).map((org, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={12}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            border: '2px solid rgba(255, 152, 0, 0.3)',
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.04) 0%, rgba(245, 124, 0, 0.04) 100%)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(245, 124, 0, 0.08) 100%)',
                                                borderColor: '#FF9800',
                                                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)',
                                                transform: 'translateY(-2px)'
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                            <Chip
                                                label={org.orgName || 'Ohne Organisation'}
                                                size="medium"
                                                sx={{
                                                    backgroundColor: '#FF9800',
                                                    color: '#FFF',
                                                    fontWeight: 700,
                                                    fontSize: '0.95rem',
                                                    height: 36,
                                                    '& .MuiChip-label': {
                                                        px: 2
                                                    }
                                                }}
                                            />
                                        </Box>

                                        {/* Adressinformationen */}
                                        {(org.street || org.hnr || org.postcode || org.city) && (
                                            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 2 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    Adresse
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5, color: '#333' }}>
                                                    {org.street} {org.hnr}<br />
                                                    {org.postcode} {org.city}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Kontaktinformationen */}
                                        {(org.phone || org.fax || org.email) && (
                                            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 2 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    Kontakt
                                                </Typography>
                                                {org.phone && (
                                                    <Typography variant="body2" sx={{ mt: 0.5, color: '#333' }}>
                                                        📞 {org.phone}
                                                    </Typography>
                                                )}
                                                {org.fax && (
                                                    <Typography variant="body2" sx={{ color: '#333' }}>
                                                        📠 {org.fax}
                                                    </Typography>
                                                )}
                                                {org.email && (
                                                    <Typography variant="body2" sx={{ color: '#4169E1' }}>
                                                        ✉️ {org.email}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        {/* Rollen */}
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                                Rollen
                                            </Typography>
                                            {org.roles && org.roles.length > 0 ? (
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    {org.roles.map((role, roleIndex) => (
                                                        <Chip
                                                            key={roleIndex}
                                                            label={role.roleName}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#4169E1',
                                                                color: '#FFFFFF',
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                                    Keine Rollen zugewiesen
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            </React.Fragment>
                        ))}
                    </>
                )}

                {user.deleted !== undefined && (
                    <>
                        <Grid item xs={12}>
                            {/* Trennlinie */}
                            <Divider sx={{ my: 2 }} />

                            {/* Überschrift */}
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4169E1', mb: 2 }}>
                                Status
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            {/* 
                                Status-Chip: Zeigt an, ob Benutzer aktiv oder gelöscht ist
                                - Grün für aktiv
                                - Rot für gelöscht
                            */}
                            <Chip
                                label={user.deleted ? 'Gelöscht' : 'Aktiv'}
                                color={user.deleted ? 'error' : 'success'}
                                variant="filled"
                                sx={{ fontWeight: 600, fontSize: 13 }}
                            />
                        </Grid>
                    </>
                )}

            </Grid>
        </Box>
    );
};

export default BenutzerDetail;