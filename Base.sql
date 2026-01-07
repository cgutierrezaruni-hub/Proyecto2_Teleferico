--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-12-17 12:06:40

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 148606)
-- Name: departamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamentos (
    id integer NOT NULL,
    nombre_area character varying(100) NOT NULL
);


ALTER TABLE public.departamentos OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 148605)
-- Name: departamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departamentos_id_seq OWNER TO postgres;

--
-- TOC entry 4882 (class 0 OID 0)
-- Dependencies: 217
-- Name: departamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departamentos_id_seq OWNED BY public.departamentos.id;


--
-- TOC entry 224 (class 1259 OID 148665)
-- Name: documentos_postulante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documentos_postulante (
    id integer NOT NULL,
    postulante_ci integer NOT NULL,
    tipo character varying(50) NOT NULL,
    archivo_ruta character varying(255) NOT NULL,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.documentos_postulante OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 148664)
-- Name: documentos_postulante_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documentos_postulante_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documentos_postulante_id_seq OWNER TO postgres;

--
-- TOC entry 4883 (class 0 OID 0)
-- Dependencies: 223
-- Name: documentos_postulante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documentos_postulante_id_seq OWNED BY public.documentos_postulante.id;


--
-- TOC entry 226 (class 1259 OID 148678)
-- Name: entrevistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entrevistas (
    id integer NOT NULL,
    postulante_ci integer NOT NULL,
    jefe_ci integer NOT NULL,
    rrhh_ci integer NOT NULL,
    fecha_hora timestamp without time zone NOT NULL,
    estado character varying(50) DEFAULT 'programada'::character varying
);


ALTER TABLE public.entrevistas OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 148677)
-- Name: entrevistas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entrevistas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entrevistas_id_seq OWNER TO postgres;

--
-- TOC entry 4884 (class 0 OID 0)
-- Dependencies: 225
-- Name: entrevistas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entrevistas_id_seq OWNED BY public.entrevistas.id;


--
-- TOC entry 222 (class 1259 OID 148646)
-- Name: jefes_departamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jefes_departamento (
    usuario_ci integer NOT NULL,
    departamento_id integer NOT NULL,
    expedido_ci character varying(10),
    edad integer,
    lugar_nacimiento character varying(100),
    fecha_nacimiento date,
    tipo_sangre character varying(10),
    estado_actividad character varying(50),
    ubicacion_trabajo character varying(100),
    condicion_contrato character varying(100),
    gerencia character varying(100),
    departamento_nombre character varying(100),
    area_trabajo character varying(100),
    proceso_contratacion character varying(100),
    fuente_contrato character varying(100),
    nivel_cargo character varying(100),
    cargo_especifico character varying(100),
    item_codigo character varying(50),
    numero_contrato character varying(50),
    fecha_cumpleanios date,
    activo boolean DEFAULT true
);


ALTER TABLE public.jefes_departamento OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 148714)
-- Name: pasantes_contratados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pasantes_contratados (
    usuario_ci integer NOT NULL,
    departamento_id integer NOT NULL,
    jefe_ci integer NOT NULL,
    rrhh_induccion_ci integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    horario character varying(100),
    modalidad character varying(50),
    talla_chamarra character varying(10),
    numero_credencial character varying(50),
    recomendaciones text,
    ruta_informe_final character varying(255)
);


ALTER TABLE public.pasantes_contratados OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 148636)
-- Name: personal_rrhh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_rrhh (
    usuario_ci integer NOT NULL,
    cargo character varying(100)
);


ALTER TABLE public.personal_rrhh OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 148623)
-- Name: postulantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.postulantes (
    usuario_ci integer NOT NULL,
    fecha_nacimiento date,
    genero character varying(20),
    estado_civil character varying(50),
    tiene_hijos boolean,
    universidad character varying(255),
    carrera character varying(255),
    anio_cursando character varying(50),
    horas_acumular integer,
    numero_celular character varying(20),
    cuenta_seguro boolean,
    estado_postulacion character varying(50) DEFAULT 'pendiente'::character varying
);


ALTER TABLE public.postulantes OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 148701)
-- Name: tutoriales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutoriales (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    video_url character varying(255) NOT NULL,
    subido_por_rrhh_ci integer NOT NULL
);


ALTER TABLE public.tutoriales OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 148700)
-- Name: tutoriales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tutoriales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tutoriales_id_seq OWNER TO postgres;

--
-- TOC entry 4885 (class 0 OID 0)
-- Dependencies: 227
-- Name: tutoriales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tutoriales_id_seq OWNED BY public.tutoriales.id;


--
-- TOC entry 219 (class 1259 OID 148614)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    ci integer NOT NULL,
    extension_ci character varying(10),
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nombre_completo character varying(255) NOT NULL,
    rol character varying(20) NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 4676 (class 2604 OID 148609)
