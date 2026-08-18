This project allows me to take a picture of my scale readings and auto import them into a Google Sheet. This removes
the friction from having to manually log and record my scale readings every single day (pounds, muscle %, fat %, etc.).
Now I can simply

1. Wake up
2. Open website on bookmarked icon on phone (eventually an app icon...)
3. take picture of scale reading
4. review numbers, modify if needed, normally won't have to
5. Submit and Sheets API writes data to your google sheet.

TODO ASAP:
- branch off, convert this to a full stack application, refer to plan doc in cursor, at the moment still trying to define our MVP

TODO:

- Add a pin-code on Vercel DashB before you do 'npx vercel env pull'
- Use the pin code successfully so no random people run up your GPT API credits.
- Fix/Probe those errors happening locally, some generic local errors. Don't seem to be happening in prod.
- Do a code audit and clean stuff up!
- Integrate this into LiftLog application.

# React + TypeScript + Vite

TODO:

- Modify frontend to show muscle and fat indicator for percentage so you dont get confused on which is which
- Remove the water percentage idc about that. Also move the X button, in the wrong spot.
- SPIKE: Is there an alternative, better than OpenAI API? Any free solutions? OpenAI is great just a little slow with the response.
- Branch off, do a GCP instead of Apps Script. Then you can turn this into an app people can use.
  - goal: login via email? can log in app or just in your own excel sheet or wherever.

`npx vercel dev` to run local (existing personal tool flow)

## Local backend (Step 1 — ASP.NET + Postgres)

Requires Docker Desktop and .NET 10 SDK.

```bash
# 1) Start Postgres
docker compose up -d

# 2) Run the API
cd backend
dotnet run --launch-profile http
```

API listens on `http://localhost:5256`.
Postgres is exposed on host port `5433` (avoids clashing with a local Postgres on `5432`).

- Health: `GET http://localhost:5256/health`
- DB health: `GET http://localhost:5256/health/db`

Stop Postgres when done: `docker compose down` (data volume is kept).

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
