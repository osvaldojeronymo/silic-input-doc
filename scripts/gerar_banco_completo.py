import sqlite3
import random
import string
from datetime import datetime, timedelta

DB_PATH = "imoveis.db"

# Utilitários

def random_str(size=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=size))

def random_nome():
    nomes = ["MARIA", "JOAO", "ANA", "CARLOS", "JULIANA", "PEDRO", "LUCAS", "FERNANDA", "PAULO", "MARCOS"]
    sobrenomes = ["SILVA", "SOUZA", "COSTA", "OLIVEIRA", "PEREIRA", "ALMEIDA", "LIMA", "GOMES", "RIBEIRO", "MARTINS"]
    return f"{random.choice(nomes)} {random.choice(sobrenomes)}"

def random_cidade():
    cidades = ["SAO PAULO", "RIO DE JANEIRO", "BELO HORIZONTE", "SALVADOR", "CURITIBA", "BRASILIA", "FORTALEZA", "RECIFE", "PORTO ALEGRE", "MANAUS"]
    return random.choice(cidades)

def random_estado():
    estados = ["SP", "RJ", "MG", "BA", "PR", "DF", "CE", "PE", "RS", "AM"]
    return random.choice(estados)

def random_bairro():
    bairros = ["CENTRO", "JARDINS", "COPACABANA", "SAVASSI", "PITUBA", "BATEL", "ASA SUL", "ALDEOTA", "BOA VIAGEM", "MOINHOS"]
    return random.choice(bairros)

def random_cep():
    return f"{random.randint(10000,99999)}-{random.randint(100,999)}"

def random_tipo_contrato():
    return random.choice(["Locação", "Cessão", "Comodato"])

def random_status():
    p = random.random()
    if p < 0.55:
        return "Ativo"
    elif p < 0.75:
        return "Em Prospecção"
    elif p < 0.90:
        return "Em Mobilização"
    else:
        return "Em Desmobilização"

def random_data(base=None, delta_min=0, delta_max=365):
    if base is None:
        base = datetime.now()
    delta = timedelta(days=random.randint(delta_min, delta_max))
    return (base + delta).strftime("%Y-%m-%d")

def random_valor(faixa):
    if faixa == 'pequeno':
        return round(random.uniform(2000, 5000), 2)
    elif faixa == 'medio':
        return round(random.uniform(5000, 15000), 2)
    else:
        return round(random.uniform(15000, 50000), 2)

def random_percentuals(n):
    parts = [random.uniform(0.1, 1.0) for _ in range(n)]
    total = sum(parts)
    return [round(100 * p / total, 2) for p in parts[:-1]] + [round(100 - sum([round(100 * p / total, 2) for p in parts[:-1]]), 2)]

def random_email(nome):
    return f"{nome.lower().replace(' ','.')}@exemplo.com"

def random_telefone():
    return f"({random.randint(10,99)})9{random.randint(8000,9999)}-{random.randint(1000,9999)}"

def random_tipo_aditivo():
    return random.choice(["Acréscimo de área", "Revisão INPC", "Supressão"])

def random_tipo_alerta():
    return random.choice(["garantia não informada", "seguro vencendo", "certidão pendente", "contrato próximo do vencimento"])

def random_nivel_risco():
    p = random.random()
    if p < 0.5:
        return "Baixo"
    elif p < 0.8:
        return "Médio"
    else:
        return "Alto"

def random_status_servico():
    p = random.random()
    if p < 0.6:
        return "Concluído"
    elif p < 0.9:
        return "Em andamento"
    else:
        return "Pendente"

def random_tipo_servico():
    return random.choice(["prorrogação", "rescisão", "revisão de aluguel", "ação renovatória"])

def random_tipo_etapa():
    return random.choice(["RTA", "LAUDO", "NEGOCIAÇÃO"])

def random_status_etapa():
    return random.choice(["Concluída", "Em andamento", "Pendente"])

def random_tipo_evento():
    return random.choice(["Assinatura", "Aditivo", "Reajuste", "Encerramento"])

