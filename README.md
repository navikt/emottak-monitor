[![Build & deploy emottak-monitor-backend](https://github.com/navikt/emottak-monitor/actions/workflows/backend.yaml/badge.svg)](https://github.com/navikt/emottak-monitor/actions/workflows/backend.yaml)
[![Build & deploy emottak-monitor-frontend](https://github.com/navikt/emottak-monitor/actions/workflows/frontend.yaml/badge.svg)](https://github.com/navikt/emottak-monitor/actions/workflows/frontend.yaml)

# eMottak Monitor

eMottak Monitor består av en [backend](https://github.com/navikt/emottak-monitor/tree/main/backend/README.md#emottak-monitor)- og en [frontend](https://github.com/navikt/emottak-monitor/tree/main/frontend#emottak-monitor-frontend)-applikasjon.

## Monitorering av hendelser

For å se på hendelser relatert til meldingsflyten i emottak, logg inn i relevant miljø.

- Dev:
  - https://emottak-monitor-frontend.intern.dev.nav.no/
  - https://emottak-monitor.ansatt.dev.nav.no/
- Prod:
  - https://emottak-monitor-frontend.intern.nav.no/
  - https://emottak-monitor.ansatt.nav.no/

For å få tilgang må man ha rettigheter nevnt under [tilgangsstyring](https://github.com/navikt/emottak-monitor/tree/main/frontend#tilgangsstyring). Dette kan medlemmer i team-emottak bistå med.

## Innlogging med Azure AD
* Preprod (dev):
    - Personlig trygdeetaten-bruker eller felles testbruker. For eksempel:
      - *fornavn.etternavn@trygdeetaten.no* for personlig bruker.
      - *F_\<ident>.E_\<ident>@trygdeetaten.no* for testbruker.
* Prod:
    - Personlig nav-bruker (vanlig *fornavn.etternavn@nav.no*-bruker).

### Opprette trygdeetaten-bruker
* Personlig bruker:
    - Du har sannsynligvis allerede en slik bruker, bare bytt ut @nav.no med @trygdeetaten.no (f.eks. fornavn.etternavn@trygdeetaten.no). Default førstegangspassord er f.eks Ex99999 som du blir bedt om å oppdatere når du logger inn for første gang.
* Testbruker (fellesbrukere som kan ha ulike tilganger):
    - Opprettes i [ida](https://ida.intern.nav.no/).
* Administrering av grupper skjer via [mygroups](https://mygroups.microsoft.com/).
    - Gruppen heter "eMottak-Monitor".
    - Legg til trygdeetaten-brukere som trenger tilgang.

## Kontakt

Kontakt [#eMottak](https://nav-it.slack.com/archives/C01P0FUC78A) på slack ved behov for tilgang eller andre spørsmål.
