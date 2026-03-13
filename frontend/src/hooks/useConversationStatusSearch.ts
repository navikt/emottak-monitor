import useFetch from "./useFetch";
import {useCallback, useEffect, useState} from "react";

export interface ConversationStatusSearchParams {
    statuses: string;
    cpaIdPattern: string;
    service: string;
    fromDate?: string;
    fromTime?: string;
    toDate?: string;
    toTime?: string;
    currentPage: number;
    pageSize: number;
    sortOrder: string; // "ASC" | "DESC"
}

export interface ConversationStatusInfo {
    createdAt: string;
    readableIdList: string;
    service: string;
    cpaId: string;
    statusAt: string;
    latestStatus: string;
}

export interface Page {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    content: ConversationStatusInfo[];
}

const buildUrl = (params: ConversationStatusSearchParams): string => {
    let url = `/v1/hentconversationstatusebms?` +
        `&cpaId=${params.cpaIdPattern}&service=${params.service}` +
        `&statuses=${params.statuses}` +
        `&page=${params.currentPage}&size=${params.pageSize}&sort=${params.sortOrder}`;
    if (params.fromDate != null && params.fromTime != null) {
        url += `&fromDate=${params.fromDate}%20${params.fromTime}`;
    }
    if (params.toDate != null && params.toTime != null) {
        url += `&toDate=${params.toDate}%20${params.toTime}`;
    }
    return url;
};

export function useConversationStatusSearch(searchParams: ConversationStatusSearchParams) {
    const [params, setParams] = useState<ConversationStatusSearchParams>(searchParams);
    const requestUrl = buildUrl(searchParams);
    const { fetchState, callRequest } = useFetch<Page>(requestUrl);
    useEffect(() => {
        callRequest();
    }, []);

    const triggerSearch = useCallback(
        (newParams: ConversationStatusSearchParams) => {
            setParams(newParams);
            callRequest(buildUrl(newParams));
        },
        [params, callRequest]
    );

    const goToPage = (page: number) => {
        triggerSearch({ ...params, currentPage: page });
    };

    return {
        data: fetchState.data,
        loading: fetchState.loading,
        error: fetchState.error,
        params,
        setParams,
        triggerSearch,
        goToPage
    }
}
