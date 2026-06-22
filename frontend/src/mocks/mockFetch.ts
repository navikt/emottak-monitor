import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

console.log("This is the Mock calling...");
if (process.env.NODE_ENV === 'development') {
    console.log("Mock is initializing in development environment...");
    const mock = new MockAdapter(axios, { delayResponse: 50 }); // optional delay
    console.log("Mock initialized...");

    // Mocke kall til v1/hentmeldinger?:
    mock.onGet(/\/v1\/hentmeldinger\?/).reply((config) => {
        console.log("Mocker hentmeldinger");
        const payload = {
            "page": 1,
            "size": 10,
            "sort": "DESC",
            "totalElements": 238,
            "content": [
                {
                    "datomottat": "2026-06-17 13:52:49.880759",
                    "mottakidliste": "2606171352lege27403.1,2606171352navm27410",
                    "role": "Saksbehandler",
                    "service": "Sykmelding",
                    "action": "Svar",
                    "referanse": "2606171352navm27410",
                    "avsender": "NAVmottak",
                    "cpaid": "nav:114434",
                    "antall": 7,
                    "status": "Informasjon"
                },
                {
                    "datomottat": "2026-06-17 13:52:49.876352",
                    "mottakidliste": "2606171352gisk27387.1,2606171352navm27471",
                    "role": "Saksbehandler",
                    "service": "Sykmelding",
                    "action": "Svar",
                    "referanse": "2606171352navm27471",
                    "avsender": "NAVmottak",
                    "cpaid": "nav:120166",
                    "antall": 7,
                    "status": "Informasjon"
                },
                {
                    "datomottat": "2026-06-17 13:52:47.869049",
                    "mottakidliste": "2606171352loml27384.1,2606171352navm27409",
                    "role": "Saksbehandler",
                    "service": "Sykmelding",
                    "action": "Svar",
                    "referanse": "2606171352navm27409",
                    "avsender": "NAVmottak",
                    "cpaid": "nav:120465",
                    "antall": 7,
                    "status": "Informasjon"
                },
                {
                    "datomottat": "2026-06-17 13:52:47.847066",
                    "mottakidliste": "2606171352navm27348,2606171352sknl27405.1",
                    "role": "Saksbehandler",
                    "service": "ForesporselFraSaksbehandler",
                    "action": "Bekreftelse",
                    "referanse": "2606171352navm27348",
                    "avsender": "NAVmottak",
                    "cpaid": "959469326_889640782_011",
                    "antall": 7,
                    "status": "Informasjon"
                },
                {
                    "datomottat": "2026-06-17 13:52:47.660944",
                    "mottakidliste": "2606171352navm27408,2606171352tann27377.1",
                    "role": "KontrollUtbetaler",
                    "service": "BehandlerKrav",
                    "action": "Svarmelding",
                    "referanse": "c94735ca-ba56-4c80-9403-5382923fabfc",
                    "avsender": "NAVmottak",
                    "cpaid": "nav:108550",
                    "antall": 6,
                    "status": "Ferdigbehandlet"
                },
                {
                    "datomottat": "2026-06-17 13:52:47.244564",
                    "mottakidliste": "2606171352joma27352.1,2606171352navm27347",
                    "role": "Saksbehandler",
                    "service": "Sykmelding",
                    "action": "Svar",
                    "referanse": "2606171352navm27347",
                    "avsender": "NAVmottak",
                    "cpaid": "912206165_889640782_011",
                    "antall": 7,
                    "status": "Informasjon"
                },
                {
                    "datomottat": "2026-06-17 13:52:46.588353",
                    "mottakidliste": "2606171352dent27355.1,2606171352navm27407",
                    "role": "KontrollUtbetaler",
                    "service": "BehandlerKrav",
                    "action": "Svarmelding",
                    "referanse": "b9321748-bd31-4a9a-98a9-6340f1e7dad6",
                    "avsender": "NAVmottak",
                    "cpaid": "nav:105732",
                    "antall": 7,
                    "status": "Informasjon"
                },
                {
                    "datomottat": "2026-06-17 13:52:46.113456",
                    "mottakidliste": "2606171352navm27346,2606171352stav27364.1",
                    "role": "Saksbehandler",
                    "service": "Sykmelding",
                    "action": "Svar",
                    "referanse": "2606171352navm27346",
                    "avsender": "NAVmottak",
                    "cpaid": "nav:110964",
                    "antall": 7,
                    "status": "Ferdigbehandlet"
                },
                {
                    "datomottat": "2026-06-17 13:52:46.098998",
                    "mottakidliste": "2606171352hels27406.1,2606171352navm27345",
                    "role": "Frikortregister",
                    "service": "HarBorgerFrikortMengde",
                    "action": "Svar",
                    "referanse": "2606171352hels27406.1",
                    "avsender": "NAVmottak",
                    "cpaid": "nav:108469",
                    "antall": 6,
                    "status": "Ferdigbehandlet"
                },
                {
                    "datomottat": "2026-06-17 13:52:45.954395",
                    "mottakidliste": "2606171352hels27406.1,2606171352navm27345",
                    "role": "Behandler",
                    "service": "HarBorgerFrikortMengde",
                    "action": "EgenandelForesporsel",
                    "referanse": "1",
                    "avsender": "HELSE STAVANGER HF,  ( 983974678 )",
                    "cpaid": "nav:108469",
                    "antall": 5,
                    "status": "Ferdigbehandlet"
                }
            ],
            "totalPages": 24
        };
        return [200, payload];
    });

    // Mocke kall til v1/hentcpa?:
    mock.onGet(/\/v1\/hentcpa\?/).reply((config) => {
        console.log("Mocker hentcpa");
        const payload = [
            {
                "partnerid": "12345",
                "navn": "MIN KOMMUNE, Pleie og Omsorg",
                "partnerherid": "54321",
                "partnerorgnummer": "987654321"
            }
        ];
        return [200, payload];
    });

    // Mocke kall til v1/hentrollerservicesaction?:
    mock.onGet(/\/v1\/hentrollerservicesaction/).reply((config) => {
        console.log("Mocker hentrollerservicesaction");
        const payload = {
            roles: ["Behandler","Fastlege","Fastlegeregister","Fordringshaver","Frikortregister","INNTEKTSFORESPORSELsender","KODEVERKREQUESTsender","KontrollUtbetaler","Lege","Nav","Not applicable","POMsender","Saksbehandler","Sykmelder","Utleverer","Ytelsesutbetaler"],
            services: ["BehandlerKrav","DialogmoteInnkalling","ForesporselFraSaksbehandler","HarBorgerEgenandelFritak","HarBorgerFrikort","HarBorgerFrikortMengde","HenvendelseFraLege","Inntektsforesporsel","Legemelding","OppgjorsKontroll","PasientlisteForesporsel","S-DIALOG_AVVIK","S-DIALOG_FORESPORSEL","S-EGENANDELMENGDEFORESPORSEL","S-EGENANDELSVAR","S-FOM","S-INNTEKTSFORESPORSEL","S-KODEVERKREQUEST","S-POM","Sykmelding","Trekkopplysning","urn:oasis:names:tc:ebxml-msg:service"],
            actions: ["APPREC","Acknowledgment","DIALOG_AVVIK","EGENANDELMENGDEFORESPORSEL","EgenandelForesporsel","FOM","Foresporsel","ForesporselSvar","HentPasientliste","Henvendelse","INNTEKTSFORESPORSEL","Innmelding","InntektInformasjon","KODEVERKREQUEST","Kvittering","Legeerklaring","MessageError","MoteRespons","OppgjorsMelding","Oppgjorskrav","POM","Registrering","StartAbonnement","Svar","Svarmelding"],
            refreshedAt:"2026-03-03T11:18:02.444978Z"
        };
        return [200, payload];
    });

    // Mocke kall til v1/hentmeldingerebms?:
    mock.onGet(/\/v1\/hentmeldingerebms\?/).reply((config) => {
        console.log("Mocker hentmeldingerebms");
        const payload = {
            "page":1,
            "size":10,
            "sort":"DESC",
            "totalElements":4,
            "content":[
                {
                    "receivedDate":"2026-06-17T13:35:36.128614+02:00[Europe/Oslo]",
                    "readableIdList":"IN.2606171330.rakk.b927d7,OUT.2606171330.NAVM.a0a149,OUT.2606171330.NAVM.142234,IN.2606171335.rakk.a5a622",
                    "role":"Not applicable",
                    "service":"urn:oasis:names:tc:ebxml-msg:service",
                    "action":"Acknowledgment",
                    "referenceParameter":"Unknown",
                    "senderName":"RAKKESTAD KOMMUNE, Pleie og Omsorg",
                    "cpaId":"nav:32510",
                    "count":64,
                    "status":"Meldingen er ferdigbehandlet"
                }, {
                    "receivedDate":"2026-06-17T13:35:32.841167+02:00[Europe/Oslo]",
                    "readableIdList":"IN.2606171335.orkl.8aa6db,OUT.2606171335.NAVM.58df2a,OUT.2606171335.NAVM.dd3344",
                    "role":"Ytelsesutbetaler",
                    "service":"urn:oasis:names:tc:ebxml-msg:service",
                    "action":"Acknowledgment",
                    "referenceParameter":"Unknown",
                    "senderName":"Nav Mottak",
                    "cpaId":"nav:85298",
                    "count":64,
                    "status":"Meldingen er ferdigbehandlet"
                }, {
                    "receivedDate":"2026-06-17T13:35:32.651346+02:00[Europe/Oslo]",
                    "readableIdList":"IN.2606171335.orkl.8aa6db,OUT.2606171335.NAVM.58df2a,OUT.2606171335.NAVM.dd3344",
                    "role":"Ytelsesutbetaler",
                    "service":"Inntektsforesporsel",
                    "action":"InntektInformasjon",
                    "referenceParameter":"Unknown",
                    "senderName":"Nav Mottak",
                    "cpaId":"nav:85298",
                    "count":64,
                    "status":"Meldingen er ferdigbehandlet"
                }, {
                    "receivedDate":"2026-06-17T13:35:32.428185+02:00[Europe/Oslo]",
                    "readableIdList":"IN.2606171335.orkl.8aa6db,OUT.2606171335.NAVM.58df2a,OUT.2606171335.NAVM.dd3344",
                    "role":"Fordringshaver",
                    "service":"Inntektsforesporsel",
                    "action":"Foresporsel",
                    "referenceParameter":"Unknown",
                    "senderName":"ORKLAND KOMMUNE, Pleie og Omsorg",
                    "cpaId":"nav:85298",
                    "count":64,
                    "status":"Meldingen er ferdigbehandlet"
                }
            ],
            "totalPages":1
        };
        return [200, payload];
    });

    // Mocke kall til v1/henthendelser?:
    mock.onGet(/\/v1\/henthendelser\?/).reply((config) => {
        console.log("Mocker henthendelser");
        const payload = {
            "page": 1,
            "size": 10,
            "sort": "DESC",
            "totalElements": 1490,
            "content": [
                {
                    "hendelsedato": "2026-06-17 13:43:59.998581",
                    "hendelsedeskr": "Melding ferdig behandlet",
                    "tillegsinfo": "[a01wavl00008.adeo.no] Melding ble behandlet uten feil",
                    "mottakid": "2606171343navm25101",
                    "role": "Frikortregister",
                    "service": "HarBorgerFrikortMengde",
                    "action": "Svar",
                    "referanse": "2606171343rdbe25193.1",
                    "avsender": "NAVmottak"
                },
                {
                    "hendelsedato": "2026-06-17 13:43:59.992901",
                    "hendelsedeskr": "Transport kvittering mottatt",
                    "tillegsinfo": "[a01wavl00008.adeo.no] null",
                    "mottakid": "2606171343navm25101",
                    "role": "Frikortregister",
                    "service": "HarBorgerFrikortMengde",
                    "action": "Svar",
                    "referanse": "2606171343rdbe25193.1",
                    "avsender": "NAVmottak"
                },
                {
                    "hendelsedato": "2026-06-17 13:43:59.98543",
                    "hendelsedeskr": "Melding lagt på kø",
                    "tillegsinfo": "[a01wavl00008.adeo.no] Meldingen 2606171343heia25367.1 (ebMessageId:8206e807-0285-460a-8839-53def71fd003) er lagt på kø QA.P414.IU03_EBXML_INNPOST",
                    "mottakid": "2606171343heia25367.1",
                    "role": "Behandler",
                    "service": "HarBorgerFrikortMengde",
                    "action": "EgenandelForesporsel",
                    "referanse": "1",
                    "avsender": "HEIANE LEGESENTER AS,  ( 915118305 )"
                },
                {
                    "hendelsedato": "2026-06-17 13:43:59.975155",
                    "hendelsedeskr": "Melding hentet fra e-post",
                    "tillegsinfo": "[a01wavl00008.adeo.no] EBXML-Info: MessageId: 8206e807-0285-460a-8839-53def71fd003\nFrom Party: Value: [99103] Type: [HER]\nFrom Role: Behandler\nTo Party: Value: [79768] Type: [HER]\nTo Role: Frikortregister\nService: Value: [HarBorgerFrikortMengde] Type: [string]\nAction: EgenandelForesporsel\nTpaId: nav:112036\nConversationId: 05d7e208-952d-4848-8bb2-5e3ac73a3437\nTimestamp: Wed Jun 17 13:43:52 CEST 2026\nRefToMessageId: null\nSecurity Profile: SignedDataAndAcks\nAllowed Security Profiles: SignedDataAndAcks; \nReliability Mode: OnceAndOnlyOnce\nAllowed Reliability Modes: OnceAndOnlyOnce; \nPayload1: \nType: application/pkcs7-mime; smime-type=enveloped-data\nContent-Length: Unknown\n\n",
                    "mottakid": "2606171343heia25367.1",
                    "role": "Behandler",
                    "service": "HarBorgerFrikortMengde",
                    "action": "EgenandelForesporsel",
                    "referanse": "1",
                    "avsender": "HEIANE LEGESENTER AS,  ( 915118305 )"
                },
                {
                    "hendelsedato": "2026-06-17 13:43:59.952546",
                    "hendelsedeskr": "Melding ferdig behandlet",
                    "tillegsinfo": "[a01wavl00008.adeo.no] Melding ble behandlet uten feil",
                    "mottakid": "2606171343navm25182",
                    "role": "Frikortregister",
                    "service": "HarBorgerFrikortMengde",
                    "action": "Svar",
                    "referanse": "2606171343rdbe25181.1",
                    "avsender": "NAVmottak"
                },
                {
                    "hendelsedato": "2026-06-17 13:43:59.947538",
                    "hendelsedeskr": "Transport kvittering mottatt",
                    "tillegsinfo": "[a01wavl00008.adeo.no] null",
                    "mottakid": "2606171343navm25182",
                    "role": "Frikortregister",
                    "service": "HarBorgerFrikortMengde",
                    "action": "Svar",
                    "referanse": "2606171343rdbe25181.1",
                    "avsender": "NAVmottak"
                },
                {
                    "hendelsedato": "2026-06-17 13:43:59.939374",
                    "hendelsedeskr": "Melding ferdig behandlet",
                    "tillegsinfo": "[a01wavl00008.adeo.no] Melding ble behandlet uten feil",
                    "mottakid": "2606171343navm25099",
                    "role": "Frikortregister",
                    "service": "HarBorgerFrikortMengde",
                    "action": "Svar",
                    "referanse": "2606171343rdbe25187.1",
                    "avsender": "NAVmottak"
                },
                {
                    "hendelsedato": "2026-06-17 13:43:59.934633",
                    "hendelsedeskr": "Transport kvittering mottatt",
                    "tillegsinfo": "[a01wavl00008.adeo.no] null",
                    "mottakid": "2606171343navm25099",
                    "role": "Frikortregister",
                    "service": "HarBorgerFrikortMengde",
                    "action": "Svar",
                    "referanse": "2606171343rdbe25187.1",
                    "avsender": "NAVmottak"
                },
                {
                    "hendelsedato": "2026-06-17 13:43:59.927684",
                    "hendelsedeskr": "Melding ferdig behandlet",
                    "tillegsinfo": "[a01wavl00008.adeo.no] Melding ble behandlet uten feil",
                    "mottakid": "2606171343navm25192",
                    "role": "Frikortregister",
                    "service": "HarBorgerFrikortMengde",
                    "action": "Svar",
                    "referanse": "2606171343rdbe25186.1",
                    "avsender": "NAVmottak"
                },
                {
                    "hendelsedato": "2026-06-17 13:43:59.92365",
                    "hendelsedeskr": "Transport kvittering mottatt",
                    "tillegsinfo": "[a01wavl00008.adeo.no] null",
                    "mottakid": "2606171343navm25192",
                    "role": "Frikortregister",
                    "service": "HarBorgerFrikortMengde",
                    "action": "Svar",
                    "referanse": "2606171343rdbe25186.1",
                    "avsender": "NAVmottak"
                }
            ],
            "totalPages": 149
        };
        return [200, payload];
    });

    // Mocke kall til v1/henthendelserebms?:
    mock.onGet(/\/v1\/henthendelserebms\?/).reply((config) => {
        console.log("Mocker henthendelserebms");
        const payload = {
                "page": 1,
                "size": 10,
                "sort": "DESC",
                "totalElements": 332,
                "content": [
                    {
                        "eventDate": "2026-06-17T13:41:55.656540+02:00[Europe/Oslo]",
                        "description": "Melding sendt via SMTP",
                        "eventData": "{}",
                        "readableId": "OUT.2606171341.NAVM.ba94b4",
                        "role": "Ytelsesutbetaler",
                        "service": "urn:oasis:names:tc:ebxml-msg:service",
                        "action": "Acknowledgment",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }, {
                        "eventDate": "2026-06-17T13:41:55.646544+02:00[Europe/Oslo]",
                        "description": "Melding lest fra kø",
                        "eventData": "{}",
                        "readableId": "OUT.2606171341.NAVM.ba94b4",
                        "role": "Ytelsesutbetaler",
                        "service": "urn:oasis:names:tc:ebxml-msg:service",
                        "action": "Acknowledgment",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }, {
                        "eventDate": "2026-06-17T13:41:55.645838+02:00[Europe/Oslo]",
                        "description": "Melding lagt på kø",
                        "eventData": "{\"queue_name\":\"team-emottak.smtp.out.ebxml.signal\"}",
                        "readableId": "OUT.2606171341.NAVM.ba94b4",
                        "role": "Ytelsesutbetaler",
                        "service": "urn:oasis:names:tc:ebxml-msg:service",
                        "action": "Acknowledgment",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }, {
                        "eventDate": "2026-06-17T13:41:55.592714+02:00[Europe/Oslo]",
                        "description": "Melding validert mot CPA",
                        "eventData": "{\"sender_name\":\"NAV\"}",
                        "readableId": "OUT.2606171341.NAVM.ba94b4",
                        "role": "Ytelsesutbetaler",
                        "service": "urn:oasis:names:tc:ebxml-msg:service",
                        "action": "Acknowledgment",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }, {
                        "eventDate": "2026-06-17T13:41:55.571979+02:00[Europe/Oslo]",
                        "description": "Melding sendt via SMTP",
                        "eventData": "{}",
                        "readableId": "OUT.2606171341.NAVM.70d76b",
                        "role": "Ytelsesutbetaler",
                        "service": "Inntektsforesporsel",
                        "action": "InntektInformasjon",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }, {
                        "eventDate": "2026-06-17T13:41:55.558518+02:00[Europe/Oslo]",
                        "description": "Melding lest fra kø",
                        "eventData": "{}",
                        "readableId": "OUT.2606171341.NAVM.70d76b",
                        "role": "Ytelsesutbetaler",
                        "service": "Inntektsforesporsel",
                        "action": "InntektInformasjon",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }, {
                        "eventDate": "2026-06-17T13:41:55.558507+02:00[Europe/Oslo]",
                        "description": "Payload mottatt via HTTP",
                        "eventData": "{}",
                        "readableId": "OUT.2606171341.NAVM.70d76b",
                        "role": "Ytelsesutbetaler",
                        "service": "Inntektsforesporsel",
                        "action": "InntektInformasjon",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }, {
                        "eventDate": "2026-06-17T13:41:55.553693+02:00[Europe/Oslo]",
                        "description": "Payload lest fra database",
                        "eventData": "{}",
                        "readableId": "OUT.2606171341.NAVM.70d76b",
                        "role": "Ytelsesutbetaler",
                        "service": "Inntektsforesporsel",
                        "action": "InntektInformasjon",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }, {
                        "eventDate": "2026-06-17T13:41:55.544584+02:00[Europe/Oslo]",
                        "description": "Melding lagt på kø",
                        "eventData": "{\"queue_name\":\"team-emottak.smtp.out.ebxml.payload\"}",
                        "readableId": "OUT.2606171341.NAVM.70d76b",
                        "role": "Ytelsesutbetaler",
                        "service": "Inntektsforesporsel",
                        "action": "InntektInformasjon",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }, {
                        "eventDate": "2026-06-17T13:41:55.498688+02:00[Europe/Oslo]",
                        "description": "Payload lagret i database",
                        "eventData": "{}",
                        "readableId": "OUT.2606171341.NAVM.70d76b",
                        "role": "Ytelsesutbetaler",
                        "service": "Inntektsforesporsel",
                        "action": "InntektInformasjon",
                        "referenceParameter": null,
                        "senderName": "NAV"
                    }
                ],
                "totalPages": 34
            }
        ;
        return [200, payload];
    });

    // Mocke kall til v1/hentlogg?:
    mock.onGet(/\/v1\/hentlogg\?/).reply((config) => {
        console.log("Mocker hentlogg");
        const payload = [
            {
                "hendelsesdato": "2026-06-17 15:30:42.90712",
                "hendelsesbeskrivelse": "Melding mottatt fra intern avsender",
                "hendelsesid": "155"
            },
            {
                "hendelsesdato": "2026-06-17 15:30:42.937318",
                "hendelsesbeskrivelse": "Melding lagret i juridisk logg",
                "hendelsesid": "136"
            },
            {
                "hendelsesdato": "2026-06-17 15:30:42.943654",
                "hendelsesbeskrivelse": "Melding pakket ut av fellesformat",
                "hendelsesid": "172"
            },
            {
                "hendelsesdato": "2026-06-17 15:30:42.94729",
                "hendelsesbeskrivelse": "XML-informasjon hentet fra melding",
                "hendelsesid": "164"
            },
            {
                "hendelsesdato": "2026-06-17 15:30:42.952282",
                "hendelsesbeskrivelse": "Melding kryptert",
                "hendelsesid": "101"
            },
            {
                "hendelsesdato": "2026-06-17 15:30:42.957683",
                "hendelsesbeskrivelse": "Melding lagt på kø",
                "hendelsesid": "187"
            },
            {
                "hendelsesdato": "2026-06-17 15:30:42.968198",
                "hendelsesbeskrivelse": "Melding sendt",
                "hendelsesid": "154"
            }
        ];
        return [200, payload];
    });

    // Mocke kall til v1/hentloggebms?:
    mock.onGet(/\/v1\/hentloggebms\?/).reply((config) => {
        console.log("Mocker hentloggebms");
        const payload = [
            {
                "eventDate": "2026-06-17T15:01:01.794804+02:00[Europe/Oslo]",
                "eventDescription": "Melding mottatt via SMTP",
                "eventId": "1"
            }, {
                "eventDate": "2026-06-17T15:01:01.961656+02:00[Europe/Oslo]",
                "eventDescription": "Payload lagret i database",
                "eventId": "9"
            }, {
                "eventDate": "2026-06-17T15:01:01.981198+02:00[Europe/Oslo]",
                "eventDescription": "Melding lagt på kø",
                "eventId": "15"
            }, {
                "eventDate": "2026-06-17T15:01:01.995638+02:00[Europe/Oslo]",
                "eventDescription": "Payload lest fra database",
                "eventId": "11"
            }, {
                "eventDate": "2026-06-17T15:01:01.996943+02:00[Europe/Oslo]",
                "eventDescription": "Payload mottatt via HTTP",
                "eventId": "13"
            }, {
                "eventDate": "2026-06-17T15:01:02.016677+02:00[Europe/Oslo]",
                "eventDescription": "Melding lest fra kø",
                "eventId": "17"
            }, {
                "eventDate": "2026-06-17T15:01:02.080434+02:00[Europe/Oslo]",
                "eventDescription": "Melding validert mot CPA",
                "eventId": "37"
            }, {
                "eventDate": "2026-06-17T15:01:02.147888+02:00[Europe/Oslo]",
                "eventDescription": "Melding lagret i juridisk logg",
                "eventId": "19"
            }, {
                "eventDate": "2026-06-17T15:01:02.171729+02:00[Europe/Oslo]",
                "eventDescription": "Melding dekryptert",
                "eventId": "23"
            }, {
                "eventDate": "2026-06-17T15:01:02.193386+02:00[Europe/Oslo]",
                "eventDescription": "Signatursjekk vellykket",
                "eventId": "29"
            }, {
                "eventDate": "2026-06-17T15:01:02.484754+02:00[Europe/Oslo]",
                "eventDescription": "Feil ved utsending melding til fagsystem",
                "eventId": "34"
            }
        ];
        return [200, payload];
    });

    // Mocke kall til v1/hentconversationstatusebms
    mock.onGet(/\/v1\/hentconversationstatusebms/).reply((config) => {
        const url = new URL(config.url ?? '', window.location.origin);
        const statuses = url.searchParams.get('statuses') ?? '';
        const cpaId = url.searchParams.get('cpaId') ?? '';
        const service = url.searchParams.get('service') ?? '';
        console.log("Mocker hentconversationstatusebms: " + url);
        let content = [];
        if (statuses.includes("Ferdigbehandlet") && "test-cpa-id".includes(cpaId) && "BehandlerKrav".includes(service)) {
            content.push({
                "createdAt": "2025-04-30T12:59:49.000+02:00[Europe/Oslo]",
                "readableIdList": "IN.2504301259.UNKN.4947c3",
                "service": "BehandlerKrav",
                "cpaId": "test-cpa-id",
                "statusAt": "2025-04-30T12:59:50.000+02:00[Europe/Oslo]",
                "latestStatus": "Ferdigbehandlet"
            })
        }
        if (statuses.includes("Informasjon") && "another-cpa-id".includes(cpaId) && "DialogmoteInnkalling".includes(service)) {
            content.push({
                "createdAt": "2025-04-30T12:56:47.000+02:00[Europe/Oslo]",
                "readableIdList": "OUT.2504301256.NAVM.23532f",
                "service": "DialogmoteInnkalling",
                "cpaId": "another-cpa-id",
                "statusAt": "2025-04-30T12:56:47.000+02:00[Europe/Oslo]",
                "latestStatus": "Informasjon"
            })
        }
        if (statuses.includes("Feil") && "test-cpa-id".includes(cpaId) && "ForesporselFraSaksbehandler".includes(service)) {
            content.push({
                "createdAt": "2025-04-30T12:52:45.000+02:00[Europe/Oslo]",
                "readableIdList": "IN.2504301252.UNKN.c885f9,IN.2504301254.UNKN.13b2cd,OUT.2504301258.NAVM.ec27e9",
                "service": "ForesporselFraSaksbehandler",
                "cpaId": "test-cpa-id",
                "statusAt": "2025-04-30T12:58:49.000+02:00[Europe/Oslo]",
                "latestStatus": "Feil"
            })
        }
        if (statuses.includes("Ferdigbehandlet") && "test-cpa-id".includes(cpaId) && "BehandlerKrav".includes(service)) {
            content.push({
                "createdAt": "2025-04-31T12:59:49.000+02:00[Europe/Oslo]",
                "readableIdList": "IN.2504311259.UNKN.4947c4",
                "service": "BehandlerKrav",
                "cpaId": "test-cpa-id",
                "statusAt": "2025-04-31T12:59:50.000+02:00[Europe/Oslo]",
                "latestStatus": "Ferdigbehandlet"
            })
        }
        if (statuses.includes("Ferdigbehandlet") && "another-cpa-id".includes(cpaId) && "HarBorgerEgenandelFritak".includes(service)) {
            content.push({
                "createdAt": "2025-04-31T12:56:47.000+02:00[Europe/Oslo]",
                "readableIdList": "OUT.2504311256.NAVM.23532f",
                "service": "HarBorgerEgenandelFritak",
                "cpaId": "another-cpa-id",
                "statusAt": "2025-04-31T12:56:47.000+02:00[Europe/Oslo]",
                "latestStatus": "Ferdigbehandlet"
            })
        }
        if (statuses.includes("Ferdigbehandlet") && "test-cpa-id".includes(cpaId) && "HarBorgerFrikort".includes(service)) {
            content.push({
                "createdAt": "2025-04-31T12:52:45.000+02:00[Europe/Oslo]",
                "readableIdList": "IN.2504311252.UNKN.c885f9,IN.2504311254.UNKN.13b2cd,OUT.2504311258.NAVM.ec27e9",
                "service": "HarBorgerFrikort",
                "cpaId": "test-cpa-id",
                "statusAt": "2025-04-31T12:58:49.000+02:00[Europe/Oslo]",
                "latestStatus": "Ferdigbehandlet"
            })
        }
        if (statuses.includes("Ferdigbehandlet") && "test-cpa-id".includes(cpaId) && "HarBorgerFrikortMengde".includes(service)) {
            content.push({
                "createdAt": "2025-05-30T12:59:49.000+02:00[Europe/Oslo]",
                "readableIdList": "IN.2505301259.UNKN.4947c3",
                "service": "HarBorgerFrikortMengde",
                "cpaId": "test-cpa-id",
                "statusAt": "2025-05-30T12:59:50.000+02:00[Europe/Oslo]",
                "latestStatus": "Ferdigbehandlet"
            })
        }
        if (statuses.includes("Informasjon") && "another-cpa-id".includes(cpaId) && "HenvendelseFraLege".includes(service)) {
            content.push({
                "createdAt": "2025-05-30T12:56:47.000+02:00[Europe/Oslo]",
                "readableIdList": "OUT.2505301256.NAVM.23532f",
                "service": "HenvendelseFraLege",
                "cpaId": "another-cpa-id",
                "statusAt": "2025-05-30T12:56:47.000+02:00[Europe/Oslo]",
                "latestStatus": "Informasjon"
            })
        }
        if (statuses.includes("Feil") && "test-cpa-id".includes(cpaId) && "Inntektsforesporsel".includes(service)) {
            content.push({
                "createdAt": "2025-05-30T12:52:45.000+02:00[Europe/Oslo]",
                "readableIdList": "IN.2505301252.UNKN.c885f9,IN.2505301254.UNKN.13b2cd,OUT.2505301258.NAVM.ec27e9",
                "service": "Inntektsforesporsel",
                "cpaId": "test-cpa-id",
                "statusAt": "2025-05-30T12:58:49.000+02:00[Europe/Oslo]",
                "latestStatus": "Feil"
            })
        }
        if (statuses.includes("Ferdigbehandlet") && "test-cpa-id".includes(cpaId) && "Legemelding".includes(service)) {
            content.push({
                "createdAt": "2025-06-30T12:59:49.000+02:00[Europe/Oslo]",
                "readableIdList": "IN.2506301259.UNKN.4947c3",
                "service": "Legemelding",
                "cpaId": "test-cpa-id",
                "statusAt": "2025-06-30T12:59:50.000+02:00[Europe/Oslo]",
                "latestStatus": "Ferdigbehandlet"
            })
        }
        if (statuses.includes("Informasjon") && "another-cpa-id".includes(cpaId) && "OppgjorsKontroll".includes(service)) {
            content.push({
                "createdAt": "2025-06-30T12:56:47.000+02:00[Europe/Oslo]",
                "readableIdList": "OUT.2506301256.NAVM.23532f",
                "service": "OppgjorsKontroll",
                "cpaId": "another-cpa-id",
                "statusAt": "2025-06-30T12:56:47.000+02:00[Europe/Oslo]",
                "latestStatus": "Informasjon"
            })
        }
        if (statuses.includes("Feil") && "test-cpa-id".includes(cpaId) && "PasientlisteForesporsel".includes(service)) {
            content.push({
                "createdAt": "2025-06-30T12:52:45.000+02:00[Europe/Oslo]",
                "readableIdList": "IN.2506301252.UNKN.c885f9,IN.2506301254.UNKN.13b2cd,OUT.2506301258.NAVM.ec27e9",
                "service": "PasientlisteForesporsel",
                "cpaId": "test-cpa-id",
                "statusAt": "2025-06-30T12:58:49.000+02:00[Europe/Oslo]",
                "latestStatus": "Feil"
            })
        }
        // Page:
        const size = parseInt(url.searchParams.get('size') ?? ""+content.length);
        const page = parseInt(url.searchParams.get('page') ?? "1");
        let totalElements = content.length;
        let totalPages = 1;
        if (content.length > size) {
            const stoppIndex = size * page;
            const startIndex = stoppIndex - size;
            content = content.slice(startIndex, stoppIndex);
            totalPages = 2;
        }
        const payload = {
            "page": page,
            "size": content.length,
            "sort": "ASC",
            "totalElements": totalElements,
            "content": content,
            "totalPages": totalPages
        };
        return [200, payload];
    });

    // Mocke kall til v1/hentcpaliste:
    mock.onGet(/\/v1\/hentcpaliste/).reply((config) => {
        console.log("Mocker hentcpaliste");
        let cpaListe = [];
        cpaListe.push({
            partnerName: "Partner1",
            partnerSubjectDN: "Partner 1 - Gågata 2, Oslo",
            partnerID: "11111",
            herID: "12345",
            orgNummer: "123.123.123",
            cpaID: "CPA_ID 1",
            navCppID: "navCppID 1",
            partnerCppID: "partnerCppID 1",
            partnerEndpoint: "http://endpoint.com/1",
            komSystem: "KomSystem",
            lastUsed: "2026-03-03 11:18:02",
            lastUsedEbms: "2026-05-15 00:07:12",
        });
        cpaListe.push({
            partnerName: "Partner2",
            partnerSubjectDN: "Partner 2 - Hagegata 4, Fredrikstad",
            partnerID: "222",
            herID: "23456",
            orgNummer: "222.222.222",
            cpaID: "CPA_ID 2",
            navCppID: "navCppID 2",
            partnerCppID: "partnerCppID 2",
            partnerEndpoint: "https://endpoint.com/2",
            komSystem: "Annet KomSystem",
            lastUsed: null,
            lastUsedEbms: "2026-05-15 00:07:12",
        });
        cpaListe.push({
            partnerName: "Partner3",
            partnerSubjectDN: "Partner 3 - Fiskerigata 1, Molde",
            partnerID: "22222",
            herID: "34567",
            orgNummer: "001.123.123",
            cpaID: "CPA_ID 3",
            navCppID: "navCppID 3",
            partnerCppID: "partnerCppID 3",
            partnerEndpoint: "https://endepunkt.no/3",
            komSystem: "Enda et system",
            lastUsed: "2025-12-12 22:18:02",
            lastUsedEbms: null,
        });
        const payload = {
            partnerCpaListe: cpaListe,
            totalNumberOfEntries: 3,
        };
        return [200, payload];
    });

    // Mocke kall til v1/hentpartnerliste:
    mock.onGet(/\/v1\/hentpartnerliste/).reply((config) => {
        console.log("Mocker hentpartnerliste");
        let partnerListe = [];
        partnerListe.push({
            "partnerName": "Apotek ABC",
            "partnerID": "33221",
            "herID": "131313",
            "orgNummer": "919191919",
            "komSystem": "FarmaItIs",
            "cpaListe": [
                {
                    "partnerSubjectDN": "OID.2.5.4.97=NTRNO-919191919, CN=APOTEK ABC, OU=ER:NO-919191919-APOTEK, O=MITT APOTEK AS, C=NO",
                    "cpaID": "nav:65432",
                    "navCppID": "nav:cpp:001",
                    "partnerCppID": "nav.A123456.20260101010101",
                    "partnerEndpoint": "apotek_abc@edi.nhn.no",
                    "lastUsed": "2026-06-17 09:12:12",
                    "lastUsedEbms": "2026-06-17 14:59:16"
                }
            ]
        });
        partnerListe.push({
            "partnerName": "TANNLEGEHUSET",
            "partnerID": "32111",
            "herID": "121212",
            "orgNummer": "993992991",
            "komSystem": "ItsDental",
            "cpaListe": [
                {
                    "partnerSubjectDN": "SERIALNUMBER=993993993, CN=TANNLEGEHUSET, O=TANNLEGEHUSET, C=NO",
                    "cpaID": "nav:11122",
                    "navCppID": "nav:cpp:002",
                    "partnerCppID": "nav.B112233.20250101010101",
                    "partnerEndpoint": "tannlegehuset@edi.nhn.no",
                    "lastUsed": "2026-06-16 15:15:14",
                    "lastUsedEbms": null
                },
                {
                    "partnerSubjectDN": "OID.2.5.4.97=NTRNO-993993993, CN=TANNLEGEHUSET, O=TANNLEGEHUSET, C=NO",
                    "cpaID": "nav:11133",
                    "navCppID": "nav:cpp:003",
                    "partnerCppID": "nav.B112233.20250101010202",
                    "partnerEndpoint": "tannlegehuset@edi.nhn.no",
                    "lastUsed": null,
                    "lastUsedEbms": null
                }
            ]
        });
        partnerListe.push({
            "partnerName": "ET LEGESENTER",
            "partnerID": "32100",
            "herID": "111111",
            "orgNummer": "994995996",
            "komSystem": "DoctorsOffice",
            "cpaListe": []
        });
        const payload = {
            partnerListe: partnerListe,
            totalNumberOfEntries: 3,
        };
        return [200, payload];
    });

    // Mocke kall til v1/hentabonnementliste:
    mock.onGet(/\/v1\/hentabonnementliste/).reply((config) => {
        console.log("Mocker hentabonnementliste");
        let abonnementliste = [
            {
                "partnerNavn": "SERIALNUMBER=123456789, CN=Noe AS, O=Noe AS, C=NO",
                "partnerOrgnr": "123456789",
                "partnerHerId": "987654321",
                "endretDato": "2014-11-19 14:13:39",
                "sluttDato": null,
                "tssId": "80000654321",
                "behandlerInfo": [
                    {
                        "foravn": "Fornavn",
                        "etteravn": "Etternavn",
                        "hpr": "",
                        "herId": "12345"
                    }
                ],
                "partnerId": "11111",
                "abId": 100
            }, {
                "partnerNavn": "HELSEPLATTFORMEN AS TEST",
                "partnerOrgnr": "922922922",
                "partnerHerId": "81818181",
                "endretDato": "2021-01-01 15:16:17",
                "sluttDato": null,
                "tssId": "80000345678",
                "behandlerInfo": [
                    {
                        "fornavn": "Olaf",
                        "etternavn": "Med A",
                        "hpr": "9999999",
                        "herId": "8888888"
                    }
                ],
                "partnerId": "33333",
                "abId": 3000
            }, {
                "partnerNavn": "Partner uten BehandlerInfo",
                "partnerOrgnr": "500000000",
                "partnerHerId": "8000000",
                "endretDato": "2023-05-03 12:13:14",
                "sluttDato": null,
                "tssId": "80000011111",
                "behandlerInfo": [],
                "partnerId": "22222",
                "abId": 201
            }, {
                "partnerNavn": "Partner med flere BehandlerInfo",
                "partnerOrgnr": "500000000",
                "partnerHerId": "8000000",
                "endretDato": "2023-05-03 12:13:14",
                "sluttDato": null,
                "tssId": "80000011111",
                "behandlerInfo": [
                    {
                        "fornavn": "Ola",
                        "etternavn": "Normann",
                        "hpr": "44441",
                        "herId": ""
                    }, {
                        "fornavn": "Kari",
                        "etternavn": "Normann",
                        "hpr": "",
                        "herId": "44442"
                    }, {
                        "fornavn": "Per",
                        "etternavn": "Sprellman",
                        "hpr": "",
                        "herId": ""
                    }, {
                        "fornavn": "Anne",
                        "etternavn": "Sprellman",
                        "hpr": "777",
                        "herId": "777"
                    }
                ],
                "partnerId": "44444",
                "abId": 202
            }
        ];
        const payload = {
            abonnementListe: abonnementliste,
            totalNumberOfEntries: 4,
        };
        return [200, payload];
    });
}