-- Name: departamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos ALTER COLUMN id SET DEFAULT nextval('public.departamentos_id_seq'::regclass);


--
-- TOC entry 4679 (class 2604 OID 148668)
-- Name: documentos_postulante id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_postulante ALTER COLUMN id SET DEFAULT nextval('public.documentos_postulante_id_seq'::regclass);


--
-- TOC entry 4681 (class 2604 OID 148681)
-- Name: entrevistas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrevistas ALTER COLUMN id SET DEFAULT nextval('public.entrevistas_id_seq'::regclass);


--
-- TOC entry 4683 (class 2604 OID 148704)
-- Name: tutoriales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutoriales ALTER COLUMN id SET DEFAULT nextval('public.tutoriales_id_seq'::regclass);


--
-- TOC entry 4865 (class 0 OID 148606)
-- Dependencies: 218
-- Data for Name: departamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departamentos (id, nombre_area) FROM stdin;
\.


--
-- TOC entry 4871 (class 0 OID 148665)
-- Dependencies: 224
-- Data for Name: documentos_postulante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documentos_postulante (id, postulante_ci, tipo, archivo_ruta, fecha_subida) FROM stdin;
\.


--
-- TOC entry 4873 (class 0 OID 148678)
-- Dependencies: 226
-- Data for Name: entrevistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entrevistas (id, postulante_ci, jefe_ci, rrhh_ci, fecha_hora, estado) FROM stdin;
\.


--
-- TOC entry 4869 (class 0 OID 148646)
-- Dependencies: 222
-- Data for Name: jefes_departamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jefes_departamento (usuario_ci, departamento_id, expedido_ci, edad, lugar_nacimiento, fecha_nacimiento, tipo_sangre, estado_actividad, ubicacion_trabajo, condicion_contrato, gerencia, departamento_nombre, area_trabajo, proceso_contratacion, fuente_contrato, nivel_cargo, cargo_especifico, item_codigo, numero_contrato, fecha_cumpleanios, activo) FROM stdin;
\.


--
-- TOC entry 4876 (class 0 OID 148714)
-- Dependencies: 229
-- Data for Name: pasantes_contratados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pasantes_contratados (usuario_ci, departamento_id, jefe_ci, rrhh_induccion_ci, fecha_inicio, fecha_fin, horario, modalidad, talla_chamarra, numero_credencial, recomendaciones, ruta_informe_final) FROM stdin;
\.


--
-- TOC entry 4868 (class 0 OID 148636)
-- Dependencies: 221
-- Data for Name: personal_rrhh; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_rrhh (usuario_ci, cargo) FROM stdin;
\.


--
-- TOC entry 4867 (class 0 OID 148623)
-- Dependencies: 220
-- Data for Name: postulantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.postulantes (usuario_ci, fecha_nacimiento, genero, estado_civil, tiene_hijos, universidad, carrera, anio_cursando, horas_acumular, numero_celular, cuenta_seguro, estado_postulacion) FROM stdin;
\.


--
-- TOC entry 4875 (class 0 OID 148701)
-- Dependencies: 228
-- Data for Name: tutoriales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tutoriales (id, titulo, video_url, subido_por_rrhh_ci) FROM stdin;
\.


--
-- TOC entry 4866 (class 0 OID 148614)
-- Dependencies: 219
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (ci, extension_ci, email, password_hash, nombre_completo, rol) FROM stdin;
\.


--
-- TOC entry 4886 (class 0 OID 0)
-- Dependencies: 217
-- Name: departamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departamentos_id_seq', 1, false);


--
-- TOC entry 4887 (class 0 OID 0)
-- Dependencies: 223
-- Name: documentos_postulante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documentos_postulante_id_seq', 1, false);


--
-- TOC entry 4888 (class 0 OID 0)
-- Dependencies: 225
-- Name: entrevistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entrevistas_id_seq', 1, false);


--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 227
-- Name: tutoriales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tutoriales_id_seq', 1, false);


--
-- TOC entry 4685 (class 2606 OID 148613)
-- Name: departamentos departamentos_nombre_area_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT departamentos_nombre_area_key UNIQUE (nombre_area);


--
-- TOC entry 4687 (class 2606 OID 148611)
-- Name: departamentos departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT departamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4699 (class 2606 OID 148671)
-- Name: documentos_postulante documentos_postulante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_postulante
    ADD CONSTRAINT documentos_postulante_pkey PRIMARY KEY (id);


--
-- TOC entry 4701 (class 2606 OID 148684)
-- Name: entrevistas entrevistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrevistas
    ADD CONSTRAINT entrevistas_pkey PRIMARY KEY (id);


--
-- TOC entry 4697 (class 2606 OID 148653)
-- Name: jefes_departamento jefes_departamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jefes_departamento
    ADD CONSTRAINT jefes_departamento_pkey PRIMARY KEY (usuario_ci);


