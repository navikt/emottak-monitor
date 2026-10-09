type FilterProps<T, K extends keyof T> = {
    service_name: string;
    fromDate: string;
    conversationId: string;
    messageId: string;
    requestId: string;
};

const GrafanaLogg = <T, K extends keyof T>({
                                               service_name,
                                               fromDate,
                                               conversationId,
                                               messageId,
                                               requestId,
                                           }: FilterProps<T, K>) => {

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
        { key: 'conversationId', value: conversationId },
        { key: 'messageId', value: messageId },
        { key: 'requestId', value: requestId },
    ].filter(({ value }) => value.trim() !== '');

    const columnsJson = JSON.stringify(["cpaId", "message", "service", "action", "avsenderId", "conversationId", "k8s_cluster_name", "level", "messageId"]);
    const urlColumnsJson = JSON.stringify(["Time", "cpaId", "message", "service", "action", "avsenderId", "conversationId", "k8s_cluster_name", "level", "messageId"]);

    const k8sClusterName = import.meta.env.VITE_GRAFANA_CLUSTER_NAME as string;
    console.log(`k8s_cluster_name: ${k8sClusterName}`);
    const parts = [
        p('patterns', '[]'),
        p('from', fromDate),
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

export default GrafanaLogg;