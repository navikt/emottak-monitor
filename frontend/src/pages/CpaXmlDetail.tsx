import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";

const CpaXmlDetail = () => {
  const { cpaId } = useParams();
  const { fetchState, callRequest } = useFetch<string>(
    `/v1/cpaxmldetail?cpaId=${encodeURIComponent(cpaId ?? "")}`
  );
  const { loading, error, data } = fetchState;

  useEffect(() => {
    if (cpaId) {
      callRequest();
    }
  }, [callRequest, cpaId]);

  return (
    <div>
      <h1>CPA: {cpaId}</h1>
      {!cpaId && <p role="alert">Mangler CPA-id.</p>}
      {loading && <NavFrontendSpinner />}
      {!loading && error && <p role="alert">{error.message}</p>}
      {!loading && !error && data !== null && (
        <iframe
          title={`CPA ${cpaId}`}
          srcDoc={data}
          sandbox=""
          style={{ width: "80vw", maxWidth: "100%", height: "70vh", border: 0 }}
        />
      )}
    </div>
  );
};

export default CpaXmlDetail;
