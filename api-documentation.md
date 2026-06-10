# API Documentation

---

## Permission API

### `GET /api/roles/select` — Rollen als Select-List

Liefert verfügbare Rollen im Select-response-Format (ID-basierte Optionen) gemäß Filter.

#### Parameters

| Name     | Required | Type          | In    | Description |
|----------|----------|---------------|-------|-------------|
| `filter` | ✅        | object(query) | query | Filter-Objekt |

**Filter Example:**
```json
{
  "orgUuid": "3fa2sad-dsad....",
  "levelTypeId": 0
}
```

#### Responses

| Code | Description              |
|------|--------------------------|
| 200  | Rollen erfolgreich abgerufen |
| 401  | Nicht authentifiziert    |
| 403  | Zugriff verweigert       |
| 500  | Interner Serverfehler    |

**200 Response Example:**
```json
{
  "options": [
    {
      "id": 0,
      "label": "string"
    }
  ],
  "defaultId": 0,
  "defaultUuid": "3fa2sad-dsad....."
}
```

---

## Me API

### `PUT /api/me` — Eigenes Profil aktualisieren

Aktualisiert die eigenen Profildaten des angemeldeten Nutzers.

#### Parameters
No parameters.

#### Request Body (required)
```json
{
  "firstName": "string",
  "lastName": "string",
  "mail": "string",
  "phone": "string",
  "password": "stringst"
}
```

#### Responses

| Code | Description                    |
|------|--------------------------------|
| 204  | Erfolgreich aktualisiert (kein Inhalt) |
| 400  | Ungültige Eingabedaten         |
| 401  | Nicht authentifiziert          |
| 403  | Zugriff verweigert             |
| 500  | Interner Serverfehler          |

---

### `GET /api/me/sessions` — Eigene Sitzungen abrufen

Listet alle aktiven bzw. relevanten Sitzungen des angemeldeten Nutzers auf.

#### Parameters
No parameters.

#### Responses

| Code | Description                        |
|------|------------------------------------|
| 200  | Sitzungen erfolgreich abgerufen    |
| 401  | Nicht authentifiziert              |
| 403  | Zugriff verweigert                 |
| 500  | Interner Serverfehler              |

**200 Response Example:**
```json
[
  {
    "username": "string",
    "ipAddress": "string",
    "startedAt": "2026-06-09T08:12:26.671Z",
    "lastAccessAt": "2026-06-09T08:12:26.671Z"
  }
]
```

---

### `GET /api/me/profile` — Eigenes Profil abrufen

Gibt das eigene Benutzerprofil basierend auf dem JWT (Keycloak-Sub) zurück.

#### Parameters
No parameters.

#### Responses

| Code | Description                    |
|------|--------------------------------|
| 200  | Profil erfolgreich abgerufen   |
| 401  | Nicht authentifiziert          |
| 403  | Zugriff verweigert             |
| 500  | Interner Serverfehler          |

**200 Response Example:**
```json
{
  "userUuid": "323sd.....",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "mail": "string",
  "phone": "string",
  "organisations": [
    {
      "orgUuid": "32da.....",
      "orgName": "string",
      "street": "string",
      "hnr": "string",
      "postcode": "string",
      "city": "string",
      "phone": "string",
      "fax": "string",
      "email": "string",
      "deleted": true,
      "roles": [
        {
          "roleId": 0,
          "roleName": "string",
          "selectable": true,
          "sort": 0,
          "roleDescription": "string"
        }
      ]
    }
  ]
}
```

---

### `GET /api/me/organisations/select` — Eigene Organisationen (Select-Format)

Liefert die Organisationen des angemeldeten Nutzers als Select-Response mit optionalem Default-Wert.

#### Parameters
No parameters.

#### Responses

| Code | Description                          |
|------|--------------------------------------|
| 200  | Organisationen erfolgreich abgerufen |
| 401  | Nicht authentifiziert                |
| 403  | Zugriff verweigert                   |
| 500  | Interner Serverfehler                |

**200 Response Example:**
```json
{
  "options": [
    {
      "uuid": "3fa2sad-dsad.....",
      "label": "string"
    }
  ],
  "defaultId": 0,
  "defaultUuid": "3fa8f...."
}
```

---

## Organisation API

### `GET /api/organisations/select` — Organisationen als Select-Liste

#### Parameters

| Name     | Required | Type          | In    |
|----------|----------|---------------|-------|
| `filter` | ✅        | object(query) | query |

**Filter Example:**
```json
{
  "orgUuid": "3fa2sad-dsad....",
  "levelTypeId": 0,
  "levelId": 0
}
```

#### Responses

| Code | Description                    |
|------|--------------------------------|
| 200  | Erfolgreich abgerufen          |
| 400  | Ungültige Anfrageparameter     |
| 401  | Nicht authentifiziert          |
| 403  | Zugriff verweigert             |
| 500  | Interner Serverfehler          |

**200 Response Example:**
```json
{
  "options": [
    {
      "uuid": "3fa2sad-dsad.....",
      "label": "string"
    }
  ],
  "defaultId": 0,
  "defaultUuid": "3fa8f...."
}
```