# Criação do banco e tabelas
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Tabelas principais
conn.execute("DROP TABLE IF EXISTS imoveis;")
c.executescript('''
CREATE TABLE IF NOT EXISTS imoveis (
    id TEXT PRIMARY KEY,
    endereco TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    tipo TEXT,
    inscricao_iptu TEXT,
    numero_itr TEXT,
    status TEXT
);
CREATE TABLE IF NOT EXISTS locadores (
    id TEXT PRIMARY KEY,
    nome TEXT,
    tipo TEXT,
    documento TEXT,
    telefone TEXT,
    email TEXT,
    logradouro TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT
);
CREATE TABLE IF NOT EXISTS contratos (
    id TEXT PRIMARY KEY,
    numero_sap TEXT,
    imovel_id TEXT,
    tipo TEXT,
    status TEXT,
    data_inicio DATE,
    data_fim DATE,
    valor_mensal REAL,
    valor_global REAL,
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id)
);
CREATE TABLE IF NOT EXISTS contrato_locador (
    id TEXT PRIMARY KEY,
    contrato_id TEXT,
    locador_id TEXT,
    percentual REAL,
    forma_pagamento TEXT,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id),
    FOREIGN KEY (locador_id) REFERENCES locadores(id)
);
CREATE TABLE IF NOT EXISTS pagamentos (
    id TEXT PRIMARY KEY,
    contrato_id TEXT,
    competencia TEXT,
    data_vencimento DATE,
    valor REAL,
    status TEXT,
    data_pagamento DATE,
    multa REAL,
    juros REAL,
    total REAL,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);
CREATE TABLE IF NOT EXISTS aditivos (
    id TEXT PRIMARY KEY,
    contrato_id TEXT,
    tipo TEXT,
    data_inicio_efeitos DATE,
    vigencia_inicio DATE,
    vigencia_fim DATE,
    qtd_meses INTEGER,
    perc_acrescimo REAL,
    perc_supressao REAL,
    perc_revisao REAL,
    valor_mensal REAL,
    valor_global REAL,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);
CREATE TABLE IF NOT EXISTS servicos (
    id TEXT PRIMARY KEY,
    contrato_id TEXT,
    categoria TEXT,
    tipo TEXT,
    status TEXT,
    data_solicitacao DATE,
    data_conclusao DATE,
    observacoes TEXT,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);
CREATE TABLE IF NOT EXISTS etapas (
    id TEXT PRIMARY KEY,
    contrato_id TEXT,
    tipo TEXT,
    status TEXT,
    data_inicio DATE,
    data_fim DATE,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);
CREATE TABLE IF NOT EXISTS alertas (
    id TEXT PRIMARY KEY,
    contrato_id TEXT,
    tipo TEXT,
    categoria TEXT,
    descricao TEXT,
    nivel_risco TEXT,
    status TEXT,
    data_referencia DATE,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);
CREATE TABLE IF NOT EXISTS timeline_eventos (
    id TEXT PRIMARY KEY,
    contrato_id TEXT,
    tipo TEXT,
    descricao TEXT,
    data_evento DATE,
    valor_relacionado REAL,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);
CREATE VIEW IF NOT EXISTS projecao_financeira AS
SELECT
    c.id AS contrato_id,
    c.valor_global AS valor_original,
    IFNULL(SUM(a.valor_global), 0) AS soma_aditivos,
    (c.valor_global + IFNULL(SUM(a.valor_global), 0)) AS acumulado,
    IFNULL(SUM(p.valor), 0) AS pago,
    (c.valor_global + IFNULL(SUM(a.valor_global), 0)) - IFNULL(SUM(p.valor), 0) AS saldo_estimado
FROM contratos c
LEFT JOIN aditivos a ON c.id = a.contrato_id
LEFT JOIN pagamentos p ON c.id = p.contrato_id
GROUP BY c.id;
''')

# Geração de dados mockados
num_imoveis = 80
num_locadores = 60
num_contratos = 160
num_pagamentos = 1200
num_aditivos = 320
num_alertas = 350
num_servicos = 200
num_etapas = 200
num_timeline = 400


# LOCADORES
t_locadores = []
for i in range(num_locadores):
    id_ = f"LOC{str(i+1).zfill(4)}"
    nome = random_nome()
    tipo = random.choice(["fisica", "juridica"])
    doc = f"{random.randint(10000000000,99999999999)}"
    tel = random_telefone()
    email = random_email(nome)
    logradouro = f"RUA {random.randint(1,200)}"
    numero = str(random.randint(1,9999))
    bairro = random_bairro()
    cidade = random_cidade()
    estado = random_estado()
    cep = random_cep()
    t_locadores.append((id_, nome, tipo, doc, tel, email, logradouro, numero, bairro, cidade, estado, cep))
