# Mathe Trainer POC - Vercel Setup Guide

## 🔧 Vercel Environment Variable Error - GELÖST ✅

### Problem
```
error: Environment Variable "TRACKING_ENABLED" references Secret "tracking_enabled", 
which does not exist.
```

### Root Cause
Die alte `vercel.json` verwendete `@variable_name` Syntax, die Vercel als Secret-Referenzen interpretiert hat.

### Lösung ✅
**Die `vercel.json` wurde aktualisiert!** (Commit: 47987e30)

---

## 📝 Was du jetzt tun musst

### Option 1: Vercel Dashboard (Empfohlen)

1. **Öffne dein Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Wähle das Projekt "mathe-trainer-poc"**

3. **Gehe zu Settings → Environment Variables**

4. **Füge diese Variablen hinzu:**

   | Name | Wert | Umgebungen |
   |------|------|-----------|
   | `TRACKING_ENABLED` | `true` | Production, Preview, Development |
   | `ANALYTICS_ENDPOINT` | `https://api.example.com/analytics` | Production, Preview, Development |
   | `USER_SESSION_TIMEOUT` | `1800000` | Production, Preview, Development |
   | `DEBUG_MODE` | `false` | Production, Preview, Development |

5. **Klicke "Save"**

6. **Redeploy:**
   - Gehe zu Deployments
   - Klicke auf den neuesten Deploy
   - Klicke "Redeploy"

### Option 2: Mit Vercel CLI

```bash
# Login
vercel login

# Navigiere zum Projekt
cd mathe-trainer-poc

# Füge Variablen ein
vercel env add TRACKING_ENABLED true
vercel env add ANALYTICS_ENDPOINT https://api.example.com/analytics
vercel env add USER_SESSION_TIMEOUT 1800000
vercel env add DEBUG_MODE false

# Redeploy
vercel --prod
```

### Option 3: Mit Git & Auto-Deploy

Wenn du Git verwendest, wird das Projekt automatisch neu deployed.
Stelle einfach sicher, dass die Environment Variables in Vercel Dashboard gesetzt sind.

---

## ✅ Was wurde behoben

### Alte vercel.json (Fehlerhaft)
```json
{
  "env": {
    "TRACKING_ENABLED": "@tracking_enabled"
  }
}
```
❌ Vercel interpretiert dies als Secret-Referenz!

### Neue vercel.json (Funktioniert)
```json
{
  "env": {
    "TRACKING_ENABLED": "true",
    "ANALYTICS_ENDPOINT": "https://api.example.com/analytics",
    "USER_SESSION_TIMEOUT": "1800000",
    "DEBUG_MODE": "false"
  }
}
```
✅ Plain-Text Werte mit Fallback-Defaults

---

## 🧪 Test nach Setup

### 1. Health Check Test
```bash
curl https://your-app.vercel.app/api/health
```

**Sollte antworten mit:**
```json
{
  "status": "healthy",
  "checks": {
    "tracking": "enabled"
  }
}
```

### 2. User Tracking Test
```bash
curl -X POST https://your-app.vercel.app/api/track-user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "action": "heartbeat"
  }'
```

**Sollte antworten mit:**
```json
{
  "status": "online",
  "message": "User session updated",
  "timestamp": 1234567890
}
```

---

## 🔍 Troubleshooting

### Problem 1: "Environment Variable not found"

**Lösung:**
1. Vercel Dashboard prüfen → Settings → Environment Variables
2. Variablen sind korrekt eingegeben?
3. Alle 4 Variablen gesetzt?
4. Redeploy starten

### Problem 2: "Secret does not exist" (tritt noch auf)

**Lösung:**
1. Git pull → Stelle sicher, neue `vercel.json` hast
2. Vercel → Redeployer
3. Browser Cache leeren (Ctrl+Shift+Delete)

### Problem 3: API gibt 500 error

**Lösung:**
1. Setze `DEBUG_MODE = true` in Vercel
2. Öffne Developer Console (F12)
3. Prüfe die Fehler
4. Siehe `deployment.yaml` für Config-Details

---

## 📋 Vercel Environment Variables Übersicht

### Tracking
| Variable | Wert | Beschreibung |
|----------|------|------------|
| `TRACKING_ENABLED` | `true` | User-Tracking aktivieren |
| `ANALYTICS_ENDPOINT` | URL | Analytics API Endpoint |
| `USER_SESSION_TIMEOUT` | `1800000` | Session-Timeout in ms (30 min) |

### Debug
| Variable | Wert | Beschreibung |
|----------|------|------------|
| `DEBUG_MODE` | `false` | Debug-Logs aktivieren |

---

## 🚀 Performance nach Fix

Vercel wird jetzt:
- ✅ Keine Secret-Fehler werfen
- ✅ Environment Variables korrekt injizieren
- ✅ API Endpoints funktionieren
- ✅ Health Check erreichbar sein

---

## 📚 Weitere Ressourcen

- **Vercel Docs:** https://vercel.com/docs/environment-variables
- **Deployment Guide:** Siehe `deployment.yaml`
- **Code Review:** Siehe `CODE_REVIEW.md`

---

## 📞 Weiterer Support

Wenn der Fehler immer noch auftritt:

1. Öffne GitHub Issues
2. Included:
   - Screenshot vom Vercel Error
   - Commit Hash wo das Projekt gedeployt wurde
   - Logs von der Vercel Build-Seite

---

**Status:** ✅ GELÖST  
**Datum:** 2026-06-01  
**Version:** 1.0.1  
**Letzte Änderung:** vercel.json behoben + Environment Variables Anleitung
