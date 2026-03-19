--
-- PostgreSQL database dump
--

\restrict WHKfBTRKuEdCbyWEZmTc7Z36EWM9V9JE6jnYbPgt7Fv2ExraxInqF93gxgnda8e

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

-- Started on 2026-03-02 09:36:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 95321)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 6396 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 6 (class 2615 OID 43415)
-- Name: topology; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO postgres;

--
-- TOC entry 6398 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- TOC entry 2 (class 3079 OID 95849)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 6399 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 240 (class 1259 OID 152668)
-- Name: abonnements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.abonnements (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    type_abonnement character varying(255) NOT NULL,
    prix numeric(10,2) NOT NULL,
    date_debut timestamp(0) without time zone NOT NULL,
    date_fin timestamp(0) without time zone NOT NULL,
    statut character varying(255) DEFAULT 'en_attente_paiement'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    categorie character varying(255) DEFAULT 'basic'::character varying NOT NULL,
    est_visible boolean DEFAULT true NOT NULL,
    ordre_affichage integer DEFAULT 0 NOT NULL,
    nb_reservations_max integer,
    nb_terrains_favoris_max integer,
    reduction_pourcentage numeric(5,2),
    date_debut_validite date,
    date_fin_validite date,
    couleur_theme character varying(255),
    icone character varying(255),
    fonctionnalites_speciales json,
    type_abonnement_id bigint,
    jour_prefere integer,
    heure_preferee time(0) without time zone,
    nb_seances_semaine integer DEFAULT 1 NOT NULL,
    duree_seance numeric(3,1) DEFAULT '1'::numeric NOT NULL,
    preferences_flexibles boolean DEFAULT true NOT NULL,
    jours_alternatifs json,
    heures_alternatives json,
    CONSTRAINT abonnements_categorie_check CHECK (((categorie)::text = ANY ((ARRAY['basic'::character varying, 'premium'::character varying, 'entreprise'::character varying, 'promo'::character varying])::text[])))
);


ALTER TABLE public.abonnements OWNER TO postgres;

--
-- TOC entry 6400 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN abonnements.jour_prefere; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.abonnements.jour_prefere IS 'Jour préféré de la semaine (0=dimanche, 1=lundi, etc.)';


--
-- TOC entry 6401 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN abonnements.heure_preferee; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.abonnements.heure_preferee IS 'Heure préférée pour jouer';


--
-- TOC entry 6402 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN abonnements.nb_seances_semaine; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.abonnements.nb_seances_semaine IS 'Nombre de séances par semaine';


--
-- TOC entry 6403 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN abonnements.duree_seance; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.abonnements.duree_seance IS 'Durée de chaque séance en heures';


--
-- TOC entry 6404 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN abonnements.preferences_flexibles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.abonnements.preferences_flexibles IS 'Les préférences sont-elles flexibles ou strictes?';


--
-- TOC entry 6405 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN abonnements.jours_alternatifs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.abonnements.jours_alternatifs IS 'Jours alternatifs acceptés (JSON array)';


--
-- TOC entry 6406 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN abonnements.heures_alternatives; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.abonnements.heures_alternatives IS 'Heures alternatives acceptées (JSON array)';


--
-- TOC entry 239 (class 1259 OID 152667)
-- Name: abonnements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.abonnements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.abonnements_id_seq OWNER TO postgres;

--
-- TOC entry 6407 (class 0 OID 0)
-- Dependencies: 239
-- Name: abonnements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.abonnements_id_seq OWNED BY public.abonnements.id;


--
-- TOC entry 278 (class 1259 OID 153062)
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_events (
    id bigint NOT NULL,
    event_name character varying(255) NOT NULL,
    event_category character varying(255),
    user_id bigint,
    session_id character varying(255),
    properties json,
    user_agent json,
    ip_address inet,
    referrer character varying(255),
    page_url character varying(255),
    value numeric(10,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.analytics_events OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 153061)
-- Name: analytics_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analytics_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analytics_events_id_seq OWNER TO postgres;

--
-- TOC entry 6408 (class 0 OID 0)
-- Dependencies: 277
-- Name: analytics_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analytics_events_id_seq OWNED BY public.analytics_events.id;


--
-- TOC entry 226 (class 1259 OID 152567)
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 152574)
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 152977)
-- Name: configuration_systeme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuration_systeme (
    id bigint NOT NULL,
    cle character varying(255) NOT NULL,
    valeur text NOT NULL,
    section character varying(50) NOT NULL,
    type character varying(20) DEFAULT 'string'::character varying NOT NULL,
    description text,
    visible_interface boolean DEFAULT true NOT NULL,
    modifiable boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.configuration_systeme OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 152976)
-- Name: configuration_systeme_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuration_systeme_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuration_systeme_id_seq OWNER TO postgres;

--
-- TOC entry 6409 (class 0 OID 0)
-- Dependencies: 269
-- Name: configuration_systeme_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuration_systeme_id_seq OWNED BY public.configuration_systeme.id;


--
-- TOC entry 309 (class 1259 OID 153467)
-- Name: contrats_commission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contrats_commission (
    id bigint NOT NULL,
    gestionnaire_id bigint NOT NULL,
    terrain_synthetique_id bigint,
    taux_commission numeric(5,2) NOT NULL,
    type_contrat character varying(255) DEFAULT 'global'::character varying NOT NULL,
    date_debut date NOT NULL,
    date_fin date,
    statut character varying(255) DEFAULT 'actif'::character varying NOT NULL,
    conditions_speciales text,
    historique_negociation json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT contrats_commission_statut_check CHECK (((statut)::text = ANY ((ARRAY['actif'::character varying, 'suspendu'::character varying, 'expire'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT contrats_commission_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['global'::character varying, 'par_terrain'::character varying])::text[])))
);


ALTER TABLE public.contrats_commission OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 153466)
-- Name: contrats_commission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contrats_commission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contrats_commission_id_seq OWNER TO postgres;

--
-- TOC entry 6410 (class 0 OID 0)
-- Dependencies: 308
-- Name: contrats_commission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contrats_commission_id_seq OWNED BY public.contrats_commission.id;


--
-- TOC entry 274 (class 1259 OID 153020)
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id bigint NOT NULL,
    type character varying(255) DEFAULT 'private'::character varying NOT NULL,
    subject character varying(255),
    reservation_id bigint,
    participants json NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 153019)
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO postgres;

--
-- TOC entry 6411 (class 0 OID 0)
-- Dependencies: 273
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- TOC entry 252 (class 1259 OID 152784)
-- Name: demandes_remboursement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes_remboursement (
    id bigint NOT NULL,
    reservation_id bigint NOT NULL,
    user_id bigint NOT NULL,
    type_remboursement character varying(255) NOT NULL,
    montant_demande numeric(10,2) NOT NULL,
    raison text NOT NULL,
    statut character varying(255) DEFAULT 'en_attente_approbation'::character varying NOT NULL,
    evidence_meteorologique text,
    commentaire_admin text,
    date_traitement timestamp(0) without time zone,
    traite_par bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT demandes_remboursement_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente_approbation'::character varying, 'approuve'::character varying, 'rejete'::character varying, 'traite'::character varying])::text[]))),
    CONSTRAINT demandes_remboursement_type_remboursement_check CHECK (((type_remboursement)::text = ANY ((ARRAY['refund_full'::character varying, 'refund_partial'::character varying, 'refund_minimal'::character varying, 'weather_refund'::character varying])::text[])))
);


ALTER TABLE public.demandes_remboursement OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 152783)
-- Name: demandes_remboursement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demandes_remboursement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demandes_remboursement_id_seq OWNER TO postgres;

--
-- TOC entry 6412 (class 0 OID 0)
-- Dependencies: 251
-- Name: demandes_remboursement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demandes_remboursement_id_seq OWNED BY public.demandes_remboursement.id;


--
-- TOC entry 282 (class 1259 OID 153090)
-- Name: error_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.error_logs (
    id bigint NOT NULL,
    error_type character varying(255) NOT NULL,
    severity character varying(255) DEFAULT 'error'::character varying NOT NULL,
    message text NOT NULL,
    stack_trace text,
    file_path character varying(255),
    line_number integer,
    user_id bigint,
    user_agent character varying(255),
    context json,
    resolved boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.error_logs OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 153089)
-- Name: error_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.error_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.error_logs_id_seq OWNER TO postgres;

--
-- TOC entry 6413 (class 0 OID 0)
-- Dependencies: 281
-- Name: error_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.error_logs_id_seq OWNED BY public.error_logs.id;


--
-- TOC entry 232 (class 1259 OID 152599)
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 152598)
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- TOC entry 6414 (class 0 OID 0)
-- Dependencies: 231
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- TOC entry 272 (class 1259 OID 153000)
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 152999)
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_id_seq OWNER TO postgres;

--
-- TOC entry 6415 (class 0 OID 0)
-- Dependencies: 271
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- TOC entry 300 (class 1259 OID 153321)
-- Name: historique_litige; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historique_litige (
    id bigint NOT NULL,
    litige_id bigint NOT NULL,
    user_id bigint NOT NULL,
    action character varying(255) NOT NULL,
    statut_avant character varying(255),
    statut_apres character varying(255) NOT NULL,
    commentaire text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.historique_litige OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 153320)
-- Name: historique_litige_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historique_litige_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historique_litige_id_seq OWNER TO postgres;

--
-- TOC entry 6416 (class 0 OID 0)
-- Dependencies: 299
-- Name: historique_litige_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historique_litige_id_seq OWNED BY public.historique_litige.id;


--
-- TOC entry 254 (class 1259 OID 152815)
-- Name: historique_prix_terrains; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historique_prix_terrains (
    id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    gestionnaire_id bigint NOT NULL,
    ancien_prix numeric(8,2) NOT NULL,
    nouveau_prix numeric(8,2) NOT NULL,
    raison text,
    created_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.historique_prix_terrains OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 152814)
-- Name: historique_prix_terrains_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historique_prix_terrains_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historique_prix_terrains_id_seq OWNER TO postgres;

--
-- TOC entry 6417 (class 0 OID 0)
-- Dependencies: 253
-- Name: historique_prix_terrains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historique_prix_terrains_id_seq OWNED BY public.historique_prix_terrains.id;


--
-- TOC entry 230 (class 1259 OID 152591)
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 152582)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 152581)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- TOC entry 6418 (class 0 OID 0)
-- Dependencies: 228
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 294 (class 1259 OID 153236)
-- Name: litiges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.litiges (
    id bigint NOT NULL,
    numero_litige character varying(255) NOT NULL,
    user_id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    reservation_id bigint,
    type_litige character varying(255) NOT NULL,
    sujet character varying(255) NOT NULL,
    description text NOT NULL,
    priorite character varying(255) DEFAULT 'normale'::character varying NOT NULL,
    statut character varying(255) DEFAULT 'nouveau'::character varying NOT NULL,
    niveau_escalade character varying(255) DEFAULT 'client'::character varying NOT NULL,
    preuves json,
    resolution text,
    satisfaction_client integer,
    ferme_par bigint,
    date_escalade timestamp(0) without time zone,
    date_fermeture timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT litiges_niveau_escalade_check CHECK (((niveau_escalade)::text = ANY ((ARRAY['client'::character varying, 'gestionnaire'::character varying, 'admin'::character varying])::text[]))),
    CONSTRAINT litiges_priorite_check CHECK (((priorite)::text = ANY ((ARRAY['faible'::character varying, 'normale'::character varying, 'elevee'::character varying, 'urgente'::character varying])::text[]))),
    CONSTRAINT litiges_statut_check CHECK (((statut)::text = ANY ((ARRAY['nouveau'::character varying, 'en_cours'::character varying, 'en_attente_reponse'::character varying, 'escalade'::character varying, 'resolu'::character varying, 'ferme'::character varying])::text[]))),
    CONSTRAINT litiges_type_litige_check CHECK (((type_litige)::text = ANY ((ARRAY['reservation'::character varying, 'paiement'::character varying, 'service'::character varying, 'equipement'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE public.litiges OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 153235)
-- Name: litiges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.litiges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.litiges_id_seq OWNER TO postgres;

--
-- TOC entry 6419 (class 0 OID 0)
-- Dependencies: 293
-- Name: litiges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.litiges_id_seq OWNED BY public.litiges.id;


--
-- TOC entry 268 (class 1259 OID 152959)
-- Name: logs_systeme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_systeme (
    id bigint NOT NULL,
    user_id bigint,
    niveau character varying(255) NOT NULL,
    module character varying(50) NOT NULL,
    action character varying(255) NOT NULL,
    details text,
    ip_address inet,
    user_agent text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT logs_systeme_niveau_check CHECK (((niveau)::text = ANY ((ARRAY['debug'::character varying, 'info'::character varying, 'warning'::character varying, 'error'::character varying, 'critical'::character varying])::text[])))
);


ALTER TABLE public.logs_systeme OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 152958)
-- Name: logs_systeme_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_systeme_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_systeme_id_seq OWNER TO postgres;

--
-- TOC entry 6420 (class 0 OID 0)
-- Dependencies: 267
-- Name: logs_systeme_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_systeme_id_seq OWNED BY public.logs_systeme.id;


--
-- TOC entry 276 (class 1259 OID 153038)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    content text NOT NULL,
    type character varying(255) DEFAULT 'text'::character varying NOT NULL,
    attachments json,
    read_at timestamp(0) without time zone,
    is_edited boolean DEFAULT false NOT NULL,
    edited_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 153037)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 6421 (class 0 OID 0)
-- Dependencies: 275
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 296 (class 1259 OID 153277)
-- Name: messages_litige; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages_litige (
    id bigint NOT NULL,
    litige_id bigint NOT NULL,
    user_id bigint NOT NULL,
    role_expediteur character varying(255) NOT NULL,
    message text NOT NULL,
    type_message character varying(255) NOT NULL,
    pieces_jointes json,
    lu boolean DEFAULT false NOT NULL,
    lu_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT messages_litige_role_expediteur_check CHECK (((role_expediteur)::text = ANY ((ARRAY['client'::character varying, 'gestionnaire'::character varying, 'admin'::character varying])::text[]))),
    CONSTRAINT messages_litige_type_message_check CHECK (((type_message)::text = ANY ((ARRAY['probleme_initial'::character varying, 'reponse'::character varying, 'escalade'::character varying, 'resolution'::character varying, 'information'::character varying])::text[])))
);


ALTER TABLE public.messages_litige OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 153276)
-- Name: messages_litige_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_litige_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_litige_id_seq OWNER TO postgres;

--
-- TOC entry 6422 (class 0 OID 0)
-- Dependencies: 295
-- Name: messages_litige_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_litige_id_seq OWNED BY public.messages_litige.id;


--
-- TOC entry 225 (class 1259 OID 152561)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 152560)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- TOC entry 6423 (class 0 OID 0)
-- Dependencies: 224
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 290 (class 1259 OID 153187)
-- Name: niveaux_fidelite_terrain; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.niveaux_fidelite_terrain (
    id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    niveau character varying(255) NOT NULL,
    points_requis integer NOT NULL,
    reduction_pourcentage integer NOT NULL,
    avantages json NOT NULL,
    couleur_badge character varying(255) DEFAULT '#808080'::character varying NOT NULL,
    icone character varying(255) DEFAULT 'star'::character varying NOT NULL,
    est_actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.niveaux_fidelite_terrain OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 153186)
-- Name: niveaux_fidelite_terrain_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.niveaux_fidelite_terrain_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.niveaux_fidelite_terrain_id_seq OWNER TO postgres;

--
-- TOC entry 6424 (class 0 OID 0)
-- Dependencies: 289
-- Name: niveaux_fidelite_terrain_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.niveaux_fidelite_terrain_id_seq OWNED BY public.niveaux_fidelite_terrain.id;


--
-- TOC entry 260 (class 1259 OID 152875)
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_templates (
    id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    sujet character varying(255) NOT NULL,
    contenu_html text NOT NULL,
    contenu_texte text,
    variables json,
    categorie character varying(255) NOT NULL,
    est_actif boolean DEFAULT true NOT NULL,
    cree_par bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT notification_templates_categorie_check CHECK (((categorie)::text = ANY ((ARRAY['systeme'::character varying, 'marketing'::character varying, 'rappel'::character varying, 'promo'::character varying])::text[])))
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 152874)
-- Name: notification_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_templates_id_seq OWNER TO postgres;

--
-- TOC entry 6425 (class 0 OID 0)
-- Dependencies: 259
-- Name: notification_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_templates_id_seq OWNED BY public.notification_templates.id;


--
-- TOC entry 250 (class 1259 OID 152765)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    titre character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(255) NOT NULL,
    est_lu boolean DEFAULT false NOT NULL,
    lu_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    date_programmee timestamp(0) without time zone,
    statut_envoi character varying(255) DEFAULT 'brouillon'::character varying NOT NULL,
    date_envoi timestamp(0) without time zone,
    cibles json,
    type_notification character varying(255) DEFAULT 'info'::character varying NOT NULL,
    template_id bigint,
    est_recurrente boolean DEFAULT false NOT NULL,
    parametres_recurrence json,
    nb_destinataires integer DEFAULT 0 NOT NULL,
    nb_envoyes integer DEFAULT 0 NOT NULL,
    nb_lus integer DEFAULT 0 NOT NULL,
    CONSTRAINT notifications_statut_envoi_check CHECK (((statut_envoi)::text = ANY ((ARRAY['brouillon'::character varying, 'programme'::character varying, 'envoye'::character varying, 'echoue'::character varying])::text[]))),
    CONSTRAINT notifications_type_notification_check CHECK (((type_notification)::text = ANY ((ARRAY['info'::character varying, 'warning'::character varying, 'success'::character varying, 'error'::character varying, 'promo'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 152764)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 6426 (class 0 OID 0)
-- Dependencies: 249
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 298 (class 1259 OID 153300)
-- Name: notifications_litige; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications_litige (
    id bigint NOT NULL,
    litige_id bigint NOT NULL,
    user_id bigint NOT NULL,
    type_notification character varying(255) NOT NULL,
    titre character varying(255) NOT NULL,
    message text NOT NULL,
    lu boolean DEFAULT false NOT NULL,
    lu_at timestamp(0) without time zone,
    metadata json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.notifications_litige OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 153299)
-- Name: notifications_litige_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_litige_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_litige_id_seq OWNER TO postgres;

--
-- TOC entry 6427 (class 0 OID 0)
-- Dependencies: 297
-- Name: notifications_litige_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_litige_id_seq OWNED BY public.notifications_litige.id;


--
-- TOC entry 256 (class 1259 OID 152836)
-- Name: notifications_systeme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications_systeme (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data json,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.notifications_systeme OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 152835)
-- Name: notifications_systeme_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_systeme_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_systeme_id_seq OWNER TO postgres;

--
-- TOC entry 6428 (class 0 OID 0)
-- Dependencies: 255
-- Name: notifications_systeme_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_systeme_id_seq OWNED BY public.notifications_systeme.id;


--
-- TOC entry 244 (class 1259 OID 152707)
-- Name: paiements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paiements (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    payable_type character varying(255) NOT NULL,
    payable_id bigint NOT NULL,
    reference_transaction character varying(255) NOT NULL,
    montant numeric(10,2) NOT NULL,
    methode character varying(255) NOT NULL,
    statut character varying(255) DEFAULT 'en_attente'::character varying NOT NULL,
    details_transaction json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT paiements_methode_check CHECK (((methode)::text = ANY ((ARRAY['carte'::character varying, 'mobile_money'::character varying, 'especes'::character varying])::text[]))),
    CONSTRAINT paiements_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'reussi'::character varying, 'echoue'::character varying, 'rembourse'::character varying])::text[])))
);