---

### `GET /api/organisations/level/select` — Organisationsebenen-Typen als Select-Liste

Liefert die verfügbaren Ebenen-Typen im Select-response-Format (ID-basierte Optionen).

#### Parameters

| Name     | Required | Type          | In    |
|----------|----------|---------------|-------|
| `filter` | ✅        | object(query) | query |

**Filter Example:**
```json
{
  "levelTypeId": 0,
  "levelTypeName": "string"
}
```

#### Responses

| Code | Description                    |
|------|--------------------------------|
| 200  | Erfolgreich abgerufen          |
| 400  | Ungültige Anfrageparameter     |
| 401  | Nicht authentifiziert          |
| 403  | Zugriff verweigert             |
| 500  | Interner Serverfehler          |

**200 Response Example:**
```json
{
  "options": [
    {
      "id": 0,
      "label": "string"
    }
  ],
  "defaultId": 0,
  "defaultUuid": "3fa2sad-dsad....."
}
```

---

### `GET /api/organisations/leveltypes/select` — Organisationsebenen als Select-Liste

Liefert die Ebenen im Select-response-Format (ID-basierte Optionen) gemäß Filter.

#### Parameters

| Name     | Required | Type          | In    |
|----------|----------|---------------|-------|
| `filter` | ✅        | object(query) | query |

**Filter Example:**
```json
{
  "levelId": 0,
  "levelTypeId": 0,
  "levelName": "string"
}
```

#### Responses

| Code | Description                    |
|------|--------------------------------|
| 200  | Erfolgreich abgerufen          |
| 400  | Ungültige Anfrageparameter     |
| 401  | Nicht authentifiziert          |
| 403  | Zugriff verweigert             |
| 500  | Interner Serverfehler          |

**200 Response Example:**
```json
{
  "options": [
    {
      "id": 0,
      "label": "string"
    }
  ],
  "defaultId": 0,
  "defaultUuid": "3fa2sad-dsad....."
}
```

---

## Users API

### `GET /api/users/{userUuid}` — Get User

Returns either `User` or `UserPrivate` depending on permissions.

#### Parameters

| Name       | Required | Type         | In   |
|------------|----------|--------------|------|
| `userUuid` | ✅        | string($uuid) | path |

#### Responses

| Code | Description    |
|------|----------------|
| 200  | User details   |
| 404  | User not found |

**200 Response Example:**
```json
{
  "userUuid": "323sd.....",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "mail": "string",
  "phone": "string",
  "organisations": [
    {
      "orgUuid": "32da.....",
      "orgName": "string",
      "street": "string",
      "hnr": "string",
      "postcode": "string",
      "city": "string",
      "phone": "string",
      "fax": "string",
      "email": "string",
      "deleted": true,
      "roles": [
        {
          "roleId": 0,
          "roleName": "string",
          "selectable": true,
          "sort": 0,
          "roleDescription": "string"
        }
      ]
    }
  ]
}
```

---

### `GET /api/users/list` — Search Users

#### Parameters
No parameters.

#### Request Body (required)
```json
{
  "username": "string",
  "userUuid": "3fa2sad-dsad...",
  "searchMode": "SUBSTRING",
  "searchUsernameOrLastname": "string",
  "roleIds": [0],
  "orgUuid": "3fa2sad-dsad...."
}
```

#### Responses

| Code | Description      |
|------|------------------|
| 200  | List of users    |
| 404  | No users found   |

**200 Response Example:**
```json
[
  {
    "userUuid": "323sd.....",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "mail": "string",
    "phone": "string",
    "organisations": [
      {
        "orgUuid": "32da.....",
        "orgName": "string",
        "street": "string",
        "hnr": "string",
        "postcode": "string",
        "city": "string",
        "phone": "string",
        "fax": "string",
        "email": "string",
        "deleted": true,
        "roles": [
          {
            "roleId": 0,
            "roleName": "string",
            "selectable": true,
            "sort": 0,
            "roleDescription": "string"
          }
        ]
      }
    ]
  }
]
```

---

### `POST /api/users` — Create User

#### Parameters
No parameters.

#### Request Body (required)
```json
{
  "firstName": "string",
  "lastName": "string",
  "mail": "string",
  "phone": "string",
  "password": "stringst",
  "organisations": [
    {
      "orgUuid": "32da.....",
      "roles": [
        {
          "roleId": 0
        }
      ]
    }
  ]
}
```

#### Responses

| Code | Description  |
|------|--------------|
| 201  | User created |

---

### `PUT /api/users/{userUuid}` — Update User

Updates user data and organization-role-assignments.

#### Parameters

| Name       | Required | Type          | In   |
|------------|----------|---------------|------|
| `userUuid` | ✅        | string($uuid) | path |

#### Request Body (required)
```json
{
  "firstName": "string",
  "lastName": "string",
  "mail": "string",
  "phone": "string",
  "password": "stringst",
  "organisations": [
    {
      "orgUuid": "32da.....",
      "roles": [
        {
          "roleId": 0
        }
      ]
    }
  ]
}
```

#### Responses

| Code | Description  |
|------|--------------|
| 204  | User updated |