c.executemany("INSERT INTO locadores VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", t_locadores)


# IMÓVEIS
num_imoveis = 200
status_dist_imoveis = ["Ativo"] * int(num_imoveis * 0.80) + ["Em Prospecção"] * int(num_imoveis * 0.10) + ["Em Mobilização"] * int(num_imoveis * 0.05) + ["Em Desmobilização"] * (num_imoveis - int(num_imoveis * 0.80) - int(num_imoveis * 0.10) - int(num_imoveis * 0.05))
random.shuffle(status_dist_imoveis)
t_imoveis = []
t_contratos = []
contrato_ids = []
for i in range(num_imoveis):
    # Dados do imóvel
    id_imovel = f"IMV{str(i+1).zfill(4)}"
    endereco = f"RUA {random.randint(1,200)}"
    bairro = random_bairro()
    cidade = random_cidade()
    estado = random_estado()
    cep = random_cep()
    tipo_imovel = random.choice(["Comercial", "Residencial", "Industrial"])
    inscricao_iptu = f"{random.randint(1000000,9999999)}"
    numero_itr = f"{random.randint(1000000,9999999)}"
    status = status_dist_imoveis[i]
    t_imoveis.append((id_imovel, endereco, bairro, cidade, estado, cep, tipo_imovel, inscricao_iptu, numero_itr, status))
    # Contrato para o imóvel
    id_ = f"CTR{str(i+1).zfill(5)}"
    numero_sap = f"SAP{random.randint(100000,999999)}"
    imovel_id = id_imovel
    tipo = random_tipo_contrato()
    # Datas realistas
    ano_ini = random.choice([2023,2024,2025])
    mes_ini = random.randint(1,12)
    dia_ini = random.randint(1,28)
    data_inicio = datetime(ano_ini, mes_ini, dia_ini)
    duracao = random.randint(18, 48)
    data_fim = data_inicio + timedelta(days=30*duracao)
    valor_mensal = random_valor(random.choice(['pequeno','medio','grande']))
    valor_global = round(valor_mensal * duracao, 2)
    t_contratos.append((id_, numero_sap, imovel_id, tipo, status, data_inicio.strftime("%Y-%m-%d"), data_fim.strftime("%Y-%m-%d"), valor_mensal, valor_global))
    contrato_ids.append(id_)
c.executemany("INSERT INTO imoveis VALUES (?,?,?,?,?,?,?,?,?,?)", t_imoveis)
c.executemany("INSERT INTO contratos VALUES (?,?,?,?,?,?,?,?,?)", t_contratos)

# CONTRATO_LOCADOR (multi-locador)
t_contrato_locador = []
for ctr in contrato_ids:
    n = random.choices([1,2,3], weights=[70,25,5])[0]
    locs = random.sample(t_locadores, n)
    percentuais = random_percentuals(n)
    for idx, (loc, perc) in enumerate(zip(locs, percentuais)):
        t_contrato_locador.append((f"CL{ctr}{idx}", ctr, loc[0], perc, random.choice(["TED", "DOC", "PIX"])) )
c.executemany("INSERT INTO contrato_locador VALUES (?,?,?,?,?)", t_contrato_locador)

# PAGAMENTOS
t_pagamentos = []
for i in range(num_pagamentos):
    id_ = f"PG{str(i+1).zfill(6)}"
    contrato_id = random.choice(contrato_ids)
    competencia = f"{random.randint(2023,2026)}-{random.randint(1,12):02d}"
    data_vencimento = datetime.strptime(competencia+"-10", "%Y-%m-%d")
    valor = random_valor(random.choice(['pequeno','medio','grande']))
    # Status e datas
    p = random.random()
    if p < 0.6:
        status = "Pago em dia"
        data_pagamento = data_vencimento
    elif p < 0.85:
        status = "Pago com atraso"
        atraso = random.randint(1,15)
        data_pagamento = data_vencimento + timedelta(days=atraso)
    else:
        status = "Em atraso"
        data_pagamento = None
    multa = round(valor * 0.02 if status != "Pago em dia" else 0, 2)
    juros = round(valor * 0.0003 * ( (data_pagamento-data_vencimento).days if data_pagamento else 10), 2) if status != "Pago em dia" else 0
    total = valor + multa + juros
    t_pagamentos.append((id_, contrato_id, competencia, data_vencimento.strftime("%Y-%m-%d"), valor, status, data_pagamento.strftime("%Y-%m-%d") if data_pagamento else "", multa, juros, total))