ALTER TABLE public.paiements OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 152706)
-- Name: paiements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paiements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paiements_id_seq OWNER TO postgres;

--
-- TOC entry 6429 (class 0 OID 0)
-- Dependencies: 243
-- Name: paiements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paiements_id_seq OWNED BY public.paiements.id;


--
-- TOC entry 292 (class 1259 OID 153206)
-- Name: parrainages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parrainages (
    id bigint NOT NULL,
    parrain_id bigint NOT NULL,
    filleul_id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    code_parrainage character varying(255) NOT NULL,
    bonus_parrain_points integer DEFAULT 100 NOT NULL,
    bonus_filleul_points integer DEFAULT 50 NOT NULL,
    bonus_parrain_reduction numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    bonus_filleul_reduction numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    est_utilise boolean DEFAULT false NOT NULL,
    date_utilisation timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.parrainages OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 153205)
-- Name: parrainages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parrainages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parrainages_id_seq OWNER TO postgres;

--
-- TOC entry 6430 (class 0 OID 0)
-- Dependencies: 291
-- Name: parrainages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parrainages_id_seq OWNED BY public.parrainages.id;


--
-- TOC entry 280 (class 1259 OID 153079)
-- Name: performance_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.performance_metrics (
    id bigint NOT NULL,
    metric_name character varying(255) NOT NULL,
    value numeric(10,3) NOT NULL,
    context character varying(255),
    metadata json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.performance_metrics OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 153078)
-- Name: performance_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.performance_metrics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.performance_metrics_id_seq OWNER TO postgres;

--
-- TOC entry 6431 (class 0 OID 0)
-- Dependencies: 279
-- Name: performance_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.performance_metrics_id_seq OWNED BY public.performance_metrics.id;


--
-- TOC entry 304 (class 1259 OID 153357)
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 153356)
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 6432 (class 0 OID 0)
-- Dependencies: 303
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- TOC entry 288 (class 1259 OID 153167)
-- Name: points_fidelite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.points_fidelite (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    action character varying(255) NOT NULL,
    points_gagnes integer NOT NULL,
    description character varying(255) NOT NULL,
    metadata json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.points_fidelite OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 153166)
-- Name: points_fidelite_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.points_fidelite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.points_fidelite_id_seq OWNER TO postgres;

--
-- TOC entry 6433 (class 0 OID 0)
-- Dependencies: 287
-- Name: points_fidelite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.points_fidelite_id_seq OWNED BY public.points_fidelite.id;


--
-- TOC entry 258 (class 1259 OID 152854)
-- Name: politiques_remboursement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.politiques_remboursement (
    id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    regles_remboursement json NOT NULL,
    remboursement_meteorologique boolean DEFAULT true NOT NULL,
    delai_annulation_gratuite integer DEFAULT 24 NOT NULL,
    frais_annulation_tardive numeric(5,2) DEFAULT '20'::numeric NOT NULL,
    reprogrammation_autorisee boolean DEFAULT true NOT NULL,
    delai_min_reprogrammation integer DEFAULT 2 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.politiques_remboursement OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 152853)
-- Name: politiques_remboursement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.politiques_remboursement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.politiques_remboursement_id_seq OWNER TO postgres;

--
-- TOC entry 6434 (class 0 OID 0)
-- Dependencies: 257
-- Name: politiques_remboursement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.politiques_remboursement_id_seq OWNED BY public.politiques_remboursement.id;


--
-- TOC entry 302 (class 1259 OID 153341)
-- Name: prix_terrains; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prix_terrains (
    id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    taille character varying(255),
    nom_terrain_specifique character varying(255),
    periode character varying(255),
    jour_semaine character varying(255),
    prix numeric(10,2) NOT NULL,
    duree character varying(255),
    heure_debut time(0) without time zone,
    heure_fin time(0) without time zone,
    est_actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.prix_terrains OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 153340)
-- Name: prix_terrains_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prix_terrains_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prix_terrains_id_seq OWNER TO postgres;

--
-- TOC entry 6435 (class 0 OID 0)
-- Dependencies: 301
-- Name: prix_terrains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prix_terrains_id_seq OWNED BY public.prix_terrains.id;


--
-- TOC entry 262 (class 1259 OID 152904)
-- Name: rapports_generes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rapports_generes (
    id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    parametres json NOT NULL,
    donnees_rapport json NOT NULL,
    fichier_export character varying(255),
    statut character varying(255) DEFAULT 'en_cours'::character varying NOT NULL,
    genere_par bigint NOT NULL,
    date_generation timestamp(0) without time zone NOT NULL,
    expire_le timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT rapports_generes_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'termine'::character varying, 'erreur'::character varying])::text[]))),
    CONSTRAINT rapports_generes_type_check CHECK (((type)::text = ANY ((ARRAY['financier'::character varying, 'utilisateurs'::character varying, 'reservations'::character varying, 'terrains'::character varying, 'custom'::character varying])::text[])))
);


ALTER TABLE public.rapports_generes OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 152903)
-- Name: rapports_generes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rapports_generes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rapports_generes_id_seq OWNER TO postgres;

--
-- TOC entry 6436 (class 0 OID 0)
-- Dependencies: 261
-- Name: rapports_generes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rapports_generes_id_seq OWNED BY public.rapports_generes.id;


--
-- TOC entry 286 (class 1259 OID 153147)
-- Name: reductions_fidelite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reductions_fidelite (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    type_abonnement character varying(255) NOT NULL,
    prix_original numeric(10,2) NOT NULL,
    reduction_pourcentage integer NOT NULL,
    montant_reduction numeric(10,2) NOT NULL,
    prix_final numeric(10,2) NOT NULL,
    niveau_fidelite character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.reductions_fidelite OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 153146)
-- Name: reductions_fidelite_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reductions_fidelite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reductions_fidelite_id_seq OWNER TO postgres;

--
-- TOC entry 6437 (class 0 OID 0)
-- Dependencies: 285
-- Name: reductions_fidelite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reductions_fidelite_id_seq OWNED BY public.reductions_fidelite.id;


--
-- TOC entry 284 (class 1259 OID 153108)
-- Name: remboursements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.remboursements (
    id bigint NOT NULL,
    reservation_id bigint NOT NULL,
    user_id bigint NOT NULL,
    montant_acompte integer DEFAULT 5000 NOT NULL,
    montant_remboursement integer DEFAULT 0 NOT NULL,
    montant_perdu integer DEFAULT 0 NOT NULL,
    statut character varying(255) DEFAULT 'en_attente'::character varying NOT NULL,
    date_demande timestamp(0) without time zone NOT NULL,
    heures_avant_match real NOT NULL,
    motif_annulation text NOT NULL,
    regle_appliquee character varying(255) NOT NULL,
    traite_par bigint,
    date_traitement timestamp(0) without time zone,
    methode_remboursement character varying(50),
    reference_transaction character varying(100),
    commentaire_admin text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT remboursements_regle_appliquee_check CHECK (((regle_appliquee)::text = ANY ((ARRAY['12h_plus'::character varying, '12h_moins'::character varying])::text[]))),
    CONSTRAINT remboursements_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuve'::character varying, 'refuse'::character varying, 'non_applicable'::character varying])::text[])))
);


ALTER TABLE public.remboursements OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 153107)
-- Name: remboursements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.remboursements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.remboursements_id_seq OWNER TO postgres;

--
-- TOC entry 6438 (class 0 OID 0)
-- Dependencies: 283
-- Name: remboursements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.remboursements_id_seq OWNED BY public.remboursements.id;


--
-- TOC entry 248 (class 1259 OID 152745)
-- Name: reponses_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reponses_tickets (
    id bigint NOT NULL,
    ticket_id bigint NOT NULL,
    user_id bigint NOT NULL,
    contenu text NOT NULL,
    est_reponse_admin boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.reponses_tickets OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 152744)
-- Name: reponses_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reponses_tickets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reponses_tickets_id_seq OWNER TO postgres;

--
-- TOC entry 6439 (class 0 OID 0)
-- Dependencies: 247
-- Name: reponses_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reponses_tickets_id_seq OWNED BY public.reponses_tickets.id;


--
-- TOC entry 238 (class 1259 OID 152647)
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id bigint NOT NULL,
    terrain_id bigint NOT NULL,
    user_id bigint NOT NULL,
    date_debut timestamp(0) without time zone NOT NULL,
    date_fin timestamp(0) without time zone NOT NULL,
    montant_total numeric(10,2) NOT NULL,
    statut character varying(255) NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    raison_annulation text,
    date_annulation timestamp(0) without time zone,
    montant_rembourse numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    frais_annulation numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    raison_reprogrammation text,
    date_reprogrammation timestamp(0) without time zone,
    frais_reprogrammation numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    ancienne_date_debut timestamp(0) without time zone,
    ancienne_date_fin timestamp(0) without time zone,
    qr_code character varying(255),
    qr_code_path character varying(255),
    motif_annulation text,
    annule_par bigint,
    heures_avant_annulation real,
    acompte_verse boolean DEFAULT true NOT NULL,
    qr_code_token character varying(255),
    code_ticket character varying(50),
    derniere_validation timestamp(0) without time zone,
    terrain_synthetique_id bigint,
    CONSTRAINT reservations_statut_check CHECK (((statut)::text = ANY (ARRAY[('en_attente'::character varying)::text, ('confirmee'::character varying)::text, ('annulee'::character varying)::text, ('terminee'::character varying)::text])))
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 152646)
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservations_id_seq OWNER TO postgres;

--
-- TOC entry 6440 (class 0 OID 0)
-- Dependencies: 237
-- Name: reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;


--
-- TOC entry 305 (class 1259 OID 153368)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 152688)
-- Name: souscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.souscriptions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    abonnement_id bigint NOT NULL,
    date_debut timestamp(0) without time zone NOT NULL,
    date_fin timestamp(0) without time zone NOT NULL,
    statut character varying(255) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT souscriptions_statut_check CHECK (((statut)::text = ANY ((ARRAY['active'::character varying, 'expiree'::character varying, 'annulee'::character varying])::text[])))
);


ALTER TABLE public.souscriptions OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 152687)
-- Name: souscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.souscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.souscriptions_id_seq OWNER TO postgres;

--
-- TOC entry 6441 (class 0 OID 0)
-- Dependencies: 241
-- Name: souscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.souscriptions_id_seq OWNED BY public.souscriptions.id;


--
-- TOC entry 266 (class 1259 OID 152941)
-- Name: statistiques_abonnements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statistiques_abonnements (
    id bigint NOT NULL,
    abonnement_id bigint NOT NULL,
    date_statistique date NOT NULL,
    nb_souscriptions_jour integer DEFAULT 0 NOT NULL,
    nb_annulations_jour integer DEFAULT 0 NOT NULL,
    revenus_jour numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    nb_utilisations_jour integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.statistiques_abonnements OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 152940)
-- Name: statistiques_abonnements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.statistiques_abonnements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.statistiques_abonnements_id_seq OWNER TO postgres;

--
-- TOC entry 6442 (class 0 OID 0)
-- Dependencies: 265
-- Name: statistiques_abonnements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.statistiques_abonnements_id_seq OWNED BY public.statistiques_abonnements.id;


--
-- TOC entry 264 (class 1259 OID 152921)
-- Name: taches_programmees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.taches_programmees (
    id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    parametres json NOT NULL,
    cron_expression character varying(255) NOT NULL,
    derniere_execution timestamp(0) without time zone,
    prochaine_execution timestamp(0) without time zone,
    est_active boolean DEFAULT true NOT NULL,
    nb_executions integer DEFAULT 0 NOT NULL,
    derniere_erreur text,
    cree_par bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.taches_programmees OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 152920)
-- Name: taches_programmees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.taches_programmees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.taches_programmees_id_seq OWNER TO postgres;

--
-- TOC entry 6443 (class 0 OID 0)
-- Dependencies: 263
-- Name: taches_programmees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.taches_programmees_id_seq OWNED BY public.taches_programmees.id;


--
-- TOC entry 236 (class 1259 OID 152623)
-- Name: terrains_synthetiques_dakar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.terrains_synthetiques_dakar (
    id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    description text,
    adresse character varying(255) NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    prix_heure numeric(10,2) NOT NULL,
    capacite integer DEFAULT 22 NOT NULL,
    surface numeric(10,2),
    gestionnaire_id bigint,
    contact_telephone character varying(255),
    email_contact character varying(255),
    horaires_ouverture time(0) without time zone DEFAULT '08:00:00'::time without time zone NOT NULL,
    horaires_fermeture time(0) without time zone DEFAULT '23:00:00'::time without time zone NOT NULL,
    type_surface character varying(255) DEFAULT 'synthétique'::character varying NOT NULL,
    equipements json,
    regles_maison text,
    note_moyenne numeric(3,2) DEFAULT '0'::numeric NOT NULL,
    nombre_avis integer DEFAULT 0 NOT NULL,
    image_principale character varying(255),
    images_supplementaires json,
    est_actif boolean DEFAULT true NOT NULL,
    jours_disponibles json,
    creneaux_disponibles json,
    conditions_abonnement json,
    accepte_paiement_differe boolean DEFAULT true NOT NULL,
    acompte_minimum numeric(10,2),
    duree_engagement_minimum integer DEFAULT 30 NOT NULL,
    reductions_abonnement json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    images json,
    statut_validation character varying(255) DEFAULT 'en_attente'::character varying NOT NULL,
    geom public.geometry(Point,4326),
    geom_polygon public.geometry(Polygon,4326),
    CONSTRAINT terrains_synthetiques_dakar_statut_validation_check CHECK (((statut_validation)::text = ANY ((ARRAY['en_attente'::character varying, 'approuve'::character varying, 'rejete'::character varying])::text[])))
);


ALTER TABLE public.terrains_synthetiques_dakar OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 152622)
-- Name: terrains_synthetiques_dakar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.terrains_synthetiques_dakar_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.terrains_synthetiques_dakar_id_seq OWNER TO postgres;

--
-- TOC entry 6444 (class 0 OID 0)
-- Dependencies: 235
-- Name: terrains_synthetiques_dakar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.terrains_synthetiques_dakar_id_seq OWNED BY public.terrains_synthetiques_dakar.id;


--
-- TOC entry 246 (class 1259 OID 152727)
-- Name: tickets_support; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_support (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    sujet character varying(255) NOT NULL,
    description text NOT NULL,
    priorite character varying(255) DEFAULT 'moyenne'::character varying NOT NULL,
    statut character varying(255) DEFAULT 'ouvert'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT tickets_support_priorite_check CHECK (((priorite)::text = ANY ((ARRAY['basse'::character varying, 'moyenne'::character varying, 'haute'::character varying])::text[]))),
    CONSTRAINT tickets_support_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'resolu'::character varying, 'ferme'::character varying])::text[])))
);


ALTER TABLE public.tickets_support OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 152726)
-- Name: tickets_support_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_support_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_support_id_seq OWNER TO postgres;

--
-- TOC entry 6445 (class 0 OID 0)
-- Dependencies: 245
-- Name: tickets_support_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_support_id_seq OWNED BY public.tickets_support.id;


--
-- TOC entry 307 (class 1259 OID 153391)
-- Name: types_abonnements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.types_abonnements (
    id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    description text NOT NULL,
    prix numeric(10,2) NOT NULL,
    duree_jours integer NOT NULL,
    avantages json NOT NULL,
    est_actif boolean DEFAULT true NOT NULL,
    categorie character varying(255) DEFAULT 'basic'::character varying NOT NULL,
    est_visible boolean DEFAULT true NOT NULL,
    ordre_affichage integer DEFAULT 0 NOT NULL,
    nb_reservations_max integer,
    nb_terrains_favoris_max integer,
    reduction_pourcentage numeric(5,2),
    date_debut_validite date,
    date_fin_validite date,
    couleur_theme character varying(255),
    icone character varying(255),
    fonctionnalites_speciales json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT types_abonnements_categorie_check CHECK (((categorie)::text = ANY ((ARRAY['basic'::character varying, 'premium'::character varying, 'entreprise'::character varying, 'promo'::character varying])::text[])))
);


ALTER TABLE public.types_abonnements OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 153390)
-- Name: types_abonnements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.types_abonnements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.types_abonnements_id_seq OWNER TO postgres;

