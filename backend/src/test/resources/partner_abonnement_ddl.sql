  CREATE TABLE if not exists "PARTNER"
  (
      "PARTNER_ID"              NUMBER(10,0),
      "NAVN"                    VARCHAR2(255 BYTE),
      "HER_ID"                  VARCHAR2(50 BYTE),
      "ORGNUMMER"               VARCHAR2(50 BYTE),
      "KOMMUNIKASJONSSYSTEM_ID" NUMBER(10,0)
  );

  CREATE TABLE if not exists "PARTNER_CPA"
  (
      "CPA_ID"            VARCHAR2(50 BYTE),
      "PARTNER_ID"        NUMBER(10,0),
      "NAV_CPP_ID"        VARCHAR2(100 BYTE),
      "PARTNER_CPP_ID"    VARCHAR2(100 BYTE),
      "PARTNER_SUBJECTDN" VARCHAR2(1024 BYTE),
      "PARTNER_ENDPOINT"  VARCHAR2(512 BYTE),
      "LASTUSED"          TIMESTAMP(6)
  );

  CREATE TABLE if not exists "KOMMUNIKASJONSSYSTEM"
  (
      "KOMMUNIKASJONSSYSTEM_ID" NUMBER(10,0),
      "BESKRIVELSE"             VARCHAR2(255 BYTE)
  );

  CREATE TABLE if not exists "ABONNEMENT"
  (
      "TJENESTE_ID" NUMBER(10,0),
      "KEY"         VARCHAR2(4000 BYTE),
      "DATA"        CLOB,
      "SLUTT_DATO"  TIMESTAMP (6),
      "SIST_ENDRET" TIMESTAMP (6) DEFAULT SYSDATE,
      "PARTNER_ID"  NUMBER(10,0),
      "MOTTAK_ID"   VARCHAR2(50 BYTE),
      "AB_ID"       NUMBER(10,0)
  );