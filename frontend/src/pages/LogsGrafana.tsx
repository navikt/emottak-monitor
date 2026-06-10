
import React, {useEffect, useState} from 'react';

const LogsGrafana: React.FC = () => {
    const [service_name, setService_name] = useState('ebms-provider');
    const [level, setLevel] = useState('ERROR');
    const [service, setService] = useState('');
    const [cpaId, setCpaId] = useState('');
    const [conversationId, setConversationId] = useState('');
    const [messageId, setMessageId] = useState('');
    const [requestId, setRequestId] = useState('');
    const [avsenderIdType, setAvsenderIdType] = useState('HER:');
    const [avsenderId, setAvsenderId] = useState('');
    const [action, setAction] = useState('Foresporsel');
    const [fromDatePart, setFromDatePart] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10);
    });
    const timeZone = new Date().toLocaleTimeString('no-NO', {
        timeZone: 'Europe/Oslo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const [fromTimePart, setFromTimePart] = useState(timeZone);
    const [toDatePart, setToDatePart] = useState(new Date().toISOString().slice(0, 10));
    const [toTimePart, setToTimePart] = useState(timeZone);
    const serviceActions: Record<string, string[]> = {
        '': [''],
        Inntektsforesporsel: ['InntektInformasjon', 'Foresporsel', 'Avvisning'],
        Trekkopplysning: ['Innmelding', 'Kvittering', 'Avvisning'],
        HarBorgerFrikort: ['EgenandelForesporsel', 'Svar', 'Avvisning'],
        HarBorgerEgenandelFritak: ['EgenandelForesporsel', 'Svar', 'Avvisning'],
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newService = e.target.value;
        setService(newService);
        setAction(serviceActions[newService][0]);
    };

    const createVarFieldString = (key: string, value: string) => {
        return `${key}|=|${value}`;
    };

    const generateUrl = (): string => {
        const baseUrl = `https://grafana.nav.cloud.nais.io/a/grafana-lokiexplore-app/explore/service/${service_name}/logs`;

        const enc = (value: string) =>
            encodeURIComponent(value).replace(/%3A/gi, ':').replace(/%2C/gi, ',');

        const p = (key: string, value: string) => `${key}=${enc(value)}`;

        const activeFields = [
            { key: 'service_name', value: service_name },
            { key: 'level', value: level },
            { key: 'service', value: service },
            { key: 'conversationId', value: conversationId },
            { key: 'cpaId', value: cpaId },
            { key: 'avsenderId', value: avsenderId ? `${avsenderIdType}:${avsenderId}` : '' },
            { key: 'messageId', value: messageId },
            { key: 'action', value: action },
            { key: 'requestId', value: requestId },
        ].filter(({ value }) => value.trim() !== '');

        const columnsJson = JSON.stringify(["cpaId", "message", "service", "action", "avsenderId", "conversationId", "k8s_cluster_name", "level", "messageId"]);
        const urlColumnsJson = JSON.stringify(["Time", "cpaId", "message", "service", "action", "avsenderId", "conversationId", "k8s_cluster_name", "level", "messageId"]);

        // const grafanaDsId = import.meta.env.VITE_GRAFANA_DS_ID as string;
        // TODO: env.dev P7BE696147D279490
        // TODO: env.prod "PD969E40991D5C4A8";
        const grafanaDsId = "PD969E40991D5C4A8";
        console.log(`grafanaDsId: ${grafanaDsId}`)
        const parts = [
            p('patterns', '[]'),
            p('from', `${fromDatePart}T${fromTimePart}:00.000Z`),
            p('to', `${toDatePart}T${toTimePart}:00.000Z`),
            p('var-ds', grafanaDsId),
            p('var-filters', `service_name|=|${service_name}`),
            // p('var-fields','cpaId|=|cpaId'),
            ...activeFields.map(({ key, value }) => p('var-fields', createVarFieldString(key, value))),
            p('displayedFields', columnsJson),
            p('urlColumns', urlColumnsJson),
            p('timezone', 'browser'),
            ...activeFields.map(({ key, value }) => p('var-all-fields', createVarFieldString(key, value))),
            p('userDisplayedFields', 'false'),
            p('var-lineFormat', ''),
            p('var-levels', ''),
            p('var-metadata', ''),
            p('var-jsonFields', ''),
            p('var-patterns', ''),
            p('var-lineFilterV2', ''),
            p('var-lineFilters', ''),
            p('visualizationType', '"table"'),
            p('sortOrder', '"Descending"'),
        ];

        const url = `${baseUrl}?${parts.join('&')}`;
        console.log(url);
        return url;
    };

    const styles = {
        container: { maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' },
        container2: { maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' },
        formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' as const },
        label: { fontWeight: 'bold' as const, marginBottom: '5px', fontSize: '14px' },
        input: { padding: '8px', borderRadius: '4px', border: '1px solid #999', fontSize: '14px' },
        row: { display: 'flex', gap: '10px' },
        halfInput: { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #999', fontSize: '14px' },
        anchor: { display: 'inline-block', padding: '10px 15px', backgroundColor: '#0067c5', color: '#fff', borderRadius: '4px', fontWeight: 'bold' as const, fontSize: '16px', textDecoration: 'none' },
    };

    return (
        <div style={styles.container}>
            <h2>Grafana ebxl konvolutt ({import.meta.env.VITE_DEPLOY_TARGET})</h2>
            <form>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Service_name: Sync (ebms-provider) / Async (ebms-async):</label>
                    <select value={service_name} onChange={(e) => setService_name(e.target.value)} style={styles.input}>
                        <option value="ebms-provider">ebms-provider</option>
                        <option value="ebms-async">ebms-async</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Loggnivå (level):</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)} style={styles.input}>
                        <option value="ERROR">ERROR</option>
                        <option value="WARN">WARN</option>
                        <option value="INFO">INFO</option>
                        <option value="DEBUG">DEBUG</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Service:</label>
                    <select value={service} onChange={handleServiceChange} style={styles.input}>
                        <option value=""></option>
                        <option value="Inntektsforesporsel">Inntektsforesporsel</option>
                        <option value="Trekkopplysning">Trekkopplysning</option>
                        <option value="HarBorgerFrikort">HarBorgerFrikort</option>
                        <option value="HarBorgerEgenandelFritak">HarBorgerEgenandelFritak</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Action:</label>
                    <select value={action} onChange={(e) => setAction(e.target.value)} style={styles.input}>
                        {serviceActions[service].map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>CpaId:</label>
                    <input type="text" value={cpaId} onChange={(e) => setCpaId(e.target.value)} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Conversation ID:</label>
                    <input type="text" value={conversationId} onChange={(e) => setConversationId(e.target.value)} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Message ID:</label>
                    <input type="text" value={messageId} onChange={(e) => setMessageId(e.target.value)} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Request ID:</label>
                    <input type="text" value={requestId} onChange={(e) => setRequestId(e.target.value)} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Avsender ID:</label>
                    <div style={styles.row}>
                        <select value={avsenderIdType} onChange={(e) => setAvsenderIdType(e.target.value)} style={styles.halfInput}>
                            <option value="HER">HER:</option>
                            <option value="orgnummer">orgnummer:</option>
                            <option value="ENH">ENH:</option>
                        </select>
                        <input type="text" value={avsenderId} onChange={(e) => setAvsenderId(e.target.value)} placeholder="ID" style={styles.halfInput} />
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Fra (from):</label>
                    <div style={styles.row}>
                        <input
                            type="date"
                            value={fromDatePart}
                            onChange={(e) => setFromDatePart(e.target.value)}
                            style={styles.halfInput}
                        />
                        <input
                            type="time"
                            value={fromTimePart}
                            onChange={(e) => setFromTimePart(e.target.value)}
                            style={styles.halfInput}
                        />
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Til (to):</label>
                    <div style={styles.row}>
                        <input
                            type="date"
                            value={toDatePart}
                            onChange={(e) => setToDatePart(e.target.value)}
                            style={styles.halfInput}
                        />
                        <input
                            type="time"
                            value={toTimePart}
                            onChange={(e) => setToTimePart(e.target.value)}
                            style={styles.halfInput}
                        />
                    </div>
                </div>

                <a href={generateUrl()} target="_blank" rel="noopener noreferrer" style={styles.anchor}>
                    Åpne i Grafana 🚀
                </a>
            </form>
        </div>
    );
};
export default LogsGrafana;