c.executemany("INSERT INTO pagamentos VALUES (?,?,?,?,?,?,?,?,?,?)", t_pagamentos)

# ADITIVOS
t_aditivos = []
for i in range(num_aditivos):
    id_ = f"AD{i+1:04d}"
    contrato_id = random.choice(contrato_ids)
    tipo = random_tipo_aditivo()
    data_inicio_efeitos = random_data()
    vigencia_inicio = random_data()
    vigencia_fim = random_data()
    qtd_meses = random.randint(6,36)
    perc_acrescimo = round(random.uniform(0,0.2),2) if tipo=="Acréscimo de área" else 0
    perc_supressao = round(random.uniform(0,0.1),2) if tipo=="Supressão" else 0
    perc_revisao = round(random.uniform(0,0.12),2) if tipo=="Revisão INPC" else 0
    valor_mensal = random_valor(random.choice(['pequeno','medio','grande']))
    valor_global = round(valor_mensal * qtd_meses, 2)
    t_aditivos.append((id_, contrato_id, tipo, data_inicio_efeitos, vigencia_inicio, vigencia_fim, qtd_meses, perc_acrescimo, perc_supressao, perc_revisao, valor_mensal, valor_global))
c.executemany("INSERT INTO aditivos VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", t_aditivos)

# SERVIÇOS
t_servicos = []
for i in range(num_servicos):
    id_ = f"SV{i+1:04d}"
    contrato_id = random.choice(contrato_ids)
    categoria = random.choice(["Formalização", "Operacional"])
    tipo = random_tipo_servico()
    status = random_status_servico()
    data_solicitacao = random_data()
    data_conclusao = random_data() if status=="Concluído" else ""
    observacoes = f"Obs {i+1}"
    t_servicos.append((id_, contrato_id, categoria, tipo, status, data_solicitacao, data_conclusao, observacoes))
c.executemany("INSERT INTO servicos VALUES (?,?,?,?,?,?,?,?)", t_servicos)

# ETAPAS
t_etapas = []
for i in range(num_etapas):
    id_ = f"ET{i+1:04d}"
    contrato_id = random.choice(contrato_ids)
    tipo = random_tipo_etapa()
    status = random_status_etapa()
    data_inicio = random_data()
    data_fim = random_data()
    t_etapas.append((id_, contrato_id, tipo, status, data_inicio, data_fim))
c.executemany("INSERT INTO etapas VALUES (?,?,?,?,?,?)", t_etapas)

# ALERTAS
t_alertas = []
for i in range(num_alertas):
    id_ = f"AL{i+1:04d}"
    contrato_id = random.choice(contrato_ids)
    tipo = random_tipo_alerta()
    categoria = random.choice(["Financeiro", "Documental", "Operacional"])
    descricao = f"Alerta {i+1}"
    nivel_risco = random_nivel_risco()
    status = random.choice(["Aberto", "Fechado", "Em andamento"])
    data_referencia = random_data()
    t_alertas.append((id_, contrato_id, tipo, categoria, descricao, nivel_risco, status, data_referencia))
c.executemany("INSERT INTO alertas VALUES (?,?,?,?,?,?,?,?)", t_alertas)

# TIMELINE_EVENTOS
t_timeline = []
for i in range(num_timeline):
    id_ = f"TL{i+1:04d}"
    contrato_id = random.choice(contrato_ids)
    tipo = random_tipo_evento()
    descricao = f"Evento {i+1}"
    data_evento = random_data()
    valor_relacionado = random_valor(random.choice(['pequeno','medio','grande']))
    t_timeline.append((id_, contrato_id, tipo, descricao, data_evento, valor_relacionado))
c.executemany("INSERT INTO timeline_eventos VALUES (?,?,?,?,?,?)", t_timeline)

conn.commit()
conn.close()
print(f"Banco {DB_PATH} criado e populado com sucesso!")
