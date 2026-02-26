# Project Name: Playa - Automated Relationship Manager
# Version: 1.0 (MVP)

## 1. App Overview
Playa is a mobile application designed to help users maintain relationships by scheduling and randomizing communication. It allows users to create "Recipients," assign message pools to them, and let the system determine when to prompt the user to send these messages via WhatsApp, SMS, or Instagram.

## 2. Core User Flow
1. **Home/Dashboard:** View active contacts and upcoming messages for the day.
2. **Add Contact (+):** User defines a person (Name, Phone/Handle) and Platform (WhatsApp/SMS/Insta).
3. **Configure Logic:** User sets "3 messages per day (Random)" OR "Fixed times (10:00, 18:00)."
4. **Message Pool:** User writes generic or specific messages (e.g., "Thinking of you", "Have a great lunch").
5. **Execution:** App schedules notifications. When triggered, clicking the notification opens the specific app (WhatsApp) with the text pre-filled.

## 3. Detailed Feature Requirements

### A. Home Screen
- **Visuals:** Minimalist, aesthetic, "Beautiful" UI.
- **Components:**
  - Header: "Playa".
  - Main List: Active Recipients card view.
  - FAB (Floating Action Button): "+" to add a new contact.

### B. Add Contact (Popup/Modal)
- **Inputs:**
  - Name (String).
  - Platform Select: WhatsApp (Default), SMS, Instagram, Snapchat.
  - Identifiers: Phone Number (with Country Code) OR Instagram Username.
- **Message Configuration:**
  - **Mode A (Random):** User inputs "Total per day" (e.g., 3). System picks 3 random times between 09:00-21:00.
  - **Mode B (Fixed):** User selects specific times (e.g., 09:00, 14:00).
- **Message Content:** Input field to add multiple text templates to the pool.

### C. The Copy Feature (Crucial)
- **Function:** "Clone Recipient Strategy".
- **UI:** When creating/editing a contact, button says "Import from...".
- **Logic:**
  - Select an existing contact.
  - Checkbox: [x] Copy Schedule Settings.
  - Checkbox: [x] Copy Message Pool.

### D. Message Review & Management
- **Screen:** "Upcoming Queue".
- **Action:** User sees a list of generated messages for the day.
- **Edit:** Ability to modify text or delete a specific pending message.
- **Commit:** "Confirm" button to lock in the day's schedule.
- **Safety:** "Are you sure?" confirmation dialog before bulk deleting or cancelling.

## 4. Technical Constraints & Architecture
- **Tech Stack:** React Native (Expo) OR Flutter.
- **Local Storage:** SQLite or AsyncStorage (No cloud backend for MVP).
- **Deep Linking:** Must use `Linking` API to open WhatsApp/SMS schemas (`whatsapp://send?phone=...&text=...`).
