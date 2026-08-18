# AutoWeight Log — Small Design Doc

## 1. Goal

Turn AutoWeight Log from a personal/internal automation into a simple full-stack PWA that makes logging body weight as frictionless as possible.

The core idea:

**Take a picture of your scale → confirm the detected weight → save it.**

The product should be simple enough that a normal person can use it without thinking about how the technology works.

## 2. Primary User Problem

Logging weight manually creates unnecessary friction.

Typical flow today:

1. Step on scale.
2. Remember the number.
3. Open an app or spreadsheet.
4. Find the correct screen/cell.
5. Type the number.
6. Save it.

AutoWeight Log should reduce that to:

1. Step on scale.
2. Take a picture.
3. Confirm.
4. Done.

## 3. V1 Scope

### Core Features

- User account/login
- Take or upload a photo of a scale
- Detect the displayed weight from the image
- Show the detected value before saving
- Allow the user to correct the value if detection is wrong
- Save:
  - weight
  - date/time
  - unit (`lb` / `kg`)
- View previous weight entries
- Display a simple weight trend graph
- Installable/mobile-friendly PWA

## 4. Important Constraint

Different scales use different:

- displays
- fonts
- colors
- layouts
- lighting
- decimal formats
- units

Image recognition will therefore not always be correct.

**V1 should never silently trust the detected value.**

Flow:

`Photo → Detect → User confirms/edits → Save`

The goal is not perfect recognition. The goal is making manual correction rare and easy.

## 5. Out of Scope for V1

Do not build these yet:

- AI coaching/agent
- RAG
- social features
- wearable integrations
- advanced analytics
- subscriptions
- complex goal systems

These can be considered only after the basic weight logging experience works well.

## 6. Basic Architecture

### Frontend

- React / TypeScript
- PWA
- Mobile-first UI

### Backend

- ASP.NET Core Web API

### Database

- PostgreSQL

Basic entities:

- User
- WeightEntry

### Image Processing

Existing image/AI approach can be adapted to extract the weight shown on the scale.

## 7. Environments

### Local

Developer machine.

### DEV

Used to test deployed changes before production.

### PROD

Real user-facing application.

Each environment should have separate:

- configuration
- secrets
- database
- deployment

## 8. CI/CD Practice Goal

Use this project specifically to practice a professional software delivery workflow.

Example:

`Feature branch → PR → automated build/tests → merge → deploy DEV → verify → approve → deploy PROD`

The project should eventually include:

- automated builds
- automated tests
- DEV deployments
- PROD deployments
- database migrations
- secret management
- logging/monitoring
- basic rollback strategy

## 9. Success Criteria for Initial Release

V1 is successful if a user can:

1. Open the app on their phone.
2. Photograph their scale.
3. See a correctly detected or easily corrected weight.
4. Save the entry.
5. View their previous entries.
6. See their weight trend on a graph.

The entire logging process should ideally take only a few seconds.

## 10. Possible Future Direction

Only expand based on actual usage.

Potential future features:

- weight goals
- weekly/monthly trends
- progress statistics
- nutrition logging
- barcode-based food database
- reusable meals
- grocery lists
- premium analytics
- optional AI assistant with access to the user's historical data

The AI assistant is **not a requirement** for the product. It should only be added if it solves a real user problem better than normal application features.

## 11. Product Principle

**Make weight logging stupidly simple first. Everything else is secondary.**

The first objective is not to build a huge health platform.

The first objective is to make:

**Photo → Weight Logged**

work extremely well.
