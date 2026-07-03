# eMottak Monitor Frontend

URL til tjenesten i dev: https://emottak-monitor-frontend.intern.dev.nav.no/

## Lokal utvikling

Last ned dependencies:

```
cd ./frontend/
yarn install
```

Start applikasjon (krever at backend er oppe og kjører):

```
yarn start
```

For kjøring av frontend lokalt uten backend kan man kjøre følgende node-skript som vil mocke backend (ved hjelp av src/mocks/mockFetch.ts):

```
node start-local-with-mock.js
```

## Tilgangsstyring

Tilgang krever medlemsskap i Azure AD-gruppen: **0000-GA-eMottak-Monitor**

- Prod (nav.no-bruker): [0000-GA-eMottak-Monitor](https://account.activedirectory.windowsazure.com/r#/manageMembership?objectType=Group&objectId=eb7722ab-17c3-4822-8325-2a9e3ab86815)
- Dev (trygdeetaten.no-bruker): [0000-GA-eMottak-Monitor](https://account.activedirectory.windowsazure.com/r#/manageMembership?objectType=Group&objectId=cf69aedf-bd8c-4bcc-81ae-ecaccdf00b93)

## Kontakt

Kontakt [#eMottak](https://nav-it.slack.com/archives/C01P0FUC78A) på slack ved behov for tilgang eller andre spørsmål.