--
-- TOC entry 4705 (class 2606 OID 148720)
-- Name: pasantes_contratados pasantes_contratados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasantes_contratados
    ADD CONSTRAINT pasantes_contratados_pkey PRIMARY KEY (usuario_ci);


--
-- TOC entry 4695 (class 2606 OID 148640)
-- Name: personal_rrhh personal_rrhh_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_rrhh
    ADD CONSTRAINT personal_rrhh_pkey PRIMARY KEY (usuario_ci);


--
-- TOC entry 4693 (class 2606 OID 148630)
-- Name: postulantes postulantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postulantes
    ADD CONSTRAINT postulantes_pkey PRIMARY KEY (usuario_ci);


--
-- TOC entry 4703 (class 2606 OID 148708)
-- Name: tutoriales tutoriales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutoriales
    ADD CONSTRAINT tutoriales_pkey PRIMARY KEY (id);


--
-- TOC entry 4689 (class 2606 OID 148622)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4691 (class 2606 OID 148620)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (ci);


--
-- TOC entry 4710 (class 2606 OID 148672)
-- Name: documentos_postulante fk_documentos_postulante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_postulante
    ADD CONSTRAINT fk_documentos_postulante FOREIGN KEY (postulante_ci) REFERENCES public.postulantes(usuario_ci) ON DELETE CASCADE;


--
-- TOC entry 4711 (class 2606 OID 148690)
-- Name: entrevistas fk_entrevista_jefe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrevistas
    ADD CONSTRAINT fk_entrevista_jefe FOREIGN KEY (jefe_ci) REFERENCES public.jefes_departamento(usuario_ci);


--
-- TOC entry 4712 (class 2606 OID 148685)
-- Name: entrevistas fk_entrevista_postulante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrevistas
    ADD CONSTRAINT fk_entrevista_postulante FOREIGN KEY (postulante_ci) REFERENCES public.postulantes(usuario_ci);


--
-- TOC entry 4713 (class 2606 OID 148695)
-- Name: entrevistas fk_entrevista_rrhh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrevistas
    ADD CONSTRAINT fk_entrevista_rrhh FOREIGN KEY (rrhh_ci) REFERENCES public.personal_rrhh(usuario_ci);


--
-- TOC entry 4708 (class 2606 OID 148659)
-- Name: jefes_departamento fk_jefe_departamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jefes_departamento
    ADD CONSTRAINT fk_jefe_departamento FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id);


--
-- TOC entry 4709 (class 2606 OID 148654)
-- Name: jefes_departamento fk_jefe_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jefes_departamento
    ADD CONSTRAINT fk_jefe_usuario FOREIGN KEY (usuario_ci) REFERENCES public.usuarios(ci) ON DELETE CASCADE;


--
-- TOC entry 4715 (class 2606 OID 148726)
-- Name: pasantes_contratados fk_pasante_departamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasantes_contratados
    ADD CONSTRAINT fk_pasante_departamento FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id);


--
-- TOC entry 4716 (class 2606 OID 148731)
-- Name: pasantes_contratados fk_pasante_jefe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasantes_contratados
    ADD CONSTRAINT fk_pasante_jefe FOREIGN KEY (jefe_ci) REFERENCES public.jefes_departamento(usuario_ci);


--
-- TOC entry 4717 (class 2606 OID 148736)
-- Name: pasantes_contratados fk_pasante_rrhh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasantes_contratados
    ADD CONSTRAINT fk_pasante_rrhh FOREIGN KEY (rrhh_induccion_ci) REFERENCES public.personal_rrhh(usuario_ci);


--
-- TOC entry 4718 (class 2606 OID 148721)
-- Name: pasantes_contratados fk_pasante_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasantes_contratados
    ADD CONSTRAINT fk_pasante_usuario FOREIGN KEY (usuario_ci) REFERENCES public.postulantes(usuario_ci);


--
-- TOC entry 4706 (class 2606 OID 148631)
-- Name: postulantes fk_postulante_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postulantes
    ADD CONSTRAINT fk_postulante_usuario FOREIGN KEY (usuario_ci) REFERENCES public.usuarios(ci) ON DELETE CASCADE;


--
-- TOC entry 4707 (class 2606 OID 148641)
-- Name: personal_rrhh fk_rrhh_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_rrhh
    ADD CONSTRAINT fk_rrhh_usuario FOREIGN KEY (usuario_ci) REFERENCES public.usuarios(ci) ON DELETE CASCADE;


--
-- TOC entry 4714 (class 2606 OID 148709)
-- Name: tutoriales fk_tutorial_rrhh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutoriales
    ADD CONSTRAINT fk_tutorial_rrhh FOREIGN KEY (subido_por_rrhh_ci) REFERENCES public.personal_rrhh(usuario_ci);


-- Completed on 2025-12-17 12:06:41

--
-- PostgreSQL database dump complete
--

