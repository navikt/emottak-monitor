import React, {useState} from 'react';
import { Datepicker, isISODateString } from "nav-datovelger";
import TimePicker from "react-time-picker";
import styles from "../styles/grafana.module.scss";
import "../styles/grafana-datetime.css";

const LogsGrafana: React.FC = () => {
    const [service_name, setService_name] = useState('ebms-provider');
    const [level, setLevel] = useState('ERROR');
    const [service, setService] = useState('HarBorgerFrikort');
    const [cpaId, setCpaId] = useState('');
    const [conversationId, setConversationId] = useState('');
    const [messageId, setMessageId] = useState('');
    const [requestId, setRequestId] = useState('');
    const [avsenderIdType, setAvsenderIdType] = useState('HER');
    const [avsenderId, setAvsenderId] = useState('');
    const [action, setAction] = useState('Foresporsel');

    const timeZone = new Date().toLocaleTimeString('no-NO', {
        timeZone: 'Europe/Oslo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const [fromDatePart, setFromDatePart] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10);
    });
    const [toDatePart, setToDatePart] = useState(new Date().toISOString().slice(0, 10));
    const [fromTimePart, setFromTimePart] = useState(timeZone);
    const [toTimePart, setToTimePart] = useState(timeZone);

    const fromDateTimeUtc = new Date(`${fromDatePart} ${fromTimePart}`).toISOString();
    const toDateTimeUtc = new Date(`${toDatePart} ${toTimePart}`).toISOString();

    const applicationService: Record<string, string[]> = {
        'ebms-provider': ['HarBorgerFrikort', 'HarBorgerEgenandelFritak'],
        'ebms-async': ['Inntektsforesporsel', 'Trekkopplysning'],
    };

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

    const generateUrl = (): string => {
        const baseUrl = `https://grafana.nav.cloud.nais.io/a/grafana-lokiexplore-app/explore/service/${service_name}/logs`;

        const enc = (value: string) =>
            encodeURIComponent(value).replace(/%3A/gi, ':').replace(/%2C/gi, ',');

        const p = (key: string, value: string) => `${key}=${enc(value)}`;

        const createJsonFieldEquals = (key: string, value: string) => {
            return `${key}|=|{"parser":"json"__gfc__"value":"${value}"},${value}`;
        };

        const createFieldEquals = (key: string, value: string) => {
            return `${key}|=|${value}`;
        };

        const activeFields = [
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

        const k8sClusterName = import.meta.env.VITE_GRAFANA_CLUSTER_NAME as string;
        console.log(`k8s_cluster_name: ${k8sClusterName}`);
        const parts = [
            p('patterns', '[]'),
            p('from', fromDateTimeUtc),
            p('to', toDateTimeUtc),
            p('var-filters', createFieldEquals('service_name', service_name)),
            p('var-filters', createFieldEquals('k8s_cluster_name', k8sClusterName)),
            ...activeFields.map(({ key, value }) => p('var-fields', createJsonFieldEquals(key, value))),
            p('displayedFields', columnsJson),
            p('urlColumns', urlColumnsJson),
            p('timezone', 'browser'),
            ...activeFields.map(({ key, value }) => p('var-all-fields', createFieldEquals(key, value))),
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

    return (
        <div className={styles.container}>
            <h2>Grafana ebxml konvolutt ({import.meta.env.VITE_DEPLOY_TARGET})</h2>
            <form>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Service_name: Sync (ebms-provider) / Async (ebms-async):</label>
                    <select value={service_name} onChange={(e) => {
                        const newServiceName = e.target.value;
                        setService_name(newServiceName);
                        const firstService = applicationService[newServiceName][0];
                        setService(firstService);
                        setAction(serviceActions[firstService][0]);
                    }} className={styles.input}>
                        <option value="ebms-provider">ebms-provider</option>
                        <option value="ebms-async">ebms-async</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Loggnivå (level):</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)} className={styles.input}>
                        <option value="ERROR">ERROR</option>
                        <option value="WARN">WARN</option>
                        <option value="INFO">INFO</option>
                        <option value="DEBUG">DEBUG</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Service:</label>
                    <select value={service} onChange={handleServiceChange} className={styles.input}>
                        {applicationService[service_name].map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Action:</label>
                    <select value={action} onChange={(e) => setAction(e.target.value)} className={styles.input}>
                        {serviceActions[service].map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>CpaId:</label>
                    <input type="text" value={cpaId} onChange={(e) => setCpaId(e.target.value)} className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Conversation ID:</label>
                    <input type="text" value={conversationId} onChange={(e) => setConversationId(e.target.value)} className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Message ID:</label>
                    <input type="text" value={messageId} onChange={(e) => setMessageId(e.target.value)} className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Request ID:</label>
                    <input type="text" value={requestId} onChange={(e) => setRequestId(e.target.value)} className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Avsender ID:</label>
                    <div className={styles.row}>
                        <select value={avsenderIdType} onChange={(e) => setAvsenderIdType(e.target.value)} className={styles.halfInput}>
                            <option value="HER">HER:</option>
                            <option value="orgnummer">orgnummer:</option>
                            <option value="ENH">ENH:</option>
                        </select>
                        <input type="text" value={avsenderId} onChange={(e) => setAvsenderId(e.target.value)} placeholder="ID" className={styles.halfInput} />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Fra:</label>
                    <div className={styles.row}>
                        <Datepicker
                            locale={"nb"}
                            inputId="datepicker-input-fom"
                            value={fromDatePart}
                            onChange={setFromDatePart}
                            inputProps={{
                                name: "fromDateInput",
                                "aria-invalid":
                                    fromDatePart !== "" && !isISODateString(fromDatePart),
                            }}
                            calendarSettings={{
                                showWeekNumbers: false,
                                position: 'under'
                            }}
                            showYearSelector={true}
                        />
                        <TimePicker
                            onChange={(value) => {
                                if (value !== null) {
                                    typeof value === "string"
                                        ? setFromTimePart(value)
                                        : setFromTimePart(value.toLocaleTimeString());
                                }
                            }}
                            value={fromTimePart}
                            format="HH:mm"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Til:</label>
                    <div className={styles.row}>
                        <Datepicker
                            locale={"nb"}
                            inputId="datepicker-input-tom"
                            value={toDatePart}
                            onChange={setToDatePart}
                            inputProps={{
                                name: "toDateInput",
                                "aria-invalid":
                                    toDatePart !== "" && !isISODateString(toDatePart),
                            }}
                            calendarSettings={{
                                showWeekNumbers: false,
                                position: 'under'
                            }}
                            showYearSelector={true}
                        />
                        <TimePicker
                            onChange={(value) => {
                                if (value !== null) {
                                    typeof value === "string"
                                        ? setToTimePart(value)
                                        : setToTimePart(value.toLocaleTimeString());
                                }
                            }}
                            value={toTimePart}
                            format="HH:mm"
                        />
                    </div>
                </div>
                {((fromDatePart > toDatePart) || (fromDatePart == toDatePart && fromTimePart > toTimePart)) && (
                    <div className={styles.error}>
                        ⚠️ «Fra»-dato er etter «Til»-dato.
                    </div>
                )}
                <a href={generateUrl()} target="_blank" rel="noopener noreferrer" className={styles.anchor}>
                    Åpne i Grafana 🚀
                </a>
            </form>
        </div>
    );
};
export default LogsGrafana;