--
-- TOC entry 6446 (class 0 OID 0)
-- Dependencies: 306
-- Name: types_abonnements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.types_abonnements_id_seq OWNED BY public.types_abonnements.id;


--
-- TOC entry 234 (class 1259 OID 152611)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    prenom character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    mot_de_passe character varying(255) NOT NULL,
    telephone character varying(255),
    role character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    statut_validation character varying(255) DEFAULT 'en_attente'::character varying NOT NULL,
    nom_entreprise character varying(255),
    numero_ninea character varying(255),
    numero_registre_commerce character varying(255),
    adresse_entreprise character varying(255),
    adresse character varying(255),
    description text,
    documents_legaux json,
    taux_commission_defaut numeric(5,2),
    date_validation timestamp(0) without time zone,
    valide_par bigint,
    notes_admin text,
    profile_image character varying(255),
    profile_image_url character varying(255),
    slogan character varying(100),
    pin character varying(4),
    otp_code character varying(6),
    otp_expires_at timestamp(0) without time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'gestionnaire'::character varying, 'client'::character varying])::text[]))),
    CONSTRAINT users_statut_validation_check CHECK (((statut_validation)::text = ANY ((ARRAY['en_attente'::character varying, 'approuve'::character varying, 'rejete'::character varying, 'suspendu'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 152610)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 6447 (class 0 OID 0)
-- Dependencies: 233
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 5799 (class 2604 OID 152671)
-- Name: abonnements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abonnements ALTER COLUMN id SET DEFAULT nextval('public.abonnements_id_seq'::regclass);


--
-- TOC entry 5859 (class 2604 OID 153065)
-- Name: analytics_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events ALTER COLUMN id SET DEFAULT nextval('public.analytics_events_id_seq'::regclass);


--
-- TOC entry 5848 (class 2604 OID 152980)
-- Name: configuration_systeme id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuration_systeme ALTER COLUMN id SET DEFAULT nextval('public.configuration_systeme_id_seq'::regclass);


--
-- TOC entry 5898 (class 2604 OID 153470)
-- Name: contrats_commission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_commission ALTER COLUMN id SET DEFAULT nextval('public.contrats_commission_id_seq'::regclass);


--
-- TOC entry 5853 (class 2604 OID 153023)
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- TOC entry 5824 (class 2604 OID 152787)
-- Name: demandes_remboursement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_remboursement ALTER COLUMN id SET DEFAULT nextval('public.demandes_remboursement_id_seq'::regclass);


--
-- TOC entry 5861 (class 2604 OID 153093)
-- Name: error_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_logs ALTER COLUMN id SET DEFAULT nextval('public.error_logs_id_seq'::regclass);


--
-- TOC entry 5779 (class 2604 OID 152602)
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- TOC entry 5852 (class 2604 OID 153003)
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- TOC entry 5889 (class 2604 OID 153324)
-- Name: historique_litige id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_litige ALTER COLUMN id SET DEFAULT nextval('public.historique_litige_id_seq'::regclass);


--
-- TOC entry 5826 (class 2604 OID 152818)
-- Name: historique_prix_terrains id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_prix_terrains ALTER COLUMN id SET DEFAULT nextval('public.historique_prix_terrains_id_seq'::regclass);


--
-- TOC entry 5778 (class 2604 OID 152585)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 5881 (class 2604 OID 153239)
-- Name: litiges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.litiges ALTER COLUMN id SET DEFAULT nextval('public.litiges_id_seq'::regclass);


--
-- TOC entry 5847 (class 2604 OID 152962)
-- Name: logs_systeme id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_systeme ALTER COLUMN id SET DEFAULT nextval('public.logs_systeme_id_seq'::regclass);


--
-- TOC entry 5856 (class 2604 OID 153041)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 5885 (class 2604 OID 153280)
-- Name: messages_litige id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages_litige ALTER COLUMN id SET DEFAULT nextval('public.messages_litige_id_seq'::regclass);


--
-- TOC entry 5777 (class 2604 OID 152564)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 5871 (class 2604 OID 153190)
-- Name: niveaux_fidelite_terrain id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.niveaux_fidelite_terrain ALTER COLUMN id SET DEFAULT nextval('public.niveaux_fidelite_terrain_id_seq'::regclass);


--
-- TOC entry 5835 (class 2604 OID 152878)
-- Name: notification_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates ALTER COLUMN id SET DEFAULT nextval('public.notification_templates_id_seq'::regclass);


--
-- TOC entry 5816 (class 2604 OID 152768)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 5887 (class 2604 OID 153303)
-- Name: notifications_litige id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_litige ALTER COLUMN id SET DEFAULT nextval('public.notifications_litige_id_seq'::regclass);


--
-- TOC entry 5827 (class 2604 OID 152839)
-- Name: notifications_systeme id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_systeme ALTER COLUMN id SET DEFAULT nextval('public.notifications_systeme_id_seq'::regclass);


--
-- TOC entry 5809 (class 2604 OID 152710)
-- Name: paiements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiements ALTER COLUMN id SET DEFAULT nextval('public.paiements_id_seq'::regclass);


--
-- TOC entry 5875 (class 2604 OID 153209)
-- Name: parrainages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parrainages ALTER COLUMN id SET DEFAULT nextval('public.parrainages_id_seq'::regclass);


--
-- TOC entry 5860 (class 2604 OID 153082)
-- Name: performance_metrics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_metrics ALTER COLUMN id SET DEFAULT nextval('public.performance_metrics_id_seq'::regclass);


--
-- TOC entry 5892 (class 2604 OID 153360)
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- TOC entry 5870 (class 2604 OID 153170)
-- Name: points_fidelite id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_fidelite ALTER COLUMN id SET DEFAULT nextval('public.points_fidelite_id_seq'::regclass);


--
-- TOC entry 5829 (class 2604 OID 152857)
-- Name: politiques_remboursement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.politiques_remboursement ALTER COLUMN id SET DEFAULT nextval('public.politiques_remboursement_id_seq'::regclass);


--
-- TOC entry 5890 (class 2604 OID 153344)
-- Name: prix_terrains id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prix_terrains ALTER COLUMN id SET DEFAULT nextval('public.prix_terrains_id_seq'::regclass);


--
-- TOC entry 5837 (class 2604 OID 152907)
-- Name: rapports_generes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_generes ALTER COLUMN id SET DEFAULT nextval('public.rapports_generes_id_seq'::regclass);


--
-- TOC entry 5869 (class 2604 OID 153150)
-- Name: reductions_fidelite id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reductions_fidelite ALTER COLUMN id SET DEFAULT nextval('public.reductions_fidelite_id_seq'::regclass);


--
-- TOC entry 5864 (class 2604 OID 153111)
-- Name: remboursements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remboursements ALTER COLUMN id SET DEFAULT nextval('public.remboursements_id_seq'::regclass);


--
-- TOC entry 5814 (class 2604 OID 152748)
-- Name: reponses_tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reponses_tickets ALTER COLUMN id SET DEFAULT nextval('public.reponses_tickets_id_seq'::regclass);


--
-- TOC entry 5794 (class 2604 OID 152650)
-- Name: reservations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);


--
-- TOC entry 5807 (class 2604 OID 152691)
-- Name: souscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.souscriptions ALTER COLUMN id SET DEFAULT nextval('public.souscriptions_id_seq'::regclass);


--
-- TOC entry 5842 (class 2604 OID 152944)
-- Name: statistiques_abonnements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistiques_abonnements ALTER COLUMN id SET DEFAULT nextval('public.statistiques_abonnements_id_seq'::regclass);


--
-- TOC entry 5839 (class 2604 OID 152924)
-- Name: taches_programmees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taches_programmees ALTER COLUMN id SET DEFAULT nextval('public.taches_programmees_id_seq'::regclass);


--
-- TOC entry 5783 (class 2604 OID 152626)
-- Name: terrains_synthetiques_dakar id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terrains_synthetiques_dakar ALTER COLUMN id SET DEFAULT nextval('public.terrains_synthetiques_dakar_id_seq'::regclass);


--
-- TOC entry 5811 (class 2604 OID 152730)
-- Name: tickets_support id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_support ALTER COLUMN id SET DEFAULT nextval('public.tickets_support_id_seq'::regclass);


--
-- TOC entry 5893 (class 2604 OID 153394)
-- Name: types_abonnements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_abonnements ALTER COLUMN id SET DEFAULT nextval('public.types_abonnements_id_seq'::regclass);


--
-- TOC entry 5781 (class 2604 OID 152614)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 6321 (class 0 OID 152668)
-- Dependencies: 240
-- Data for Name: abonnements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.abonnements (id, user_id, terrain_id, type_abonnement, prix, date_debut, date_fin, statut, created_at, updated_at, categorie, est_visible, ordre_affichage, nb_reservations_max, nb_terrains_favoris_max, reduction_pourcentage, date_debut_validite, date_fin_validite, couleur_theme, icone, fonctionnalites_speciales, type_abonnement_id, jour_prefere, heure_preferee, nb_seances_semaine, duree_seance, preferences_flexibles, jours_alternatifs, heures_alternatives) FROM stdin;
1	5	5	Abonnement Mensuel	100000.00	2025-08-22 15:57:54	2025-09-21 15:57:54	en_attente_paiement	2025-08-22 15:57:54	2025-08-22 15:57:54	basic	t	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	1.0	t	\N	\N
2	5	5	Abonnement Mensuel	100000.00	2025-08-22 16:16:08	2025-09-21 16:16:08	en_attente_paiement	2025-08-22 16:16:08	2025-08-22 16:16:08	basic	t	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	1.0	t	\N	\N
3	5	5	Abonnement Mensuel	100000.00	2025-09-03 13:08:49	2025-10-03 13:08:49	en_attente_paiement	2025-09-03 13:08:49	2025-09-03 13:08:49	basic	t	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	1.0	t	\N	\N
4	6	14	Abonnement Annuel	1325000.00	2025-11-08 17:06:48	2026-11-08 17:06:48	en_attente_paiement	2025-11-08 17:06:48	2025-11-08 17:06:48	entreprise	t	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	1.0	t	\N	\N
\.


--
-- TOC entry 6359 (class 0 OID 153062)
-- Dependencies: 278
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_events (id, event_name, event_category, user_id, session_id, properties, user_agent, ip_address, referrer, page_url, value, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6307 (class 0 OID 152567)
-- Dependencies: 226
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
terrains_synthetiques_cache_5c785c036466adea360111aa28563bfd556b5fba:timer	i:1764950912;	1764950912
terrains_synthetiques_cache_5c785c036466adea360111aa28563bfd556b5fba	i:2;	1764950912
\.


--
-- TOC entry 6308 (class 0 OID 152574)
-- Dependencies: 227
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- TOC entry 6351 (class 0 OID 152977)
-- Dependencies: 270
-- Data for Name: configuration_systeme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuration_systeme (id, cle, valeur, section, type, description, visible_interface, modifiable, created_at, updated_at) FROM stdin;
1	nom_plateforme	Terrains Synthétiques Dakar	general	string	Nom de la plateforme affiché aux utilisateurs	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
2	email_admin	admin@terrains-dakar.com	general	string	Email principal de l'administrateur	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
3	telephone_support	+221 70 123 45 67	general	string	Numéro de téléphone du support	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
4	devise	FCFA	general	string	Devise utilisée sur la plateforme	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
5	timezone	Africa/Dakar	general	string	Fuseau horaire de la plateforme	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
6	commission_defaut	10	paiements	float	Taux de commission par défaut (en %)	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
7	delai_remboursement	7	paiements	integer	Délai de remboursement en jours	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
8	orange_money_actif	1	paiements	boolean	Activation des paiements Orange Money	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
9	wave_actif	1	paiements	boolean	Activation des paiements Wave	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
10	paypal_actif	0	paiements	boolean	Activation des paiements PayPal	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
11	email_notifications	1	notifications	boolean	Activation des notifications par email	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
12	sms_notifications	0	notifications	boolean	Activation des notifications par SMS	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
13	push_notifications	1	notifications	boolean	Activation des notifications push	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
14	delai_annulation	24	reservations	integer	Délai d'annulation gratuite en heures	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
15	max_reservations_par_jour	3	reservations	integer	Nombre maximum de réservations par jour par utilisateur	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
16	auto_confirm	0	reservations	boolean	Confirmation automatique des réservations	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
17	mode_maintenance	0	maintenance	boolean	Activer le mode maintenance	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
18	message_maintenance	Site en maintenance. Nous serons de retour bientôt.	maintenance	string	Message affiché pendant la maintenance	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
19	nettoyage_auto_logs	1	maintenance	boolean	Nettoyage automatique des logs anciens	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
20	retention_logs_jours	90	maintenance	integer	Durée de rétention des logs en jours	t	t	2025-08-22 14:03:37	2025-08-22 14:03:37
\.


--
-- TOC entry 6390 (class 0 OID 153467)
-- Dependencies: 309
-- Data for Name: contrats_commission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contrats_commission (id, gestionnaire_id, terrain_synthetique_id, taux_commission, type_contrat, date_debut, date_fin, statut, conditions_speciales, historique_negociation, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 6355 (class 0 OID 153020)
-- Dependencies: 274
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, type, subject, reservation_id, participants, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6333 (class 0 OID 152784)
-- Dependencies: 252
-- Data for Name: demandes_remboursement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes_remboursement (id, reservation_id, user_id, type_remboursement, montant_demande, raison, statut, evidence_meteorologique, commentaire_admin, date_traitement, traite_par, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6363 (class 0 OID 153090)
-- Dependencies: 282
-- Data for Name: error_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.error_logs (id, error_type, severity, message, stack_trace, file_path, line_number, user_id, user_agent, context, resolved, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6313 (class 0 OID 152599)
-- Dependencies: 232
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- TOC entry 6353 (class 0 OID 153000)
-- Dependencies: 272
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (id, user_id, terrain_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6381 (class 0 OID 153321)
-- Dependencies: 300
-- Data for Name: historique_litige; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historique_litige (id, litige_id, user_id, action, statut_avant, statut_apres, commentaire, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6335 (class 0 OID 152815)
-- Dependencies: 254
-- Data for Name: historique_prix_terrains; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historique_prix_terrains (id, terrain_id, gestionnaire_id, ancien_prix, nouveau_prix, raison, created_at) FROM stdin;
\.


--
-- TOC entry 6311 (class 0 OID 152591)
-- Dependencies: 230
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- TOC entry 6310 (class 0 OID 152582)
-- Dependencies: 229
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- TOC entry 6375 (class 0 OID 153236)
-- Dependencies: 294
-- Data for Name: litiges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.litiges (id, numero_litige, user_id, terrain_id, reservation_id, type_litige, sujet, description, priorite, statut, niveau_escalade, preuves, resolution, satisfaction_client, ferme_par, date_escalade, date_fermeture, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6349 (class 0 OID 152959)
-- Dependencies: 268
-- Data for Name: logs_systeme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_systeme (id, user_id, niveau, module, action, details, ip_address, user_agent, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6357 (class 0 OID 153038)
-- Dependencies: 276
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, type, attachments, read_at, is_edited, edited_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6377 (class 0 OID 153277)
-- Dependencies: 296
-- Data for Name: messages_litige; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages_litige (id, litige_id, user_id, role_expediteur, message, type_message, pieces_jointes, lu, lu_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6306 (class 0 OID 152561)
-- Dependencies: 225
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000001_create_cache_table	1
2	0001_01_01_000002_create_jobs_table	1
3	2024_03_21_000000_create_database_structure	1
4	2025_01_20_130000_create_refund_system_tables	1
5	2025_01_20_140000_add_scheduled_notifications_and_reports	1
6	2025_01_22_000000_fix_gestionnaire_id_column	1
7	2025_01_23_000000_create_favorites_table	1
8	2025_01_23_000001_create_notifications_table	1
9	2025_01_23_000002_create_messages_table	1
10	2025_01_23_000003_create_analytics_table	1
11	2025_01_23_150000_create_remboursements_and_update_reservations_table	1
12	2025_01_24_000000_create_support_tables	1
13	2025_01_25_000000_create_fidelite_tables	1
14	2025_01_25_000001_create_litiges_tables	1
15	2025_01_27_create_prix_terrains_table	1
16	2025_06_19_201418_create_personal_access_tokens_table	1
17	2025_06_19_220727_create_sessions_table	1
18	2025_06_21_035457_add_slogan_and_profile_image_to_users_table	1
19	2025_06_21_195352_add_qr_code_to_reservations_table	1
20	2025_06_22_044310_allow_null_images_and_surface	1
21	2025_06_22_174557_add_ticket_fields_to_reservations	1
22	2025_06_27_151851_add_gps_coordinates_to_terrains_table	1
23	2025_06_27_214426_add_geom_column_to_terrains_synthetiques_dakar	1
24	2025_06_28_000000_centralize_terrains_synthetiques_dakar	1
25	2025_07_14_160932_create_types_abonnements_table	1
26	2025_07_14_161004_add_type_abonnement_id_to_abonnements_table	1
27	2025_07_21_000000_fix_abonnements_table_structure	1
28	2025_07_22_112550_add_preferences_to_abonnements_table	1
29	2025_07_30_000000_add_geom_polygon_and_compute_surfaces	2
30	2025_07_30_100000_create_contrats_commission_table	3
31	2025_01_23_000000_add_pin_and_otp_to_users_table	4
\.


--
-- TOC entry 6371 (class 0 OID 153187)
-- Dependencies: 290
-- Data for Name: niveaux_fidelite_terrain; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.niveaux_fidelite_terrain (id, terrain_id, niveau, points_requis, reduction_pourcentage, avantages, couleur_badge, icone, est_actif, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6341 (class 0 OID 152875)
-- Dependencies: 260
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_templates (id, nom, sujet, contenu_html, contenu_texte, variables, categorie, est_actif, cree_par, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6331 (class 0 OID 152765)
-- Dependencies: 250
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, titre, message, type, est_lu, lu_at, created_at, updated_at, deleted_at, date_programmee, statut_envoi, date_envoi, cibles, type_notification, template_id, est_recurrente, parametres_recurrence, nb_destinataires, nb_envoyes, nb_lus) FROM stdin;
\.


--
-- TOC entry 6379 (class 0 OID 153300)
-- Dependencies: 298
-- Data for Name: notifications_litige; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications_litige (id, litige_id, user_id, type_notification, titre, message, lu, lu_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6337 (class 0 OID 152836)
-- Dependencies: 256
-- Data for Name: notifications_systeme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications_systeme (id, user_id, type, title, message, data, is_read, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6325 (class 0 OID 152707)
-- Dependencies: 244
-- Data for Name: paiements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paiements (id, user_id, payable_type, payable_id, reference_transaction, montant, methode, statut, details_transaction, created_at, updated_at, deleted_at) FROM stdin;
2	5	App\\Models\\Reservation	1	PAY_68B83DA53B529_1756904869	25000.00	mobile_money	en_attente	\N	2025-09-03 13:07:49	2025-09-03 13:07:49	\N
3	5	App\\Models\\Reservation	2	PAY_68C49AE8BAEEF_1757715176	25000.00	mobile_money	en_attente	\N	2025-09-12 22:12:56	2025-09-12 22:12:56	\N
4	5	App\\Models\\Reservation	3	PAY_68C4A5902AED8_1757717904	25000.00	mobile_money	en_attente	\N	2025-09-12 22:58:24	2025-09-12 22:58:24	\N
5	5	App\\Models\\Reservation	4	PAY_68CA843046EA4_1758102576	25000.00	mobile_money	en_attente	\N	2025-09-17 09:49:36	2025-09-17 09:49:36	\N
6	6	App\\Models\\Reservation	5	PAY_690F6FE2AFFA7_1762619362	25000.00	mobile_money	en_attente	\N	2025-11-08 16:29:22	2025-11-08 16:29:22	\N
\.


--
-- TOC entry 6373 (class 0 OID 153206)
-- Dependencies: 292
-- Data for Name: parrainages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parrainages (id, parrain_id, filleul_id, terrain_id, code_parrainage, bonus_parrain_points, bonus_filleul_points, bonus_parrain_reduction, bonus_filleul_reduction, est_utilise, date_utilisation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6361 (class 0 OID 153079)
-- Dependencies: 280
-- Data for Name: performance_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.performance_metrics (id, metric_name, value, context, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6385 (class 0 OID 153357)
-- Dependencies: 304
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
32	App\\Models\\User	6	mobile_app	6978140124265f49190dbbdd61962fd8b4e97ee24ebf0bf4a0db351d91897fb2	["*"]	2025-11-10 13:16:07	\N	2025-11-08 14:41:31	2025-11-10 13:16:07
11	App\\Models\\User	8	web_app	ee910437e4eb29600d858fd24e9cd20b860849b266fd54317c72c45ff5807938	["*"]	2025-09-03 13:05:54	\N	2025-08-23 16:52:16	2025-09-03 13:05:54
20	App\\Models\\User	5	web_app	fdd74afcd571a8d0a100e388fcdfd810a0de61f65a074aecdede36540b02730e	["*"]	2025-09-12 22:58:24	\N	2025-09-12 22:51:33	2025-09-12 22:58:24
14	App\\Models\\User	3	web_app	77b5f760422b017a6b0f066a71fc5436eb2c2c2fb59a171fdcd6b687057daacf	["*"]	2025-09-03 13:17:23	\N	2025-09-03 13:13:32	2025-09-03 13:17:23
1	App\\Models\\User	5	web_app	7bb86a027c7e0358320a379b1854255741c642e4845cf7473d8184467d4dff0f	["*"]	2025-08-22 16:16:16	\N	2025-08-22 15:21:58	2025-08-22 16:16:16
12	App\\Models\\User	1	web_app	ee8fa01d0dd393d18e708b7e5868099a91f5181c74999d36092284baf82d0274	["*"]	2025-09-03 13:06:22	\N	2025-09-03 13:06:10	2025-09-03 13:06:22
31	App\\Models\\User	1	web_app	def5db6dcd02f78ce3f79c1015f1c573ea9ded50284ccbc42decb4cb38f90d13	["*"]	2025-09-17 10:38:36	\N	2025-09-17 09:57:19	2025-09-17 10:38:36
37	App\\Models\\User	7	web_app	78005eff06ecf90382e2ed63f1d8121426d704dc813ffd57d8006b7126e0c564	["*"]	2025-12-05 16:06:27	\N	2025-12-05 16:05:27	2025-12-05 16:06:27
2	App\\Models\\User	1	web_app	b0c4b300d9e1751da66dd449e982d6714804601d07041875d6e976796a6ee12a	["*"]	2025-08-23 16:15:00	\N	2025-08-22 17:33:31	2025-08-23 16:15:00
3	App\\Models\\User	1	Test Device	2dace7e817706883fcd7696bb5d0abb0dd2abf048b2bb8425cf5ce2cded44e1f	["*"]	\N	\N	2025-08-23 16:50:25	2025-08-23 16:50:25
4	App\\Models\\User	3	Test Device	f1f8718a2ffb3785febc3d832286270b9539aa54fe2ea85529d545c1fd8ca4c7	["*"]	\N	\N	2025-08-23 16:50:26	2025-08-23 16:50:26
5	App\\Models\\User	5	Test Device	93ddc814bcb2b49342a50b3120d9709d57cfef31519e6bfcec275d06c0042d2f	["*"]	\N	\N	2025-08-23 16:50:27	2025-08-23 16:50:27
6	App\\Models\\User	7	Test Device	aa901fb32252d69a86ddb3aff497caa7f462259ff0edc05a0188e94414b87dee	["*"]	\N	\N	2025-08-23 16:50:28	2025-08-23 16:50:28
7	App\\Models\\User	1	Test Device	ea106b46dc87e379ab9e685776ce2b2f5eecac0780156e05d2c029f182da4f5c	["*"]	2025-08-23 16:50:45	\N	2025-08-23 16:50:45	2025-08-23 16:50:45
8	App\\Models\\User	3	Test Device	3a83f5005fd7a6bfb86f68e786d2ef316fe17d7447830eb01b33edcfe04e5535	["*"]	2025-08-23 16:50:46	\N	2025-08-23 16:50:46	2025-08-23 16:50:46
9	App\\Models\\User	5	Test Device	2acc2f445a54e3cf1a1c712cabe257546c4ddd904ac2cd2954900c2ae9559e7e	["*"]	2025-08-23 16:50:48	\N	2025-08-23 16:50:47	2025-08-23 16:50:48
10	App\\Models\\User	7	Test Device	c5e124ead015474630e2df957ab8b62a0ec9d62358f65a33533813973f427d12	["*"]	2025-08-23 16:50:49	\N	2025-08-23 16:50:48	2025-08-23 16:50:49
34	App\\Models\\User	4	web_app	8b4399aa7d500d7aa6bf9d8e5587f3d65e8faf20e8fb991b00ac83b9c31da255	["*"]	2025-12-01 10:29:17	\N	2025-12-01 10:29:13	2025-12-01 10:29:17
25	App\\Models\\User	3	web_app	fa5e4c07f18da969bd0a859a3f2a2bef6501655c1cd5cae4ab67823cb11a3c26	["*"]	2025-09-16 08:08:21	\N	2025-09-13 13:37:40	2025-09-16 08:08:21
21	App\\Models\\User	3	web_app	4107314a4e7389b302cfde8d4ce5bcefdda3140f4e0c60f44fe9370bdc85462a	["*"]	2025-09-12 23:06:25	\N	2025-09-12 23:04:33	2025-09-12 23:06:25
28	App\\Models\\User	1	web_app	5ada153731e0bb590a39f717a7093865d8a6aae750e192434c4d7a3091fe5b0d	["*"]	2025-09-17 09:52:05	\N	2025-09-17 09:51:30	2025-09-17 09:52:05
23	App\\Models\\User	3	web_app	d3fb413d6c33f40db5cbe92042b7aca5ae6c7fa50626d64f6fdd0b15255266fd	["*"]	2025-09-13 13:36:26	\N	2025-09-12 23:07:38	2025-09-13 13:36:26
16	App\\Models\\User	1	api-test	7c61585c5641a43ce2890c61439148aa718e6bb2eb066199217ed07fc6b78c0c	["*"]	2025-09-03 13:43:28	\N	2025-09-03 13:43:27	2025-09-03 13:43:28
13	App\\Models\\User	5	web_app	268188abf40e57838a07d09c7b4aa813464b2782e263983396fbff65ec0a7dc0	["*"]	2025-09-03 13:08:48	\N	2025-09-03 13:06:35	2025-09-03 13:08:48
17	App\\Models\\User	1	api-test	7ff1aa42c7c809f2d0ebb9318eab772c94f070e780fc6951680ea361489f3faf	["*"]	2025-09-03 13:44:19	\N	2025-09-03 13:44:19	2025-09-03 13:44:19
15	App\\Models\\User	1	web_app	7a27aede847d0d08b3ce74c1dba3fb27125c1ab6aaf008c70c2c855b69591dff	["*"]	2025-09-08 09:48:34	\N	2025-09-03 13:17:33	2025-09-08 09:48:34
24	App\\Models\\User	3	web_app	6b41aebf63452bdaf087da782142add72c69342eb9927e9b03aaa86c67c3ba11	["*"]	\N	\N	2025-09-13 13:36:32	2025-09-13 13:36:32
18	App\\Models\\User	5	web_app	89a1a47636a5084b3dffc5ba05f32f7b88a907d2c80a2a37fe9a567c1161a5fb	["*"]	2025-09-12 22:12:56	\N	2025-09-08 09:58:16	2025-09-12 22:12:56
19	App\\Models\\User	5	web_app	9e1f4c62d79624ddd86ffcddc772e6528137ca63dbf2c89da66b9818eadc988d	["*"]	2025-09-12 22:13:54	\N	2025-09-12 22:13:52	2025-09-12 22:13:54
29	App\\Models\\User	1	web_app	422136c25e1ac84292f77e4ad1e0a7af7fa11085678b46ac9566f39286bb233c	["*"]	2025-09-17 09:55:17	\N	2025-09-17 09:55:14	2025-09-17 09:55:17
22	App\\Models\\User	1	web_app	dcef7825f92b416b6884d0a8ff73f4d48d556cc3ca39608d41a11d46e589f174	["*"]	2025-09-12 23:07:28	\N	2025-09-12 23:06:52	2025-09-12 23:07:28
26	App\\Models\\User	5	web_app	f183b6512217a2bedfd1bf44388fd43f159747432c80eb9cd92f333fbad7abef	["*"]	2025-09-17 09:50:12	\N	2025-09-16 08:08:51	2025-09-17 09:50:12
35	App\\Models\\User	5	web_app	4824be8a8ead5e670800fad9d33ed5aabb8ad716efa8f6df145d1a604ab81c3d	["*"]	2025-12-01 10:30:39	\N	2025-12-01 10:30:36	2025-12-01 10:30:39
27	App\\Models\\User	3	web_app	c84db22fa4d92297e8a4236ac5e8b0bd58aa4203b94675810beab0fb5fbbb0a2	["*"]	2025-09-17 09:51:23	\N	2025-09-17 09:50:29	2025-09-17 09:51:23
30	App\\Models\\User	5	web_app	d55a319ff1d959fb89adf1b60f42041779d7c454513e04876cb5f938fb2088cf	["*"]	2025-09-17 09:57:01	\N	2025-09-17 09:56:59	2025-09-17 09:57:01
36	App\\Models\\User	2	web_app	17382020f81b1e346ca1c721f0e613939f700c6e0ab0c4558eff52079751d80d	["*"]	2025-12-01 10:31:43	\N	2025-12-01 10:31:40	2025-12-01 10:31:43
33	App\\Models\\User	4	mobile_app	06405365c7560b277d1ffd747c1692e14ddc0d22ed57492c7ef94426827e4296	["*"]	2025-11-10 13:23:03	\N	2025-11-10 10:20:28	2025-11-10 13:23:03
38	App\\Models\\User	4	web_app	622279afe549bd42c304e738f079d5adf2e98d856fbfdbae93d2fc96c92c252f	["*"]	2025-12-05 16:08:30	\N	2025-12-05 16:07:57	2025-12-05 16:08:30
\.


--
-- TOC entry 6369 (class 0 OID 153167)
-- Dependencies: 288
-- Data for Name: points_fidelite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.points_fidelite (id, user_id, terrain_id, action, points_gagnes, description, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6339 (class 0 OID 152854)
-- Dependencies: 258
-- Data for Name: politiques_remboursement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.politiques_remboursement (id, terrain_id, regles_remboursement, remboursement_meteorologique, delai_annulation_gratuite, frais_annulation_tardive, reprogrammation_autorisee, delai_min_reprogrammation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6383 (class 0 OID 153341)
-- Dependencies: 302
-- Data for Name: prix_terrains; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prix_terrains (id, terrain_id, taille, nom_terrain_specifique, periode, jour_semaine, prix, duree, heure_debut, heure_fin, est_actif, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6343 (class 0 OID 152904)
-- Dependencies: 262
-- Data for Name: rapports_generes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rapports_generes (id, nom, type, parametres, donnees_rapport, fichier_export, statut, genere_par, date_generation, expire_le, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6367 (class 0 OID 153147)
-- Dependencies: 286
-- Data for Name: reductions_fidelite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reductions_fidelite (id, user_id, terrain_id, type_abonnement, prix_original, reduction_pourcentage, montant_reduction, prix_final, niveau_fidelite, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6365 (class 0 OID 153108)
-- Dependencies: 284
-- Data for Name: remboursements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.remboursements (id, reservation_id, user_id, montant_acompte, montant_remboursement, montant_perdu, statut, date_demande, heures_avant_match, motif_annulation, regle_appliquee, traite_par, date_traitement, methode_remboursement, reference_transaction, commentaire_admin, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6329 (class 0 OID 152745)
-- Dependencies: 248
-- Data for Name: reponses_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reponses_tickets (id, ticket_id, user_id, contenu, est_reponse_admin, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 6319 (class 0 OID 152647)
-- Dependencies: 238
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, terrain_id, user_id, date_debut, date_fin, montant_total, statut, notes, created_at, updated_at, deleted_at, raison_annulation, date_annulation, montant_rembourse, frais_annulation, raison_reprogrammation, date_reprogrammation, frais_reprogrammation, ancienne_date_debut, ancienne_date_fin, qr_code, qr_code_path, motif_annulation, annule_par, heures_avant_annulation, acompte_verse, qr_code_token, code_ticket, derniere_validation, terrain_synthetique_id) FROM stdin;
1	5	5	2025-09-04 20:00:00	2025-09-04 21:00:00	25000.00	en_attente	\N	2025-09-03 13:07:49	2025-09-03 13:07:49	\N	\N	\N	0.00	0.00	\N	\N	0.00	\N	\N	\N	\N	\N	\N	\N	t	\N	TSK-KSM-2025-868419	\N	\N
2	6	5	2025-09-15 17:00:00	2025-09-15 18:00:00	25000.00	en_attente	\N	2025-09-12 22:12:56	2025-09-12 22:12:56	\N	\N	\N	0.00	0.00	\N	\N	0.00	\N	\N	\N	\N	\N	\N	\N	t	\N	TSK-KSM-2025-588202	\N	\N
3	5	5	2025-09-13 22:00:00	2025-09-13 23:00:00	25000.00	en_attente	\N	2025-09-12 22:58:24	2025-09-12 22:58:24	\N	\N	\N	0.00	0.00	\N	\N	0.00	\N	\N	\N	\N	\N	\N	\N	t	\N	TSK-KSM-2025-457240	\N	\N
4	5	5	2025-09-17 11:00:00	2025-09-17 12:00:00	25000.00	en_attente	\N	2025-09-17 09:49:36	2025-09-17 09:49:36	\N	\N	\N	0.00	0.00	\N	\N	0.00	\N	\N	\N	\N	\N	\N	\N	t	\N	TSK-KSM-2025-232231	\N	\N
5	14	6	2025-11-29 21:00:00	2025-11-29 22:00:00	25000.00	confirmee	\N	2025-11-08 16:29:22	2025-11-10 10:32:29	\N	\N	\N	0.00	0.00	\N	\N	0.00	\N	\N	\N	\N	\N	\N	\N	t	\N	TSK-KSM-2025-160382	\N	\N
\.


--
-- TOC entry 6386 (class 0 OID 153368)
-- Dependencies: 305
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- TOC entry 6323 (class 0 OID 152688)
-- Dependencies: 242
-- Data for Name: souscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.souscriptions (id, user_id, abonnement_id, date_debut, date_fin, statut, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5776 (class 0 OID 96171)
-- Dependencies: 220
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 6347 (class 0 OID 152941)
-- Dependencies: 266
-- Data for Name: statistiques_abonnements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.statistiques_abonnements (id, abonnement_id, date_statistique, nb_souscriptions_jour, nb_annulations_jour, revenus_jour, nb_utilisations_jour, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6345 (class 0 OID 152921)
-- Dependencies: 264
-- Data for Name: taches_programmees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taches_programmees (id, nom, type, parametres, cron_expression, derniere_execution, prochaine_execution, est_active, nb_executions, derniere_erreur, cree_par, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6317 (class 0 OID 152623)
-- Dependencies: 236
-- Data for Name: terrains_synthetiques_dakar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.terrains_synthetiques_dakar (id, nom, description, adresse, latitude, longitude, prix_heure, capacite, surface, gestionnaire_id, contact_telephone, email_contact, horaires_ouverture, horaires_fermeture, type_surface, equipements, regles_maison, note_moyenne, nombre_avis, image_principale, images_supplementaires, est_actif, jours_disponibles, creneaux_disponibles, conditions_abonnement, accepte_paiement_differe, acompte_minimum, duree_engagement_minimum, reductions_abonnement, created_at, updated_at, deleted_at, images, statut_validation, geom, geom_polygon) FROM stdin;
2	Fara Foot	Fara Foot - Tarifs selon horaires. 8h-15h : 30,000 FCFA/h. 16h-6h : 40,000 FCFA/h. Terrain synthétique sur la corniche près de Radisson.	Fann-Point E-Amitié, Corniche, Dakar	14.69770000	-17.47250000	35000.00	10	290.62	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":70000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	70000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E6100000295C8FC2F57831C0A1D634EF38652D40	0103000020E6100000010000002100000021E26FDFEF7831C09ED634EF38652D408D5F65FCEF7831C0B4FC65B636652D405DF22852F07831C0B805739334652D4009DD6EDDF07831C0CACB609B32652D409BF6DC98F17831C0D9548EE130652D4037523F7DF27831C0EF3FF6762F652D40901BCF81F37831C04ABB87692E652D4007EF889CF47831C0886E9DC32D652D40295C8FC2F57831C0999D978B2D652D404BC995E8F67831C0886E9DC32D652D40C29C4F03F87831C04ABB87692E652D401B66DF07F97831C0EF3FF6762F652D40B7C141ECF97831C0D9548EE130652D4048DBAFA7FA7831C0CACB609B32652D40F5C5F532FB7831C0B805739334652D40C558B988FB7831C0B4FC65B636652D4030D6AEA5FB7831C09ED634EF38652D40C558B988FB7831C0A3AD03283B652D40F5C5F532FB7831C0669CF64A3D652D4048DBAFA7FA7831C0FDC908433F652D40B7C141ECF97831C06532DBFC40652D401B66DF07F97831C0C338736742652D40C29C4F03F87831C014B1E17443652D404BC995E8F67831C099F5CB1A44652D40295C8FC2F57831C0A4C3D15244652D4007EF889CF47831C099F5CB1A44652D40901BCF81F37831C014B1E17443652D4037523F7DF27831C0C338736742652D409BF6DC98F17831C06532DBFC40652D4009DD6EDDF07831C0FDC908433F652D405DF22852F07831C0669CF64A3D652D408D5F65FCEF7831C0A3AD03283B652D4021E26FDFEF7831C09ED634EF38652D40
6	Stade Deggo	Stade Deggo - 25,000 FCFA/h. Grand terrain avec des installations complètes pour des matchs officiels.	Marriste, Dakar	14.73230000	-17.43390000	25000.00	22	290.52	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":50000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	50000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E610000002BC0512146F31C0BBB88D06F0762D40	0103000020E61000000100000021000000FA41E62E0E6F31C0B8B88D06F0762D4066BFDB4B0E6F31C057F6D5CDED762D4036529FA10E6F31C0B333F9AAEB762D40E23CE52C0F6F31C08070FBB2E9762D40745653E80F6F31C057E93AF9E7762D4010B2B5CC106F31C0CC8CB18EE6762D40687B45D1116F31C04EF84D81E5762D40DF4EFFEB126F31C0DD676ADBE4762D4001BC0512146F31C02BDD66A3E4762D4024290C38156F31C0DD676ADBE4762D409BFCC552166F31C04EF84D81E5762D40F4C55557176F31C0CC8CB18EE6762D409021B83B186F31C057E93AF9E7762D40213B26F7186F31C08070FBB2E9762D40CE256C82196F31C0B333F9AAEB762D409EB82FD8196F31C057F6D5CDED762D40093625F5196F31C0B8B88D06F0762D409EB82FD8196F31C03078453FF2762D40CE256C82196F31C094322262F4762D40213B26F7186F31C06BE91F5AF6762D409021B83B186F31C00362E013F8762D40F4C55557176F31C0FCAF697EF9762D409BFCC552166F31C01E38CD8BFA762D4024290C38156F31C04DC0B031FB762D4001BC0512146F31C01A48B469FB762D40DF4EFFEB126F31C04DC0B031FB762D40687B45D1116F31C01E38CD8BFA762D4010B2B5CC106F31C0FCAF697EF9762D40745653E80F6F31C00362E013F8762D40E23CE52C0F6F31C06BE91F5AF6762D4036529FA10E6F31C094322262F4762D4066BFDB4B0E6F31C03078453FF2762D40FA41E62E0E6F31C0B8B88D06F0762D40
1	Complexe Be Sport	Complexe Be Sport - Tarifs variables selon terrain et jour. Petit terrain : 30,000 FCFA. Grand terrain : 45,000 FCFA (lundi-mercredi), 60,000 FCFA (jeudi-dimanche). Surface gazon synthétique.	Route de l'Aéroport, près de l'ancien aéroport, Dakar	14.74170000	-17.46860000	45000.00	22	290.51	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":90000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	90000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:05:15	\N	\N	en_attente	0101000020E6100000D5E76A2BF67731C0EBE2361AC07B2D40	0103000020E61000000100000021000000CD6D4B48F07731C0EAE2361AC07B2D4039EB4065F07731C0E86885E1BD7B2D40097E04BBF07731C0D4B0AEBEBB7B2D40B5684A46F17731C0F27EB6C6B97B2D404782B801F27731C016D9FA0CB87B2D40E3DD1AE6F27731C0D27D75A2B67B2D403CA7AAEAF37731C02BE31495B57B2D40B37A6405F57731C0E02733EFB47B2D40D5E76A2BF67731C0963B30B7B47B2D40F7547151F77731C0E02733EFB47B2D406E282B6CF87731C02BE31495B57B2D40C7F1BA70F97731C0D27D75A2B67B2D40644D1D55FA7731C016D9FA0CB87B2D40F4668B10FB7731C0F27EB6C6B97B2D40A151D19BFB7731C0D4B0AEBEBB7B2D4071E494F1FB7731C0E86885E1BD7B2D40DC618A0EFC7731C0EAE2361AC07B2D4071E494F1FB7731C0045AE852C27B2D40A151D19BFB7731C0D409BF75C47B2D40F4668B10FB7731C05A2FB76DC67B2D40644D1D55FA7731C0A1C67227C87B2D40C7F1BA70F97731C05013F891C97B2D406E282B6CF87731C09BA1589FCA7B2D40F7547151F77731C0A1543A45CB7B2D40D5E76A2BF67731C0053E3D7DCB7B2D40B37A6405F57731C0A1543A45CB7B2D403CA7AAEAF37731C09BA1589FCA7B2D40E3DD1AE6F27731C05013F891C97B2D404782B801F27731C0A1C67227C87B2D40B5684A46F17731C05A2FB76DC67B2D40097E04BBF07731C0D409BF75C47B2D4039EB4065F07731C0045AE852C27B2D40CD6D4B48F07731C0EAE2361AC07B2D40
5	Sowfoot	Sowfoot - Tarifs selon taille et jour. 5x5 : 15,000 FCFA (dimanche 90mn), 20,000 FCFA (vendredi-samedi 1h). 8x8 : 35,000 FCFA (dimanche-jeudi 1h30), 40,000 FCFA (vendredi-samedi 1h). Crampons interdits, tout-terrains seulement.	Central Park Avenue Malick Sy X, Autoroute, Dakar	14.68320000	-17.44110000	25000.00	18	290.65	3	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":50000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	50000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-09-12 23:07:27	\N	\N	en_attente	0101000020E6100000FE43FAEDEB7031C02041F163CC5D2D40	0103000020E61000000100000021000000F6C9DA0AE67031C01F41F163CC5D2D406147D027E67031C0E0BD182BCA5D2D4031DA937DE67031C0997C1C08C85D2D40DEC4D908E77031C0D5B20110C65D2D406FDE47C4E77031C0BBBA2756C45D2D400B3AAAA8E87031C0297D89EBC25D2D4064033AADE97031C0F56416DEC15D2D40DBD6F3C7EA7031C0C2462938C15D2D40FE43FAEDEB7031C03A822200C15D2D4020B10014ED7031C0C2462938C15D2D409784BA2EEE7031C0F56416DEC15D2D40EF4D4A33EF7031C0297D89EBC25D2D408CA9AC17F07031C0BBBA2756C45D2D401DC31AD3F07031C0D5B20110C65D2D40C9AD605EF17031C0997C1C08C85D2D40994024B4F17031C0E0BD182BCA5D2D4005BE19D1F17031C01F41F163CC5D2D40994024B4F17031C07AC1C99CCE5D2D40C9AD605EF17031C085FAC5BFD05D2D401DC31AD3F07031C0F8B7E0B7D25D2D408CA9AC17F07031C08CA1BA71D45D2D40EF4D4A33EF7031C095D058DCD55D2D409784BA2EEE7031C078DCCBE9D65D2D4020B10014ED7031C06EF2B88FD75D2D40FE43FAEDEB7031C013B4BFC7D75D2D40DBD6F3C7EA7031C06EF2B88FD75D2D4064033AADE97031C078DCCBE9D65D2D400B3AAAA8E87031C095D058DCD55D2D406FDE47C4E77031C08CA1BA71D45D2D40DEC4D908E77031C0F8B7E0B7D25D2D4031DA937DE67031C085FAC5BFD05D2D406147D027E67031C07AC1C99CCE5D2D40F6C9DA0AE67031C01F41F163CC5D2D40
8	TENNIS Mini Foot Squash	TENNIS Mini Foot Squash - 30,000 FCFA/h. Complexe avec terrain mini-foot et squash. Capacité 16 joueurs, format 8x8.	ASTU, Dakar 15441	14.68750000	-17.46800000	30000.00	16	290.65	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":60000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	60000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E61000002B8716D9CE7731C00000000000602D40	0103000020E61000000100000021000000230DF7F5C87731C0FEFFFFFFFF5F2D408E8AEC12C97731C0F8592AC7FD5F2D405F1DB068C97731C0BDD930A4FB5F2D400B08F6F3C97731C0BD9918ACF95F2D409D2164AFCA7731C02BDB40F2F75F2D40397DC693CB7731C00171A487F65F2D4091465698CC7731C01BB4327AF55F2D40081A10B3CD7731C0C76B46D4F45F2D402A8716D9CE7731C078EF3F9CF45F2D404DF41CFFCF7731C0C76B46D4F45F2D40C4C7D619D17731C01BB4327AF55F2D401C91661ED27731C00171A487F65F2D40B9ECC802D37731C02BDB40F2F75F2D404A0637BED37731C0BD9918ACF95F2D40F7F07C49D47731C0BDD930A4FB5F2D40C783409FD47731C0F8592AC7FD5F2D40320136BCD47731C0FEFFFFFFFF5F2D40C783409FD47731C020A3D53802602D40F7F07C49D47731C01F1BCF5B04602D404A0637BED37731C0CB4EE75306602D40B9ECC802D37731C0D2FEBE0D08602D401C91661ED27731C0765A5B7809602D40C4C7D619D17731C00B0BCD850A602D404DF41CFFCF7731C0214BB92B0B602D402A8716D9CE7731C08DC4BF630B602D40081A10B3CD7731C0214BB92B0B602D4091465698CC7731C00B0BCD850A602D40397DC693CB7731C0765A5B7809602D409D2164AFCA7731C0D2FEBE0D08602D400B08F6F3C97731C0CB4EE75306602D405F1DB068C97731C01F1BCF5B04602D408E8AEC12C97731C020A3D53802602D40230DF7F5C87731C0FEFFFFFFFF5F2D40
10	Terrain École Police	Terrain École Police - 125,000 FCFA/h. Terrain de football de l'École de Police. Terrain officiel avec installations complètes.	École de Police, Dakar	14.70200000	-17.46540000	125000.00	22	290.61	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":250000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	250000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E6100000F38E5374247731C08195438B6C672D40	0103000020E61000000100000021000000EB1434911E7731C08195438B6C672D40579229AE1E7731C0849977526A672D402725ED031F7731C04064872F68672D40D30F338F1F7731C0B7B4773766672D406529A14A207731C0DD77A77D64672D400185032F217731C0CC36111363672D40594E9333227731C0CB0DA40562672D40D0214D4E237731C01E97BA5F61672D40F28E5374247731C0780EB52761672D4015FC599A257731C01E97BA5F61672D408CCF13B5267731C0CB0DA40562672D40E598A3B9277731C0CC36111363672D4081F4059E287731C0DD77A77D64672D40120E7459297731C0B7B4773766672D40BFF8B9E4297731C04064872F68672D408F8B7D3A2A7731C0849977526A672D40FA0873572A7731C08195438B6C672D408F8B7D3A2A7731C0958E0FC46E672D40BFF8B9E4297731C09CBBFFE670672D40120E7459297731C0CE5E0FDF72672D4081F4059E287731C01E8DDF9874672D40E598A3B9277731C0A0BF750376672D408CCF13B5267731C04DDCE21077672D4015FC599A257731C0BB4ACCB677672D40F28E5374247731C07ED0D1EE77672D40D0214D4E237731C0BB4ACCB677672D40594E9333227731C04DDCE21077672D400185032F217731C0A0BF750376672D406529A14A207731C01E8DDF9874672D40D30F338F1F7731C0CE5E0FDF72672D402725ED031F7731C09CBBFFE670672D40579229AE1E7731C0958E0FC46E672D40EB1434911E7731C08195438B6C672D40
12	Terrain Thia	Terrain Thia - 20,000 FCFA/h. Terrain de football Thia. Capacité 8x8, 5x5.	Thiaroye, Dakar	14.72800000	-17.46800000	20000.00	16	290.54	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":40000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	40000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E61000002B8716D9CE7731C0DBF97E6ABC742D40	0103000020E61000000100000021000000230DF7F5C87731C0DCF97E6ABC742D408E8AEC12C97731C01058C431BA742D405F1DB068C97731C049D2E40EB8742D400B08F6F3C97731C05E83E416B6742D409D2164AFCA7731C0FCC0215DB4742D40397DC693CB7731C0A48F96F2B2742D4091465698CC7731C0CD9E31E5B1742D40081A10B3CD7731C0D9374D3FB1742D402A8716D9CE7731C0B9644907B1742D404DF41CFFCF7731C0D9374D3FB1742D40C4C7D619D17731C0CD9E31E5B1742D401C91661ED27731C0A48F96F2B2742D40B9ECC802D37731C0FCC0215DB4742D404A0637BED37731C05E83E416B6742D40F7F07C49D47731C049D2E40EB8742D40C783409FD47731C01058C431BA742D40320136BCD47731C0DCF97E6ABC742D40C783409FD47731C0BF9839A3BE742D40F7F07C49D47731C0471619C6C0742D404A0637BED37731C0D65819BEC2742D40B9ECC802D37731C0A90CDC77C4742D401C91661ED27731C06F2F67E2C5742D40C4C7D619D17731C0EB13CCEFC6742D404DF41CFFCF7731C09C72B095C7742D402A8716D9CE7731C0D742B4CDC7742D40081A10B3CD7731C09C72B095C7742D4091465698CC7731C0EB13CCEFC6742D40397DC693CB7731C06F2F67E2C5742D409D2164AFCA7731C0A90CDC77C4742D400B08F6F3C97731C0D65819BEC2742D405F1DB068C97731C0471619C6C0742D408E8AEC12C97731C0BF9839A3BE742D40230DF7F5C87731C0DCF97E6ABC742D40
3	Fit Park Academy	Fit Park Academy - Tarifs selon taille terrain. 4x4/5x5 : 30,000 FCFA. 8x8/9x9 : 80,000 FCFA. 11x11 : 120,000 FCFA. Académie avec terrains multiples.	Route de la Corniche Ouest, Magic Land, Fann, Dakar	14.67510000	-17.46360000	80000.00	22	290.68	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":160000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	160000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E6100000F46C567DAE7631C0280F0BB5A6592D40	0103000020E61000000100000021000000ECF2369AA87631C02A0F0BB5A6592D4058702CB7A87631C04E272D7CA4592D402803F00CA97631C076B62B59A2592D40D4ED3598A97631C036250C61A0592D406607A453AA7631C0B9FC2DA79E592D4002630638AB7631C0114F8C3C9D592D405A2C963CAC7631C0E4A8162F9C592D40D1FF4F57AD7631C0FDF727899B592D40F46C567DAE7631C079AB20519B592D4016DA5CA3AF7631C0FDF727899B592D408EAD16BEB07631C0E4A8162F9C592D40E676A6C2B17631C0114F8C3C9D592D4083D208A7B27631C0B9FC2DA79E592D4014EC7662B37631C036250C61A0592D40C0D6BCEDB37631C076B62B59A2592D4090698043B47631C04E272D7CA4592D40FCE67560B47631C02A0F0BB5A6592D4090698043B47631C023F4E8EDA8592D40C0D6BCEDB37631C0C05CEA10AB592D4014EC7662B37631C0B0E10909AD592D4083D208A7B27631C0A8FBE7C2AE592D40E676A6C2B17631C0CA9A892DB0592D408EAD16BEB07631C0A734FF3AB1592D4016DA5CA3AF7631C054DDEDE0B1592D40F46C567DAE7631C0F326F518B2592D40D1FF4F57AD7631C054DDEDE0B1592D405A2C963CAC7631C0A734FF3AB1592D4002630638AB7631C0CA9A892DB0592D406607A453AA7631C0A8FBE7C2AE592D40D4ED3598A97631C0B0E10909AD592D402803F00CA97631C0C05CEA10AB592D4058702CB7A87631C023F4E8EDA8592D40ECF2369AA87631C02A0F0BB5A6592D40
4	Skate Parc	Skate Parc - 30,000 FCFA/h. Complexe avec terrain synthétique et skate park. Terrain polyvalent, idéal pour le street football.	Corniche Ouest, Dakar	14.67440000	-17.45300000	30000.00	14	290.68	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":60000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	60000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E61000008716D9CEF77331C045D8F0F44A592D40	0103000020E610000001000000210000007F9CB9EBF17331C043D8F0F44A592D40EB19AF08F27331C01E7912BC48592D40BCAC725EF27331C09595109946592D406897B8E9F27331C0A19AF0A044592D40F9B026A5F37331C07D1512E742592D40950C8989F47331C0CD1B707C41592D40EED5188EF57331C01F3DFA6E40592D4065A9D2A8F67331C06F690BC93F592D408716D9CEF77331C02C1104913F592D40A983DFF4F87331C06F690BC93F592D402157990FFA7331C01F3DFA6E40592D4079202914FB7331C0CD1B707C41592D40167C8BF8FB7331C07D1512E742592D40A795F9B3FC7331C0A19AF0A044592D4053803F3FFD7331C09595109946592D4024130395FD7331C01E7912BC48592D408F90F8B1FD7331C043D8F0F44A592D4024130395FD7331C08334CF2D4D592D4053803F3FFD7331C0D00FD1504F592D40A795F9B3FC7331C074FEF04851592D40167C8BF8FB7331C01375CF0253592D4079202914FB7331C03F60716D54592D402157990FFA7331C09A32E77A55592D40A983DFF4F87331C013FED52056592D408716D9CEF77331C07253DD5856592D4065A9D2A8F67331C013FED52056592D40EED5188EF57331C09A32E77A55592D40950C8989F47331C03F60716D54592D40F9B026A5F37331C01375CF0253592D406897B8E9F27331C074FEF04851592D40BCAC725EF27331C0D00FD1504F592D40EB19AF08F27331C08334CF2D4D592D407F9CB9EBF17331C043D8F0F44A592D40
7	Terrain ASC Jaraaf	Terrain ASC Jaraaf - 25,000 FCFA/h. Terrain historique du club ASC Jaraaf, pelouse synthétique de qualité.	Médina, Dakar	14.68110000	-17.45200000	25000.00	22	290.66	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":50000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	50000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E6100000C1CAA145B67331C0789CA223B95C2D40	0103000020E61000000100000021000000BA508262B07331C0779CA223B95C2D4025CE777FB07331C034B3C8EAB65C2D40F5603BD5B07331C0AD19CBC7B45C2D40A24B8160B17331C0A512AFCFB25C2D403365EF1BB27331C07804D415B15C2D40CFC05100B37331C0AFE234ABAF5C2D40288AE104B47331C0E420C19DAE5C2D409F5D9B1FB57331C0459AD3F7AD5C2D40C1CAA145B67331C079B2CCBFAD5C2D40E337A86BB77331C0459AD3F7AD5C2D405A0B6286B87331C0E420C19DAE5C2D40B3D4F18AB97331C0AFE234ABAF5C2D404F30546FBA7331C07804D415B15C2D40E049C22ABB7331C0A512AFCFB25C2D408D3408B6BB7331C0AD19CBC7B45C2D405DC7CB0BBC7331C034B3C8EAB65C2D40C944C128BC7331C0779CA223B95C2D405DC7CB0BBC7331C0D5827C5CBB5C2D408D3408B6BB7331C01F147A7FBD5C2D40E049C22ABB7331C0D70E9677BF5C2D404F30546FBA7331C07E0E7131C15C2D40B3D4F18AB97331C0BF21109CC25C2D405A0B6286B87331C038D783A9C35C2D40E337A86BB77331C09C55714FC45C2D40C1CAA145B67331C0853A7887C45C2D409F5D9B1FB57331C09C55714FC45C2D40288AE104B47331C038D783A9C35C2D40CFC05100B37331C0BF21109CC25C2D403365EF1BB27331C07E0E7131C15C2D40A24B8160B17331C0D70E9677BF5C2D40F5603BD5B07331C01F147A7FBD5C2D4025CE777FB07331C0D5827C5CBB5C2D40BA508262B07331C0779CA223B95C2D40
9	Temple du Foot	Temple du Foot - Tarifs selon horaires. Heures creuses (10h-18h) : 35,000 FCFA. Heures pleines (18h-23h) : 50,000 FCFA. Complexe avec 3 terrains : Anfield, Camp Nou (salle), Old Trafford. Capacité 6x6, 5x5. Réservation par Wave.	Dakar	14.68680000	-17.45470000	42500.00	18	290.64	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":85000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	85000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E6100000BF7D1D38677431C01DC9E53FA45F2D40	0103000020E61000000100000021000000B703FE54617431C01AC9E53FA45F2D402281F371617431C0B4AB0F07A25F2D40F313B7C7617431C0B0B815E49F5F2D409FFEFC52627431C0E70EFDEB9D5F2D4031186B0E637431C09CF324329C5F2D40CD73CDF2637431C0573D88C79A5F2D40253D5DF7647431C0E64716BA995F2D409C101712667431C0C3DC2914995F2D40BE7D1D38677431C0AE5423DC985F2D40E1EA235E687431C0C3DC2914995F2D4058BEDD78697431C0E64716BA995F2D40B0876D7D6A7431C0573D88C79A5F2D404DE3CF616B7431C09CF324329C5F2D40DEFC3D1D6C7431C0E70EFDEB9D5F2D408BE783A86C7431C0B0B815E49F5F2D405B7A47FE6C7431C0B4AB0F07A25F2D40C6F73C1B6D7431C01AC9E53FA45F2D405B7A47FE6C7431C09FE3BB78A65F2D408BE783A86C7431C068CEB59BA85F2D40DEFC3D1D6C7431C0DE6BCE93AA5F2D404DE3CF616B7431C0A078A64DAC5F2D40B0876D7D6A7431C05C2043B8AD5F2D4058BEDD78697431C07B09B5C5AE5F2D40E1EA235E687431C0656CA16BAF5F2D40BE7D1D38677431C093F1A7A3AF5F2D409C101712667431C0656CA16BAF5F2D40253D5DF7647431C07B09B5C5AE5F2D40CD73CDF2637431C05C2043B8AD5F2D4031186B0E637431C0A078A64DAC5F2D409FFEFC52627431C0DE6BCE93AA5F2D40F313B7C7617431C068CEB59BA85F2D402281F371617431C09FE3BB78A65F2D40B703FE54617431C01AC9E53FA45F2D40
11	Terrain Sacré Cœur	Terrain Sacré Cœur - Tarifs selon taille terrain. 5x5 : 15,000 FCFA. 8x8 : 30,000 FCFA. 10x10 : 50,000 FCFA. 11x11 : 60,000 FCFA. Centre de loisirs avec terrains multiples.	Sacré Cœur, Dakar	14.71360000	-17.46350000	35000.00	22	290.58	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]	["08:00-10:00","10:00-12:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"]	{"engagement_minimum":30,"acompte_requis":70000,"paiement_differe":true,"annulation":"24h \\u00e0 l'avance","report":"Autoris\\u00e9 sous conditions"}	t	70000.00	30	{"trimestriel":10,"annuel":20,"semestriel":15}	2025-08-22 14:03:39	2025-08-22 14:07:14	\N	\N	en_attente	0101000020E61000002DB29DEFA77631C0E8D9ACFA5C6D2D40	0103000020E6100000010000002100000025387E0CA27631C0E8D9ACFA5C6D2D4090B57329A27631C0E09AE8C15A6D2D406048377FA27631C06FD6FF9E586D2D400D337D0AA37631C06502F7A6566D2D409E4CEBC5A37631C03FC82CED546D2D403AA84DAAA47631C0F7759B82536D2D409371DDAEA57631C04AF73175526D2D400A4597C9A67631C070C24ACF516D2D402DB29DEFA77631C0E6FC4597516D2D404F1FA415A97631C070C24ACF516D2D40C6F25D30AA7631C04AF73175526D2D401EBCED34AB7631C0F7759B82536D2D40BB175019AC7631C03FC82CED546D2D404D31BED4AC7631C06502F7A6566D2D40F81B0460AD7631C06FD6FF9E586D2D40C8AEC7B5AD7631C0E09AE8C15A6D2D40342CBDD2AD7631C0E8D9ACFA5C6D2D40C8AEC7B5AD7631C0091671335F6D2D40F81B0460AD7631C03AD25956616D2D404D31BED4AC7631C0EC99624E636D2D40BB175019AC7631C084C52C08656D2D401EBCED34AB7631C03F09BE72666D2D40C6F25D30AA7631C0937B2780676D2D404F1FA415A97631C030A80E26686D2D402DB29DEFA77631C0D56A135E686D2D400A4597C9A67631C030A80E26686D2D409371DDAEA57631C0937B2780676D2D403AA84DAAA47631C03F09BE72666D2D409E4CEBC5A37631C084C52C08656D2D400D337D0AA37631C0EC99624E636D2D406048377FA27631C03AD25956616D2D4090B57329A27631C0091671335F6D2D4025387E0CA27631C0E8D9ACFA5C6D2D40
13	Foot7+	Foot7+ - Terrain de football synthétique à Mbour. Idéal pour les matchs et entraînements.	Mbour, Sénégal	14.43995948	-16.97795464	25000.00	16	983.82	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	"[\\"lundi\\",\\"mardi\\",\\"mercredi\\",\\"jeudi\\",\\"vendredi\\",\\"samedi\\",\\"dimanche\\"]"	"[\\"08:00-10:00\\",\\"10:00-12:00\\",\\"14:00-16:00\\",\\"16:00-18:00\\",\\"18:00-20:00\\",\\"20:00-22:00\\"]"	\N	t	\N	30	\N	2025-11-08 15:52:42	2025-11-08 15:59:58	\N	\N	en_attente	0101000020E61000008C2FBA6859FA30C0260D078A46E12C40	0103000020E61000000100000005000000122DD08462FA30C0E8E2742431E12C4052C9A5084BFA30C073A935BD40E12C40F6F098E850FA30C037B95DAA5BE12C409AAD563267FA30C033BD80284DE12C40122DD08462FA30C0E8E2742431E12C40
15	Rara Complexe	Rara Complexe - Complexe sportif à Mbour avec terrain de football synthétique. Installations modernes et bien entretenues.	Mbour, Sénégal	14.43631225	-16.98795704	25000.00	22	901.28	\N	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	"[\\"lundi\\",\\"mardi\\",\\"mercredi\\",\\"jeudi\\",\\"vendredi\\",\\"samedi\\",\\"dimanche\\"]"	"[\\"08:00-10:00\\",\\"10:00-12:00\\",\\"14:00-16:00\\",\\"16:00-18:00\\",\\"18:00-20:00\\",\\"20:00-22:00\\"]"	\N	t	\N	30	\N	2025-11-08 15:52:42	2025-11-08 15:57:39	\N	\N	en_attente	0101000020E61000001A961B80E9FC30C0F54064B368DF2C40	0103000020E61000000100000005000000E9C3C16FEFFC30C0CFC070AD51DF2C40C02FF64BDEFC30C0556FA0BF5BDF2C402A876B9BE4FC30C0EEC8094780DF2C407859C9FCF3FC30C013CC673776DF2C40E9C3C16FEFFC30C0CFC070AD51DF2C40
14	Mini-Foot Auchan	Mini-Foot Auchan - Terrain de mini-foot situé à Mbour près du centre commercial Auchan. Parfait pour les matchs rapides.	Mbour, près d'Auchan, Sénégal	14.42788161	-16.97389448	25000.00	16	1236.34	4	\N	\N	08:00:00	23:00:00	synthétique	\N	\N	0.00	0	/terrain-foot.jpg	\N	t	"[\\"lundi\\",\\"mardi\\",\\"mercredi\\",\\"jeudi\\",\\"vendredi\\",\\"samedi\\",\\"dimanche\\"]"	"[\\"08:00-10:00\\",\\"10:00-12:00\\",\\"14:00-16:00\\",\\"16:00-18:00\\",\\"18:00-20:00\\",\\"20:00-22:00\\"]"	\N	t	\N	30	\N	2025-11-08 15:52:42	2025-11-10 10:23:20	\N	\N	en_attente	0101000020E610000090D0735450F930C075F8513519DB2C40	0103000020E610000001000000050000001023755B54F930C07EFACA69FBDA2C40C29317A843F930C07F419AE107DB2C40E25DDB7C4CF930C07DCA491A37DB2C4007CB6BE25CF930C0583A09AF2ADB2C401023755B54F930C07EFACA69FBDA2C40
\.


--
-- TOC entry 6327 (class 0 OID 152727)
-- Dependencies: 246
-- Data for Name: tickets_support; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_support (id, user_id, sujet, description, priorite, statut, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 6388 (class 0 OID 153391)
-- Dependencies: 307
-- Data for Name: types_abonnements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.types_abonnements (id, nom, description, prix, duree_jours, avantages, est_actif, categorie, est_visible, ordre_affichage, nb_reservations_max, nb_terrains_favoris_max, reduction_pourcentage, date_debut_validite, date_fin_validite, couleur_theme, icone, fonctionnalites_speciales, created_at, updated_at, deleted_at) FROM stdin;
1	Abonnement Mensuel	Accès privilégié pendant 1 mois	25000.00	30	["R\\u00e9servations prioritaires","10% de r\\u00e9duction sur les \\u00e9quipements","Annulation gratuite jusqu'\\u00e0 2h avant"]	t	basic	t	1	20	\N	10.00	\N	\N	#3B82F6	calendar	["priorite_reservation"]	2025-08-22 15:57:23	2025-08-22 15:57:23	\N
2	Abonnement Trimestriel	Accès privilégié pendant 3 mois avec plus d'avantages	60000.00	90	["R\\u00e9servations prioritaires","15% de r\\u00e9duction sur les \\u00e9quipements","Annulation gratuite jusqu'\\u00e0 2h avant","Acc\\u00e8s aux \\u00e9v\\u00e9nements VIP"]	t	premium	t	2	60	\N	15.00	\N	\N	#10B981	star	["priorite_reservation","acces_vip"]	2025-08-22 15:57:23	2025-08-22 15:57:23	\N
3	Abonnement Annuel	Accès privilégié pendant 1 an avec tous les avantages	200000.00	365	["R\\u00e9servations prioritaires","20% de r\\u00e9duction sur les \\u00e9quipements","Annulation gratuite jusqu'\\u00e0 2h avant","Acc\\u00e8s aux \\u00e9v\\u00e9nements VIP","Coach personnel mensuel inclus","Mat\\u00e9riel de sport gratuit"]	t	entreprise	t	3	365	\N	20.00	\N	\N	#F59E0B	crown	["priorite_reservation","acces_vip","coach_personnel"]	2025-08-22 15:57:23	2025-08-22 15:57:23	\N
\.


--
-- TOC entry 6315 (class 0 OID 152611)
-- Dependencies: 234
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nom, prenom, email, mot_de_passe, telephone, role, email_verified_at, remember_token, created_at, updated_at, deleted_at, statut_validation, nom_entreprise, numero_ninea, numero_registre_commerce, adresse_entreprise, adresse, description, documents_legaux, taux_commission_defaut, date_validation, valide_par, notes_admin, profile_image, profile_image_url, slogan, pin, otp_code, otp_expires_at) FROM stdin;
1	Administrateur	Principal	admin@terrains-dakar.com	$2y$12$ooffEmy/tC6XXn1l1MFMlOC3qvMmRuNQd.6MkiXwQqYdQiepeDqee	+221331234567	admin	2025-08-23 16:46:19	\N	2025-08-22 14:03:38	2025-08-23 16:46:19	\N	approuve	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	Test	Admin	admin@terrains.com	$2y$12$ymODIt.54.lDmDxW5wFYqu9JY9yu6BQZAv4nO/Tj4GC7UAvpz9aX.	+221331234568	admin	2025-08-23 16:46:20	\N	2025-08-22 14:03:38	2025-08-23 16:46:20	\N	approuve	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3	Gestionnaire	Principal	gestionnaire@terrains-dakar.com	$2y$12$uMidVX4SGXLXDeVTxLRgOupA6FHs32i51u0cmOtFLf4TXlMxSmShe	+221771234567	gestionnaire	2025-08-23 16:46:20	\N	2025-08-22 14:03:38	2025-08-23 16:46:20	\N	approuve	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4	Test	Gestionnaire	gestionnaire@test.com	$2y$12$6Q.hMUzngVbbrb94Wx7Se.YQOZau9dotYyWLuXox5yNOtVWN.gZS2	+221771234568	gestionnaire	2025-08-23 16:46:20	\N	2025-08-22 14:03:38	2025-08-23 16:46:20	\N	en_attente	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-22 17:34:40	1	pas besoin	\N	\N	\N	\N	\N	\N
5	Client	Principal	client@terrains-dakar.com	$2y$12$t3Kpr3x5xiyQ2Gu6FzeieOnYiV81WUQIQbug3788pyqdkuWOI5rQi	+221762345678	client	2025-08-23 16:46:20	\N	2025-08-22 14:03:39	2025-08-23 16:46:20	\N	approuve	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6	Test	Client	client@test.com	$2y$12$7giPl7IaIy/afImqAANoUeH6McCZjx97oBee3lnBYmiZnkobJgPp.	+221762345679	client	2025-08-23 16:46:21	\N	2025-08-22 14:03:39	2025-08-23 16:46:21	\N	approuve	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7	Diallo	Cheikh	admin@terrasyn.sn	$2y$12$OZl7hPdAS36OoIGKnKX/IeD2pcvY0KV/T7xxwxxm5exo33Vo5Nafq	+221 77 123 4567	admin	2025-08-23 16:46:25	\N	2025-08-23 16:46:25	2025-08-23 16:46:25	\N	en_attente	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8	Ba	Mamadou	gestionnaire@terrasyn.sn	$2y$12$iiquF2Wwiguxc.bKWAy1WO7bNyqXL37N8sjyZ/nF4nKh36uBl/uL.	+221 76 234 5678	gestionnaire	2025-08-23 16:46:25	\N	2025-08-23 16:46:25	2025-08-23 16:46:25	\N	en_attente	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9	Ndiaye	Fatou	client@terrasyn.sn	$2y$12$R/nRSgIQq8dSv5qzozGYb.DsSNDpOncf5CQGl3cKxv7TyrBBgnhjG	+221 78 345 6789	client	2025-08-23 16:46:26	\N	2025-08-23 16:46:26	2025-08-23 16:46:26	\N	en_attente	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
10	Diallo	Cheikh	cheikh.diallo@terrasyn.sn	$2y$12$dtIA/GMjb9RxPy3WjIyijuOW9cQBVqApM95wTH7C6eD4x9c9wFhNO	+221 77 555 0123	admin	2025-08-23 16:46:26	\N	2025-08-23 16:46:26	2025-08-23 16:46:26	\N	en_attente	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
11	Sow	Aminata	manager.test@terrasyn.sn	$2y$12$pk5jqtyHqkKQCMirQtwyB.IhaX8gJWr1rhkRVSU.XOA87VjjeoOV2	+221 77 888 9999	gestionnaire	2025-08-23 16:46:26	\N	2025-08-23 16:46:26	2025-08-23 16:46:26	\N	en_attente	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 6448 (class 0 OID 0)
-- Dependencies: 239
-- Name: abonnements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.abonnements_id_seq', 4, true);


--
-- TOC entry 6449 (class 0 OID 0)
-- Dependencies: 277
-- Name: analytics_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analytics_events_id_seq', 1, false);


--
-- TOC entry 6450 (class 0 OID 0)
-- Dependencies: 269
-- Name: configuration_systeme_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuration_systeme_id_seq', 20, true);


--
-- TOC entry 6451 (class 0 OID 0)
-- Dependencies: 308
-- Name: contrats_commission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contrats_commission_id_seq', 1, false);


--
-- TOC entry 6452 (class 0 OID 0)
-- Dependencies: 273
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversations_id_seq', 1, false);


--
-- TOC entry 6453 (class 0 OID 0)
-- Dependencies: 251
-- Name: demandes_remboursement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demandes_remboursement_id_seq', 1, false);


--
-- TOC entry 6454 (class 0 OID 0)
-- Dependencies: 281
-- Name: error_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.error_logs_id_seq', 1, false);


--
-- TOC entry 6455 (class 0 OID 0)
-- Dependencies: 231
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- TOC entry 6456 (class 0 OID 0)
-- Dependencies: 271
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorites_id_seq', 1, false);


--
-- TOC entry 6457 (class 0 OID 0)
-- Dependencies: 299
-- Name: historique_litige_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historique_litige_id_seq', 1, false);


--
-- TOC entry 6458 (class 0 OID 0)
-- Dependencies: 253
-- Name: historique_prix_terrains_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historique_prix_terrains_id_seq', 1, false);


--
-- TOC entry 6459 (class 0 OID 0)
-- Dependencies: 228
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- TOC entry 6460 (class 0 OID 0)
-- Dependencies: 293
-- Name: litiges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.litiges_id_seq', 1, false);


--
-- TOC entry 6461 (class 0 OID 0)
-- Dependencies: 267
-- Name: logs_systeme_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_systeme_id_seq', 1, false);


--
-- TOC entry 6462 (class 0 OID 0)
-- Dependencies: 275
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- TOC entry 6463 (class 0 OID 0)
-- Dependencies: 295
-- Name: messages_litige_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_litige_id_seq', 1, false);


--
-- TOC entry 6464 (class 0 OID 0)
-- Dependencies: 224
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 31, true);


--
-- TOC entry 6465 (class 0 OID 0)
-- Dependencies: 289
-- Name: niveaux_fidelite_terrain_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.niveaux_fidelite_terrain_id_seq', 1, false);


--
-- TOC entry 6466 (class 0 OID 0)
-- Dependencies: 259
-- Name: notification_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_templates_id_seq', 1, false);


--
-- TOC entry 6467 (class 0 OID 0)
-- Dependencies: 249
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 6468 (class 0 OID 0)
-- Dependencies: 297
-- Name: notifications_litige_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_litige_id_seq', 1, false);


--
-- TOC entry 6469 (class 0 OID 0)
-- Dependencies: 255
-- Name: notifications_systeme_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_systeme_id_seq', 1, false);


--
-- TOC entry 6470 (class 0 OID 0)
-- Dependencies: 243
-- Name: paiements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paiements_id_seq', 6, true);


--
-- TOC entry 6471 (class 0 OID 0)
-- Dependencies: 291
-- Name: parrainages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parrainages_id_seq', 1, false);


--
-- TOC entry 6472 (class 0 OID 0)
-- Dependencies: 279
-- Name: performance_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.performance_metrics_id_seq', 1, false);


--
-- TOC entry 6473 (class 0 OID 0)
-- Dependencies: 303
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 38, true);


--
-- TOC entry 6474 (class 0 OID 0)
-- Dependencies: 287
-- Name: points_fidelite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.points_fidelite_id_seq', 1, false);


--
-- TOC entry 6475 (class 0 OID 0)
-- Dependencies: 257
-- Name: politiques_remboursement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.politiques_remboursement_id_seq', 1, false);


--
-- TOC entry 6476 (class 0 OID 0)
-- Dependencies: 301
-- Name: prix_terrains_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prix_terrains_id_seq', 1, false);


--
-- TOC entry 6477 (class 0 OID 0)
-- Dependencies: 261
-- Name: rapports_generes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rapports_generes_id_seq', 1, false);


--
-- TOC entry 6478 (class 0 OID 0)
-- Dependencies: 285
-- Name: reductions_fidelite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reductions_fidelite_id_seq', 1, false);


--
-- TOC entry 6479 (class 0 OID 0)
-- Dependencies: 283
-- Name: remboursements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.remboursements_id_seq', 1, false);


--
-- TOC entry 6480 (class 0 OID 0)
-- Dependencies: 247
-- Name: reponses_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reponses_tickets_id_seq', 1, false);


--
-- TOC entry 6481 (class 0 OID 0)
-- Dependencies: 237
-- Name: reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservations_id_seq', 5, true);


--
-- TOC entry 6482 (class 0 OID 0)
-- Dependencies: 241
-- Name: souscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.souscriptions_id_seq', 1, false);


--
-- TOC entry 6483 (class 0 OID 0)
-- Dependencies: 265
-- Name: statistiques_abonnements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.statistiques_abonnements_id_seq', 1, false);


--
-- TOC entry 6484 (class 0 OID 0)
-- Dependencies: 263
-- Name: taches_programmees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.taches_programmees_id_seq', 1, false);


--
-- TOC entry 6485 (class 0 OID 0)
-- Dependencies: 235
-- Name: terrains_synthetiques_dakar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.terrains_synthetiques_dakar_id_seq', 15, true);


--
-- TOC entry 6486 (class 0 OID 0)
-- Dependencies: 245
-- Name: tickets_support_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_support_id_seq', 1, false);


--
-- TOC entry 6487 (class 0 OID 0)
-- Dependencies: 306
-- Name: types_abonnements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.types_abonnements_id_seq', 3, true);


--
-- TOC entry 6488 (class 0 OID 0)
-- Dependencies: 233
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- TOC entry 5966 (class 2606 OID 152676)
-- Name: abonnements abonnements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abonnements
    ADD CONSTRAINT abonnements_pkey PRIMARY KEY (id);


--
-- TOC entry 6035 (class 2606 OID 153069)
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5938 (class 2606 OID 152580)
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- TOC entry 5936 (class 2606 OID 152573)
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- TOC entry 6015 (class 2606 OID 152989)
-- Name: configuration_systeme configuration_systeme_cle_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuration_systeme
    ADD CONSTRAINT configuration_systeme_cle_unique UNIQUE (cle);


--
-- TOC entry 6017 (class 2606 OID 152987)
-- Name: configuration_systeme configuration_systeme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuration_systeme
    ADD CONSTRAINT configuration_systeme_pkey PRIMARY KEY (id);


--
-- TOC entry 6096 (class 2606 OID 153478)
-- Name: contrats_commission contrats_commission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_commission
    ADD CONSTRAINT contrats_commission_pkey PRIMARY KEY (id);


--
-- TOC entry 6024 (class 2606 OID 153029)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5981 (class 2606 OID 152794)
-- Name: demandes_remboursement demandes_remboursement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_remboursement
    ADD CONSTRAINT demandes_remboursement_pkey PRIMARY KEY (id);


--
-- TOC entry 6043 (class 2606 OID 153099)
-- Name: error_logs error_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5945 (class 2606 OID 152607)
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 5947 (class 2606 OID 152609)
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- TOC entry 6019 (class 2606 OID 153005)
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- TOC entry 6022 (class 2606 OID 153017)
-- Name: favorites favorites_user_id_terrain_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_terrain_id_unique UNIQUE (user_id, terrain_id);


--
-- TOC entry 6080 (class 2606 OID 153328)
-- Name: historique_litige historique_litige_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_litige
    ADD CONSTRAINT historique_litige_pkey PRIMARY KEY (id);


--
-- TOC entry 5988 (class 2606 OID 152822)
-- Name: historique_prix_terrains historique_prix_terrains_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_prix_terrains
    ADD CONSTRAINT historique_prix_terrains_pkey PRIMARY KEY (id);


--
-- TOC entry 5943 (class 2606 OID 152597)
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 5940 (class 2606 OID 152589)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 6066 (class 2606 OID 153275)
-- Name: litiges litiges_numero_litige_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.litiges
    ADD CONSTRAINT litiges_numero_litige_unique UNIQUE (numero_litige);


--
-- TOC entry 6068 (class 2606 OID 153250)
-- Name: litiges litiges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.litiges
    ADD CONSTRAINT litiges_pkey PRIMARY KEY (id);


--
-- TOC entry 6012 (class 2606 OID 152967)
-- Name: logs_systeme logs_systeme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_systeme
    ADD CONSTRAINT logs_systeme_pkey PRIMARY KEY (id);


--
-- TOC entry 6074 (class 2606 OID 153287)
-- Name: messages_litige messages_litige_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages_litige
    ADD CONSTRAINT messages_litige_pkey PRIMARY KEY (id);


--
-- TOC entry 6029 (class 2606 OID 153047)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5934 (class 2606 OID 152566)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 6057 (class 2606 OID 153197)
-- Name: niveaux_fidelite_terrain niveaux_fidelite_terrain_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.niveaux_fidelite_terrain
    ADD CONSTRAINT niveaux_fidelite_terrain_pkey PRIMARY KEY (id);


--
-- TOC entry 6059 (class 2606 OID 153204)
-- Name: niveaux_fidelite_terrain niveaux_fidelite_terrain_terrain_id_niveau_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.niveaux_fidelite_terrain
    ADD CONSTRAINT niveaux_fidelite_terrain_terrain_id_niveau_unique UNIQUE (terrain_id, niveau);


--
-- TOC entry 6000 (class 2606 OID 152884)
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 6076 (class 2606 OID 153308)
-- Name: notifications_litige notifications_litige_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_litige
    ADD CONSTRAINT notifications_litige_pkey PRIMARY KEY (id);


--
-- TOC entry 5979 (class 2606 OID 152773)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5992 (class 2606 OID 152844)
-- Name: notifications_systeme notifications_systeme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_systeme
    ADD CONSTRAINT notifications_systeme_pkey PRIMARY KEY (id);


--
-- TOC entry 5971 (class 2606 OID 152717)
-- Name: paiements paiements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_pkey PRIMARY KEY (id);


--
-- TOC entry 5973 (class 2606 OID 152725)
-- Name: paiements paiements_reference_transaction_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_reference_transaction_unique UNIQUE (reference_transaction);


--
-- TOC entry 6061 (class 2606 OID 153234)
-- Name: parrainages parrainages_code_parrainage_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parrainages
    ADD CONSTRAINT parrainages_code_parrainage_unique UNIQUE (code_parrainage);


--
-- TOC entry 6064 (class 2606 OID 153216)
-- Name: parrainages parrainages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parrainages
    ADD CONSTRAINT parrainages_pkey PRIMARY KEY (id);


--
-- TOC entry 6040 (class 2606 OID 153086)
-- Name: performance_metrics performance_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_metrics
    ADD CONSTRAINT performance_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 6085 (class 2606 OID 153364)
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 6087 (class 2606 OID 153367)
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- TOC entry 6054 (class 2606 OID 153174)
-- Name: points_fidelite points_fidelite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_fidelite
    ADD CONSTRAINT points_fidelite_pkey PRIMARY KEY (id);


--
-- TOC entry 5996 (class 2606 OID 152866)
-- Name: politiques_remboursement politiques_remboursement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.politiques_remboursement
    ADD CONSTRAINT politiques_remboursement_pkey PRIMARY KEY (id);


--
-- TOC entry 5998 (class 2606 OID 152873)
-- Name: politiques_remboursement politiques_remboursement_terrain_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.politiques_remboursement
    ADD CONSTRAINT politiques_remboursement_terrain_id_unique UNIQUE (terrain_id);


--
-- TOC entry 6082 (class 2606 OID 153349)
-- Name: prix_terrains prix_terrains_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prix_terrains
    ADD CONSTRAINT prix_terrains_pkey PRIMARY KEY (id);


--
-- TOC entry 6002 (class 2606 OID 152914)
-- Name: rapports_generes rapports_generes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_generes
    ADD CONSTRAINT rapports_generes_pkey PRIMARY KEY (id);


--
-- TOC entry 6051 (class 2606 OID 153154)
-- Name: reductions_fidelite reductions_fidelite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reductions_fidelite
    ADD CONSTRAINT reductions_fidelite_pkey PRIMARY KEY (id);


--
-- TOC entry 6046 (class 2606 OID 153121)
-- Name: remboursements remboursements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remboursements
    ADD CONSTRAINT remboursements_pkey PRIMARY KEY (id);


--
-- TOC entry 5977 (class 2606 OID 152753)
-- Name: reponses_tickets reponses_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reponses_tickets
    ADD CONSTRAINT reponses_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 5960 (class 2606 OID 153381)
-- Name: reservations reservations_code_ticket_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_code_ticket_unique UNIQUE (code_ticket);


--
-- TOC entry 5963 (class 2606 OID 152656)
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 6091 (class 2606 OID 153374)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5968 (class 2606 OID 152695)
-- Name: souscriptions souscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.souscriptions
    ADD CONSTRAINT souscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 6006 (class 2606 OID 152957)
-- Name: statistiques_abonnements statistiques_abonnements_abonnement_id_date_statistique_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistiques_abonnements
    ADD CONSTRAINT statistiques_abonnements_abonnement_id_date_statistique_unique UNIQUE (abonnement_id, date_statistique);


--
-- TOC entry 6008 (class 2606 OID 152950)
-- Name: statistiques_abonnements statistiques_abonnements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistiques_abonnements
    ADD CONSTRAINT statistiques_abonnements_pkey PRIMARY KEY (id);


--
-- TOC entry 6004 (class 2606 OID 152930)
-- Name: taches_programmees taches_programmees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taches_programmees
    ADD CONSTRAINT taches_programmees_pkey PRIMARY KEY (id);


--
-- TOC entry 5957 (class 2606 OID 152639)
-- Name: terrains_synthetiques_dakar terrains_synthetiques_dakar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terrains_synthetiques_dakar
    ADD CONSTRAINT terrains_synthetiques_dakar_pkey PRIMARY KEY (id);


--
-- TOC entry 5975 (class 2606 OID 152738)
-- Name: tickets_support tickets_support_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_support
    ADD CONSTRAINT tickets_support_pkey PRIMARY KEY (id);


--
-- TOC entry 6094 (class 2606 OID 153403)
-- Name: types_abonnements types_abonnements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_abonnements
    ADD CONSTRAINT types_abonnements_pkey PRIMARY KEY (id);


--
-- TOC entry 5949 (class 2606 OID 152621)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 5951 (class 2606 OID 152619)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 6032 (class 1259 OID 153077)
-- Name: analytics_events_event_category_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX analytics_events_event_category_created_at_index ON public.analytics_events USING btree (event_category, created_at);


--
-- TOC entry 6033 (class 1259 OID 153075)
-- Name: analytics_events_event_name_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX analytics_events_event_name_created_at_index ON public.analytics_events USING btree (event_name, created_at);


--
-- TOC entry 6036 (class 1259 OID 153076)
-- Name: analytics_events_user_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX analytics_events_user_id_created_at_index ON public.analytics_events USING btree (user_id, created_at);


--
-- TOC entry 6025 (class 1259 OID 153036)
-- Name: conversations_reservation_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversations_reservation_id_index ON public.conversations USING btree (reservation_id);


--
-- TOC entry 6026 (class 1259 OID 153035)
-- Name: conversations_type_is_active_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversations_type_is_active_index ON public.conversations USING btree (type, is_active);


--
-- TOC entry 5982 (class 1259 OID 152810)
-- Name: demandes_remboursement_reservation_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_remboursement_reservation_id_index ON public.demandes_remboursement USING btree (reservation_id);


--
-- TOC entry 5983 (class 1259 OID 152812)
-- Name: demandes_remboursement_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_remboursement_statut_index ON public.demandes_remboursement USING btree (statut);


--
-- TOC entry 5984 (class 1259 OID 152813)
-- Name: demandes_remboursement_type_remboursement_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_remboursement_type_remboursement_index ON public.demandes_remboursement USING btree (type_remboursement);


--
-- TOC entry 5985 (class 1259 OID 152811)
-- Name: demandes_remboursement_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_remboursement_user_id_index ON public.demandes_remboursement USING btree (user_id);


--
-- TOC entry 6041 (class 1259 OID 153105)
-- Name: error_logs_error_type_severity_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX error_logs_error_type_severity_created_at_index ON public.error_logs USING btree (error_type, severity, created_at);


--
-- TOC entry 6044 (class 1259 OID 153106)
-- Name: error_logs_resolved_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX error_logs_resolved_created_at_index ON public.error_logs USING btree (resolved, created_at);


--
-- TOC entry 6020 (class 1259 OID 153018)
-- Name: favorites_user_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX favorites_user_id_created_at_index ON public.favorites USING btree (user_id, created_at);


--
-- TOC entry 6078 (class 1259 OID 153339)
-- Name: historique_litige_litige_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historique_litige_litige_id_created_at_index ON public.historique_litige USING btree (litige_id, created_at);


--
-- TOC entry 5986 (class 1259 OID 152834)
-- Name: historique_prix_terrains_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historique_prix_terrains_created_at_index ON public.historique_prix_terrains USING btree (created_at);


--
-- TOC entry 5989 (class 1259 OID 152833)
-- Name: historique_prix_terrains_terrain_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historique_prix_terrains_terrain_id_index ON public.historique_prix_terrains USING btree (terrain_id);


--
-- TOC entry 5952 (class 1259 OID 153384)
-- Name: idx_terrains_geom; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_terrains_geom ON public.terrains_synthetiques_dakar USING gist (geom);


--
-- TOC entry 5953 (class 1259 OID 153465)
-- Name: idx_terrains_geom_polygon; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_terrains_geom_polygon ON public.terrains_synthetiques_dakar USING gist (geom_polygon);


--
-- TOC entry 5941 (class 1259 OID 152590)
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- TOC entry 6069 (class 1259 OID 153273)
-- Name: litiges_priorite_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX litiges_priorite_statut_index ON public.litiges USING btree (priorite, statut);


--
-- TOC entry 6070 (class 1259 OID 153272)
-- Name: litiges_terrain_id_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX litiges_terrain_id_statut_index ON public.litiges USING btree (terrain_id, statut);


--
-- TOC entry 6071 (class 1259 OID 153271)
-- Name: litiges_user_id_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX litiges_user_id_statut_index ON public.litiges USING btree (user_id, statut);


--
-- TOC entry 6009 (class 1259 OID 152974)
-- Name: logs_systeme_module_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX logs_systeme_module_created_at_index ON public.logs_systeme USING btree (module, created_at);


--
-- TOC entry 6010 (class 1259 OID 152973)
-- Name: logs_systeme_niveau_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX logs_systeme_niveau_created_at_index ON public.logs_systeme USING btree (niveau, created_at);


--
-- TOC entry 6013 (class 1259 OID 152975)
-- Name: logs_systeme_user_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX logs_systeme_user_id_created_at_index ON public.logs_systeme USING btree (user_id, created_at);


--
-- TOC entry 6027 (class 1259 OID 153058)
-- Name: messages_conversation_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_conversation_id_created_at_index ON public.messages USING btree (conversation_id, created_at);


--
-- TOC entry 6072 (class 1259 OID 153298)
-- Name: messages_litige_litige_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_litige_litige_id_created_at_index ON public.messages_litige USING btree (litige_id, created_at);


--
-- TOC entry 6030 (class 1259 OID 153060)
-- Name: messages_read_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_read_at_index ON public.messages USING btree (read_at);


--
-- TOC entry 6031 (class 1259 OID 153059)
-- Name: messages_sender_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_sender_id_index ON public.messages USING btree (sender_id);


--
-- TOC entry 6077 (class 1259 OID 153319)
-- Name: notifications_litige_user_id_lu_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_litige_user_id_lu_index ON public.notifications_litige USING btree (user_id, lu);


--
-- TOC entry 5990 (class 1259 OID 152852)
-- Name: notifications_systeme_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_systeme_created_at_index ON public.notifications_systeme USING btree (created_at);


--
-- TOC entry 5993 (class 1259 OID 152851)
-- Name: notifications_systeme_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_systeme_type_index ON public.notifications_systeme USING btree (type);


--
-- TOC entry 5994 (class 1259 OID 152850)
-- Name: notifications_systeme_user_id_is_read_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_systeme_user_id_is_read_index ON public.notifications_systeme USING btree (user_id, is_read);


--
-- TOC entry 5969 (class 1259 OID 152723)
-- Name: paiements_payable_type_payable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX paiements_payable_type_payable_id_index ON public.paiements USING btree (payable_type, payable_id);


--
-- TOC entry 6062 (class 1259 OID 153232)
-- Name: parrainages_parrain_id_terrain_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX parrainages_parrain_id_terrain_id_index ON public.parrainages USING btree (parrain_id, terrain_id);


--
-- TOC entry 6037 (class 1259 OID 153088)
-- Name: performance_metrics_context_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX performance_metrics_context_created_at_index ON public.performance_metrics USING btree (context, created_at);


--
-- TOC entry 6038 (class 1259 OID 153087)
-- Name: performance_metrics_metric_name_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX performance_metrics_metric_name_created_at_index ON public.performance_metrics USING btree (metric_name, created_at);


--
-- TOC entry 6088 (class 1259 OID 153365)
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- TOC entry 6055 (class 1259 OID 153185)
-- Name: points_fidelite_user_id_terrain_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX points_fidelite_user_id_terrain_id_index ON public.points_fidelite USING btree (user_id, terrain_id);


--
-- TOC entry 6083 (class 1259 OID 153355)
-- Name: prix_terrains_terrain_id_taille_periode_jour_semaine_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prix_terrains_terrain_id_taille_periode_jour_semaine_index ON public.prix_terrains USING btree (terrain_id, taille, periode, jour_semaine);


--
-- TOC entry 6052 (class 1259 OID 153165)
-- Name: reductions_fidelite_user_id_terrain_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reductions_fidelite_user_id_terrain_id_index ON public.reductions_fidelite USING btree (user_id, terrain_id);


--
-- TOC entry 6047 (class 1259 OID 153139)
-- Name: remboursements_regle_appliquee_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX remboursements_regle_appliquee_index ON public.remboursements USING btree (regle_appliquee);


--
-- TOC entry 6048 (class 1259 OID 153138)
-- Name: remboursements_statut_date_demande_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX remboursements_statut_date_demande_index ON public.remboursements USING btree (statut, date_demande);


--
-- TOC entry 6049 (class 1259 OID 153137)
-- Name: remboursements_user_id_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX remboursements_user_id_statut_index ON public.remboursements USING btree (user_id, statut);


--
-- TOC entry 5958 (class 1259 OID 153378)
-- Name: reservations_code_ticket_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_code_ticket_index ON public.reservations USING btree (code_ticket);


--
-- TOC entry 5961 (class 1259 OID 153379)
-- Name: reservations_derniere_validation_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_derniere_validation_index ON public.reservations USING btree (derniere_validation);


--
-- TOC entry 5964 (class 1259 OID 153377)
-- Name: reservations_qr_code_token_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_qr_code_token_index ON public.reservations USING btree (qr_code_token);


--
-- TOC entry 6089 (class 1259 OID 153376)
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- TOC entry 6092 (class 1259 OID 153375)
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- TOC entry 5954 (class 1259 OID 153382)
-- Name: terrains_gps_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX terrains_gps_index ON public.terrains_synthetiques_dakar USING btree (latitude, longitude);


--
-- TOC entry 5955 (class 1259 OID 152645)
-- Name: terrains_synthetiques_dakar_latitude_longitude_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX terrains_synthetiques_dakar_latitude_longitude_index ON public.terrains_synthetiques_dakar USING btree (latitude, longitude);


--
-- TOC entry 6103 (class 2606 OID 152682)
-- Name: abonnements abonnements_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abonnements
    ADD CONSTRAINT abonnements_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id);


--
-- TOC entry 6104 (class 2606 OID 153404)
-- Name: abonnements abonnements_type_abonnement_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abonnements
    ADD CONSTRAINT abonnements_type_abonnement_id_foreign FOREIGN KEY (type_abonnement_id) REFERENCES public.types_abonnements(id) ON DELETE SET NULL;


--
-- TOC entry 6105 (class 2606 OID 152677)
-- Name: abonnements abonnements_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abonnements
    ADD CONSTRAINT abonnements_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6131 (class 2606 OID 153070)
-- Name: analytics_events analytics_events_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6155 (class 2606 OID 153479)
-- Name: contrats_commission contrats_commission_gestionnaire_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_commission
    ADD CONSTRAINT contrats_commission_gestionnaire_id_foreign FOREIGN KEY (gestionnaire_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6156 (class 2606 OID 153484)
-- Name: contrats_commission contrats_commission_terrain_synthetique_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_commission
    ADD CONSTRAINT contrats_commission_terrain_synthetique_id_foreign FOREIGN KEY (terrain_synthetique_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE SET NULL;


--
-- TOC entry 6128 (class 2606 OID 153030)
-- Name: conversations conversations_reservation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_reservation_id_foreign FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON DELETE CASCADE;


--
-- TOC entry 6114 (class 2606 OID 152795)
-- Name: demandes_remboursement demandes_remboursement_reservation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_remboursement
    ADD CONSTRAINT demandes_remboursement_reservation_id_foreign FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON DELETE CASCADE;


--
-- TOC entry 6115 (class 2606 OID 152805)
-- Name: demandes_remboursement demandes_remboursement_traite_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_remboursement
    ADD CONSTRAINT demandes_remboursement_traite_par_foreign FOREIGN KEY (traite_par) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6116 (class 2606 OID 152800)
-- Name: demandes_remboursement demandes_remboursement_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_remboursement
    ADD CONSTRAINT demandes_remboursement_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6132 (class 2606 OID 153100)
-- Name: error_logs error_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6126 (class 2606 OID 153011)
-- Name: favorites favorites_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6127 (class 2606 OID 153006)
-- Name: favorites favorites_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6152 (class 2606 OID 153329)
-- Name: historique_litige historique_litige_litige_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_litige
    ADD CONSTRAINT historique_litige_litige_id_foreign FOREIGN KEY (litige_id) REFERENCES public.litiges(id) ON DELETE CASCADE;


--
-- TOC entry 6153 (class 2606 OID 153334)
-- Name: historique_litige historique_litige_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_litige
    ADD CONSTRAINT historique_litige_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6117 (class 2606 OID 152828)
-- Name: historique_prix_terrains historique_prix_terrains_gestionnaire_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_prix_terrains
    ADD CONSTRAINT historique_prix_terrains_gestionnaire_id_foreign FOREIGN KEY (gestionnaire_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6118 (class 2606 OID 152823)
-- Name: historique_prix_terrains historique_prix_terrains_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_prix_terrains
    ADD CONSTRAINT historique_prix_terrains_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6144 (class 2606 OID 153266)
-- Name: litiges litiges_ferme_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.litiges
    ADD CONSTRAINT litiges_ferme_par_foreign FOREIGN KEY (ferme_par) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6145 (class 2606 OID 153261)
-- Name: litiges litiges_reservation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.litiges
    ADD CONSTRAINT litiges_reservation_id_foreign FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON DELETE SET NULL;


--
-- TOC entry 6146 (class 2606 OID 153256)
-- Name: litiges litiges_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.litiges
    ADD CONSTRAINT litiges_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6147 (class 2606 OID 153251)
-- Name: litiges litiges_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.litiges
    ADD CONSTRAINT litiges_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6125 (class 2606 OID 152968)
-- Name: logs_systeme logs_systeme_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_systeme
    ADD CONSTRAINT logs_systeme_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6129 (class 2606 OID 153048)
-- Name: messages messages_conversation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_foreign FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 6148 (class 2606 OID 153288)
-- Name: messages_litige messages_litige_litige_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages_litige
    ADD CONSTRAINT messages_litige_litige_id_foreign FOREIGN KEY (litige_id) REFERENCES public.litiges(id) ON DELETE CASCADE;


--
-- TOC entry 6149 (class 2606 OID 153293)
-- Name: messages_litige messages_litige_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages_litige
    ADD CONSTRAINT messages_litige_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6130 (class 2606 OID 153053)
-- Name: messages messages_sender_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_foreign FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6140 (class 2606 OID 153198)
-- Name: niveaux_fidelite_terrain niveaux_fidelite_terrain_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.niveaux_fidelite_terrain
    ADD CONSTRAINT niveaux_fidelite_terrain_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6121 (class 2606 OID 152885)
-- Name: notification_templates notification_templates_cree_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_cree_par_foreign FOREIGN KEY (cree_par) REFERENCES public.users(id);


--
-- TOC entry 6150 (class 2606 OID 153309)
-- Name: notifications_litige notifications_litige_litige_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_litige
    ADD CONSTRAINT notifications_litige_litige_id_foreign FOREIGN KEY (litige_id) REFERENCES public.litiges(id) ON DELETE CASCADE;


--
-- TOC entry 6151 (class 2606 OID 153314)
-- Name: notifications_litige notifications_litige_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_litige
    ADD CONSTRAINT notifications_litige_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6119 (class 2606 OID 152845)
-- Name: notifications_systeme notifications_systeme_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_systeme
    ADD CONSTRAINT notifications_systeme_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6112 (class 2606 OID 152894)
-- Name: notifications notifications_template_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_template_id_foreign FOREIGN KEY (template_id) REFERENCES public.notification_templates(id);


--
-- TOC entry 6113 (class 2606 OID 152774)
-- Name: notifications notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6108 (class 2606 OID 152718)
-- Name: paiements paiements_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6141 (class 2606 OID 153222)
-- Name: parrainages parrainages_filleul_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parrainages
    ADD CONSTRAINT parrainages_filleul_id_foreign FOREIGN KEY (filleul_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6142 (class 2606 OID 153217)
-- Name: parrainages parrainages_parrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parrainages
    ADD CONSTRAINT parrainages_parrain_id_foreign FOREIGN KEY (parrain_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6143 (class 2606 OID 153227)
-- Name: parrainages parrainages_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parrainages
    ADD CONSTRAINT parrainages_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6138 (class 2606 OID 153180)
-- Name: points_fidelite points_fidelite_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_fidelite
    ADD CONSTRAINT points_fidelite_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6139 (class 2606 OID 153175)
-- Name: points_fidelite points_fidelite_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_fidelite
    ADD CONSTRAINT points_fidelite_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6120 (class 2606 OID 152867)
-- Name: politiques_remboursement politiques_remboursement_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.politiques_remboursement
    ADD CONSTRAINT politiques_remboursement_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6154 (class 2606 OID 153350)
-- Name: prix_terrains prix_terrains_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prix_terrains
    ADD CONSTRAINT prix_terrains_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6122 (class 2606 OID 152915)
-- Name: rapports_generes rapports_generes_genere_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_generes
    ADD CONSTRAINT rapports_generes_genere_par_foreign FOREIGN KEY (genere_par) REFERENCES public.users(id);


--
-- TOC entry 6136 (class 2606 OID 153160)
-- Name: reductions_fidelite reductions_fidelite_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reductions_fidelite
    ADD CONSTRAINT reductions_fidelite_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6137 (class 2606 OID 153155)
-- Name: reductions_fidelite reductions_fidelite_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reductions_fidelite
    ADD CONSTRAINT reductions_fidelite_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6133 (class 2606 OID 153122)
-- Name: remboursements remboursements_reservation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remboursements
    ADD CONSTRAINT remboursements_reservation_id_foreign FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON DELETE CASCADE;


--
-- TOC entry 6134 (class 2606 OID 153132)
-- Name: remboursements remboursements_traite_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remboursements
    ADD CONSTRAINT remboursements_traite_par_foreign FOREIGN KEY (traite_par) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6135 (class 2606 OID 153127)
-- Name: remboursements remboursements_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remboursements
    ADD CONSTRAINT remboursements_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6110 (class 2606 OID 152754)
-- Name: reponses_tickets reponses_tickets_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reponses_tickets
    ADD CONSTRAINT reponses_tickets_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets_support(id) ON DELETE CASCADE;


--
-- TOC entry 6111 (class 2606 OID 152759)
-- Name: reponses_tickets reponses_tickets_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reponses_tickets
    ADD CONSTRAINT reponses_tickets_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6099 (class 2606 OID 153140)
-- Name: reservations reservations_annule_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_annule_par_foreign FOREIGN KEY (annule_par) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6100 (class 2606 OID 152657)
-- Name: reservations reservations_terrain_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_terrain_id_foreign FOREIGN KEY (terrain_id) REFERENCES public.terrains_synthetiques_dakar(id);


--
-- TOC entry 6101 (class 2606 OID 153385)
-- Name: reservations reservations_terrain_synthetique_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_terrain_synthetique_id_foreign FOREIGN KEY (terrain_synthetique_id) REFERENCES public.terrains_synthetiques_dakar(id) ON DELETE CASCADE;


--
-- TOC entry 6102 (class 2606 OID 152662)
-- Name: reservations reservations_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6106 (class 2606 OID 152701)
-- Name: souscriptions souscriptions_abonnement_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.souscriptions
    ADD CONSTRAINT souscriptions_abonnement_id_foreign FOREIGN KEY (abonnement_id) REFERENCES public.abonnements(id);


--
-- TOC entry 6107 (class 2606 OID 152696)
-- Name: souscriptions souscriptions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.souscriptions
    ADD CONSTRAINT souscriptions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6124 (class 2606 OID 152951)
-- Name: statistiques_abonnements statistiques_abonnements_abonnement_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistiques_abonnements
    ADD CONSTRAINT statistiques_abonnements_abonnement_id_foreign FOREIGN KEY (abonnement_id) REFERENCES public.abonnements(id) ON DELETE CASCADE;


--
-- TOC entry 6123 (class 2606 OID 152931)
-- Name: taches_programmees taches_programmees_cree_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taches_programmees
    ADD CONSTRAINT taches_programmees_cree_par_foreign FOREIGN KEY (cree_par) REFERENCES public.users(id);


--
-- TOC entry 6098 (class 2606 OID 152640)
-- Name: terrains_synthetiques_dakar terrains_synthetiques_dakar_gestionnaire_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terrains_synthetiques_dakar
    ADD CONSTRAINT terrains_synthetiques_dakar_gestionnaire_id_foreign FOREIGN KEY (gestionnaire_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6109 (class 2606 OID 152739)
-- Name: tickets_support tickets_support_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_support
    ADD CONSTRAINT tickets_support_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6097 (class 2606 OID 152992)
-- Name: users users_valide_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_valide_par_foreign FOREIGN KEY (valide_par) REFERENCES public.users(id);


--
-- TOC entry 6397 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-03-02 09:36:29

--
-- PostgreSQL database dump complete
--

\unrestrict WHKfBTRKuEdCbyWEZmTc7Z36EWM9V9JE6jnYbPgt7Fv2ExraxInqF93gxgnda8e

