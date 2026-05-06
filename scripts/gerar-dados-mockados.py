#!/usr/bin/env python3
"""
Gerador de dados mockados realistas para o protótipo SILIC.
Gera massa SAP e mock DIJUR canônico baseado em imovel_sap.
"""

import argparse
import json
import random
from datetime import datetime, timedelta
from typing import List, Dict

class GeradorDadosSAP:
    def __init__(self):
        # Dados realistas para geração
        self.cidades_brasil = [
            ('VIÇOSA DE ALAGOAS', 'AL'), ('MACEIÓ', 'AL'), ('ARAPIRACA', 'AL'),
            ('RECIFE', 'PE'), ('OLINDA', 'PE'), ('JABOATÃO DOS GUARARAPES', 'PE'),
            ('SALVADOR', 'BA'), ('FEIRA DE SANTANA', 'BA'), ('VITÓRIA DA CONQUISTA', 'BA'),
            ('FORTALEZA', 'CE'), ('CAUCAIA', 'CE'), ('JUAZEIRO DO NORTE', 'CE'),
            ('SÃO PAULO', 'SP'), ('CAMPINAS', 'SP'), ('SANTOS', 'SP'), ('RIBEIRÃO PRETO', 'SP'),
            ('RIO DE JANEIRO', 'RJ'), ('NITERÓI', 'RJ'), ('DUQUE DE CAXIAS', 'RJ'),
            ('BELO HORIZONTE', 'MG'), ('UBERLÂNDIA', 'MG'), ('CONTAGEM', 'MG'),
            ('VITÓRIA', 'ES'), ('VILA VELHA', 'ES'), ('SERRA', 'ES'),
            ('NATAL', 'RN'), ('MOSSORÓ', 'RN'), ('PARNAMIRIM', 'RN'),
            ('JOÃO PESSOA', 'PB'), ('CAMPINA GRANDE', 'PB'),
            ('ARACAJU', 'SE'), ('NOSSA SENHORA DO SOCORRO', 'SE'),
            ('TERESINA', 'PI'), ('PARNAÍBA', 'PI'),
            ('SÃO LUÍS', 'MA'), ('IMPERATRIZ', 'MA'),
            ('CURITIBA', 'PR'), ('LONDRINA', 'PR'), ('MARINGÁ', 'PR'),
            ('PORTO ALEGRE', 'RS'), ('CAXIAS DO SUL', 'RS'), ('PELOTAS', 'RS'),
            ('FLORIANÓPOLIS', 'SC'), ('JOINVILLE', 'SC'), ('BLUMENAU', 'SC'),
            ('GOIÂNIA', 'GO'), ('APARECIDA DE GOIÂNIA', 'GO'),
            ('BRASÍLIA', 'DF'), ('CAMPO GRANDE', 'MS'), ('CUIABÁ', 'MT')
        ]
        
        self.logradouros = [
            'RUA', 'AVENIDA', 'PRAÇA', 'TRAVESSA', 'ALAMEDA', 'ESTRADA'
        ]
        
        self.nomes_ruas = [
            'BOA VIAGEM', 'FREI CANECA', 'PRINCESA ISABEL', 'DOM PEDRO II',
            'SETE DE SETEMBRO', 'QUINZE DE NOVEMBRO', 'PRESIDENTE VARGAS',
            'RIO BRANCO', 'SANTOS DUMONT', 'TIRADENTES', 'INDEPENDÊNCIA',
            'LIBERDADE', 'REPÚBLICA', 'PRIMEIRO DE MAIO', 'DAS FLORES',
            'CENTRAL', 'MAIN', 'COMERCIAL', 'INDUSTRIAL', 'PAULISTA',
            'ATLÂNTICA', 'COPACABANA', 'IPANEMA', 'AFONSO PENA',
            'GETÚLIO VARGAS', 'JOÃO PESSOA', 'BARÃO DO RIO BRANCO'
        ]
        
        self.bairros = [
            'CENTRO', 'BOA VIAGEM', 'CONSOLAÇÃO', 'JARDINS', 'CENTRO HISTÓRICO',
            'ALDEOTA', 'MEIRELES', 'COPACABANA', 'IPANEMA', 'LEBLON',
            'SAVASSI', 'LOURDES', 'FUNCIONÁRIOS', 'PRAIA DO CANTO',
            'JARDIM CAMBURI', 'PONTA VERDE', 'JATIÚCA', 'PITANGUEIRAS',
            'GONZAGA', 'EMBARÉ', 'CANDEIAS', 'BARRA', 'ONDINA'
        ]
        
        self.nomes_pf = [
            'MARIA SILVA SANTOS', 'JOÃO OLIVEIRA SOUZA', 'ANA PAULA COSTA',
            'CARLOS EDUARDO FERREIRA', 'JULIANA ALVES PEREIRA', 'PEDRO HENRIQUE LIMA',
            'FERNANDA RODRIGUES ALMEIDA', 'RICARDO SANTOS BARBOSA', 'PATRICIA GOMES MARTINS',
            'ROBERTO CARLOS SILVA', 'CLAUDIA MARIA OLIVEIRA', 'ANTONIO JOSÉ SANTOS',
            'GERALDINA TOLEDO DE VASCONCELOS', 'FRANCISCO DAS CHAGAS SILVA',
            'LUIZA FERNANDA COSTA', 'MARCOS VINÍCIUS SOUZA', 'BEATRIZ HELENA ALVES'
        ]
        
        self.nomes_pj = [
            'FREI CANECA SHOPPING E CONVENTION CENTER LTDA',
            'SHOPPING CENTER RECIFE LTDA',
            'COMERCIAL E ADMINISTRADORA DE IMÓVEIS LTDA',
            'CONSTRUTORA E INCORPORADORA LTDA',
            'IMOBILIÁRIA E LOCAÇÕES LTDA',
            'EMPREENDIMENTOS IMOBILIÁRIOS S/A',
            'ADMINISTRADORA DE BENS IMÓVEIS LTDA',
            'SHOPPING PÁTIO SALVADOR LTDA',
            'EDIFÍCIO COMERCIAL E SERVIÇOS LTDA',
            'GALERIA COMERCIAL LTDA'
        ]
        
        self.funcoes_edificio = [
            ('Z003', 'Atendimento Público'),
            ('Z001', 'Administrativo'),
            ('Z002', 'Operacional'),
            ('Z004', 'Arquivo'),
            ('Z005', 'Centro de Serviços')
        ]
        
        # Prefixos para denominação de contratos (baseado em dados reais)
        self.prefixos_contrato = [
            'CT - AG',          # Agência (70%)
            'CT - PA',          # Posto de Atendimento (10%)
            'CT - PAB',         # Posto de Atendimento Bancário (5%)
            'CT - PAE',         # Posto de Atendimento Eletrônico (3%)
            'CT - EDIFÍCIO',    # Edifício (5%)
            'CT - AGÊNCIA',     # Variação de Agência (4%)
            'CONTRATO AG.',     # Variação alternativa (2%)
            'SIPAT'             # Sistema de Patrimônio (1%)
        ]
        
        # Nomes específicos de locais (baseado em dados reais)
        self.nomes_locais = [
            'SHOPPING {}', 'PRAÇA {}', 'JARDIM {}', 'VILA {}', 'PARQUE {}',
            'CENTRO EMPRESARIAL', 'TEATRO {}', 'GRAND PLAZA SHOPPING',
            'JUSTIÇA FEDERAL DE {}', 'UFPA', 'ROCHDALE', 'BELAS ARTES',
            'EDUCANDOS', 'VER-O-PESO', 'BATISTA CAMPOS', 'AQUIRI',
            'PRAÇA DA REPÚBLICA', 'MONÇÕES', 'CASA DE PEDRA', 'CASA VERDE',
            'BROOKLIN', 'GRANJA JULIETA', 'PENHA DE FRANÇA', 'MAZZEI',
            'BUTANTÃ', 'FARIA LIMA', 'PARI', 'PERDIZES', 'VILLA LOBOS',
            'VILA MATILDE', 'VILA FORMOSA', 'ITAQUERA', 'PONTE RASA',
            'CAMPO LIMPO', 'ARTUR ALVIM', 'JABAQUARA', 'AROUCHE',
            'PARAÍSO', 'PAES DE BARROS', 'BOM RETIRO', 'PACAEMBU',
            'CLÍNICAS', 'MANDAQUI', 'VITAL BRASIL', 'VILA GUILHERME',
            'PERUS', 'LIMÃO', 'ANA COSTA', 'HEITOR PENTEADO'
        ]
        
        self.tipos_edificio = [
            (30, 'Prédio'),
            (31, 'Casa'),
            (32, 'Galpão'),
            (33, 'Terreno'),
            (34, 'Loja')
        ]
        
        self.status_opcoes = ['Ativo', 'Em Prospecção', 'Em Mobilização', 'Em Desmobilização', 'Desativado']
        
        self.denominacoes_imovel = ['Imóvel Foreiro', 'Imóvel Próprio', 'Imóvel Alugado', 'Imóvel Cedido']
        
        self.estado_conservacao = ['Ótimo', 'Bom', 'Regular', 'Necessita Reforma']

    def gerar_cpf(self) -> str:
        """Gera um CPF fictício (apenas para demonstração)"""
        return ''.join([str(random.randint(0, 9)) for _ in range(11)])
    
    def gerar_cnpj(self) -> str:
        """Gera um CNPJ fictício (apenas para demonstração)"""
        return ''.join([str(random.randint(0, 9)) for _ in range(14)])
    
    def gerar_cep(self, cidade: str, uf: str) -> str:
        """Gera CEP baseado na região"""
        prefixos = {
            'AL': '570', 'PE': '500', 'BA': '400', 'CE': '600',
            'SP': '011', 'RJ': '200', 'MG': '300', 'ES': '290',
            'RN': '590', 'PB': '580', 'SE': '490', 'PI': '640',
            'MA': '650', 'PR': '800', 'RS': '900', 'SC': '880',
            'GO': '720', 'DF': '700', 'MS': '790', 'MT': '780'
        }
        prefixo = prefixos.get(uf, '000')
        sufixo = ''.join([str(random.randint(0, 9)) for _ in range(5)])
        return f"{prefixo}{sufixo[:2]}-{sufixo[2:]}"
    
    def gerar_telefone(self, uf: str, celular: bool = False) -> str:
        """Gera telefone com DDD correto"""
        ddds = {
            'AL': '82', 'PE': '81', 'BA': '71', 'CE': '85',
            'SP': '11', 'RJ': '21', 'MG': '31', 'ES': '27',
            'RN': '84', 'PB': '83', 'SE': '79', 'PI': '86',
            'MA': '98', 'PR': '41', 'RS': '51', 'SC': '48',
            'GO': '62', 'DF': '61', 'MS': '67', 'MT': '65'
        }
        ddd = ddds.get(uf, '11')
        primeiro = '9' if celular else random.choice(['3', '2'])
        numero = ''.join([str(random.randint(0, 9)) for _ in range(8)])
        return f"55{ddd}{primeiro}{numero}"
    
    def gerar_email(self, nome: str) -> str:
        """Gera email baseado no nome"""
        nome_limpo = nome.lower().replace(' ', '.').split('/')[0].strip()
        dominios = ['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com', 'caixa.com.br']
        return f"{nome_limpo[:30]}@{random.choice(dominios)}"
    
    def gerar_data(self, inicio: str, fim: str) -> str:
        """Gera data aleatória entre duas datas"""
        start = datetime.strptime(inicio, '%d/%m/%Y')
        end = datetime.strptime(fim, '%d/%m/%Y')
        delta = end - start
        random_days = random.randint(0, delta.days)
        data = start + timedelta(days=random_days)
        return data.strftime('%d/%m/%Y')
    
    def gerar_locador(self, id_locador: int, eh_pj: bool, cidade: str, uf: str) -> Dict:
        """Gera dados de um locador (PF ou PJ)"""
        if eh_pj:
            nome_base = random.choice(self.nomes_pj)
            tipo_id = 'CNPJ'
            documento = self.gerar_cnpj()
        else:
            nome_base = random.choice(self.nomes_pf)
            tipo_id = 'CPF'
            documento = self.gerar_cpf()
        
        tipo_logradouro = random.choice(self.logradouros)
        nome_rua = random.choice(self.nomes_ruas)
        numero = random.randint(1, 9999)
        bairro = random.choice(self.bairros)
        
        endereco_completo = f"{nome_base} / {tipo_logradouro} {nome_rua} {numero} / {cidade} - {uf}"
        
        return {
            'id': f"locador_{str(id_locador).zfill(6)}",
            'parceiroNegocio': 900127000 + id_locador,
            'tipoIdFiscal': tipo_id,
            'numeroIdFiscal': documento,
            'nome': nome_base,
            'nomeEndereco': endereco_completo,
            'funcaoPN': 'Proponente Credor',
            'tipo': 'juridica' if eh_pj else 'fisica',
            'endereco': {
                'rua': f"{tipo_logradouro} {nome_rua}",
                'numero': numero,
                'bairro': bairro,
                'cidade': cidade,
                'regiao': uf,
                'cep': self.gerar_cep(cidade, uf)
            },
            'email': self.gerar_email(nome_base),
            'telefone': self.gerar_telefone(uf, False),
            'telefoneCelular': self.gerar_telefone(uf, True),
            'inicioRelacao': self.gerar_data('01/01/1990', '31/12/2020'),
            'fimRelacao': self.gerar_data('01/01/2025', '31/12/9999'),
            'status': 'ativo'
        }
    
    def gerar_denominacao_contrato(self, cidade: str, uf: str) -> str:
        """Gera denominação do contrato seguindo padrões reais do banco de dados"""
        # Distribuição de probabilidades baseada em amostra real
        rand = random.random()
        
        if rand < 0.01:  # 1% - SIPAT
            num1 = random.randint(939, 9999)
            num2 = random.randint(1000, 9999)
            return f"SIPAT {num1} {num2} Contrato pág. GELOG"
        
        elif rand < 0.03:  # 2% - CONTRATO AG.
            local = random.choice(self.nomes_locais)
            if '{}' in local:
                nome_cidade = cidade.split()[0].upper()
                local = local.format(nome_cidade)
            return f"CONTRATO AG. {local}"
        
        elif rand < 0.08:  # 5% - CT - EDIFÍCIO
            nomes_edificios = [
                'PRAÇA DA REPÚBLICA', 'ELUMA 7º ANDAR', 
                'ELUMA - GIRET E GILOG 6 ANDAR A/B',
                'CORPORATE CENTER', 'BUSINESS TOWER'
            ]
            edificio = random.choice(nomes_edificios)
            return f"CT - EDIFÍCIO {edificio}, {uf}"
        
        elif rand < 0.12:  # 4% - CT - AGÊNCIA (escrito por extenso)
            local = random.choice(self.nomes_locais)
            if '{}' in local:
                nome_cidade = cidade.split()[0].upper()
                local = local.format(nome_cidade)
            return f"CT - AGÊNCIA {local}, {uf}"
        
        elif rand < 0.15:  # 3% - CT - PAE
            local = random.choice(self.nomes_locais)
            if '{}' in local:
                nome_cidade = cidade.split()[0].upper()
                local = local.format(nome_cidade)
            return f"CT - PAE {local}, {uf}"
        
        elif rand < 0.20:  # 5% - CT - PAB
            local = random.choice(self.nomes_locais)
            if '{}' in local:
                nome_cidade = cidade.split()[0].upper()
                local = local.format(nome_cidade)
            else:
                # Para PAB, muitas vezes é "JUSTIÇA FEDERAL DE"
                if random.random() < 0.5:
                    return f"CT - PAB JUSTIÇA FEDERAL DE {cidade.upper()}, {uf}"
            return f"CT - PAB {local}, {uf}"
        
        elif rand < 0.30:  # 10% - CT - PA
            local = random.choice(self.nomes_locais)
            if '{}' in local:
                nome_cidade = cidade.split()[0].upper()
                local = local.format(nome_cidade)
            else:
                # Para PA, algumas vezes é instalação militar ou universidade
                if random.random() < 0.3:
                    instalacoes = [
                        f"UFPA", f"QG CMSE 2º EXERCITO",
                        f"BATALHÃO {cidade.upper()}"
                    ]
                    local = random.choice(instalacoes)
            return f"CT - PA {local}, {uf}"
        
        else:  # 70% - CT - AG (padrão mais comum)
            # Usa nomes de locais variados
            if random.random() < 0.6:  # 60% usa nomes específicos
                local = random.choice(self.nomes_locais)
                if '{}' in local:
                    nome_cidade = cidade.split()[0].upper()
                    local = local.format(nome_cidade)
            else:  # 40% usa apenas o nome da cidade
                local = cidade.upper()
            
            # Algumas entradas têm formatação ligeiramente diferente
            if random.random() < 0.02:  # 2% tem hífen diferente
                return f"CT- AG. {local}/{uf}"
            
            return f"CT - AG {local}, {uf}"
    
    def gerar_imovel(self, id_imovel: int, locador_id: int) -> Dict:
        """Gera dados completos de um imóvel"""
        cidade, uf = random.choice(self.cidades_brasil)
        
        # Dados do Contrato (REISCNBP)
        codigo_contrato = 10000000 + id_imovel
        denominacao_contrato = self.gerar_denominacao_contrato(cidade, uf)
        tipo_contrato = 'Contrato de Locação - Imóveis'
        
        # Datas do contrato
        inicio_contrato = self.gerar_data('01/01/1990', '31/12/2020')
        
        # Definir status e datas baseadas nele (ajustado para 80% Ativo, 10% Em Prospecção, 5% Em Mobilização, 5% Em Desmobilização)
        status_opcoes_ajustado = ['Ativo', 'Em Prospecção', 'Em Mobilização', 'Em Desmobilização']
        status = random.choices(
            status_opcoes_ajustado,
            weights=[80, 10, 5, 5],
            k=1
        )[0]
        
        if status in ['Ativo', 'Em Mobilização']:
            fim_validade = self.gerar_data('01/01/2025', '31/12/2030')
            rescisao = None
        elif status == 'Em Desmobilização':
            fim_validade = self.gerar_data('01/01/2024', '31/12/2025')
            rescisao = self.gerar_data('01/01/2024', '30/06/2025')
        else:  # Desativado
            fim_validade = self.gerar_data('01/01/2020', '31/12/2023')
            rescisao = self.gerar_data('01/01/2020', '31/12/2023')
        
        # Dados do Edifício (REISBU)
        codigo_edificio = 20000000 + id_imovel
        denominacao_edificio = f"ED - AG {cidade}, {uf}"
        
        tipo_edificio_cod, tipo_edificio_nome = random.choice(self.tipos_edificio)
        funcao_cod, funcao_nome = random.choice(self.funcoes_edificio)
        
        tipo_logradouro = random.choice(self.logradouros)
        nome_rua = random.choice(self.nomes_ruas)
        numero = random.randint(1, 9999)
        bairro = random.choice(self.bairros)
        cep = self.gerar_cep(cidade, uf)
        
        endereco_completo = f"AG {cidade}, {uf} / {tipo_logradouro} {nome_rua} {numero} / {cidade} - {uf}"
        
        inicio_validade_obj = self.gerar_data('01/01/1980', '31/12/2000')
        objeto_valido_ate = '31/12/9999' if status == 'Ativo' else fim_validade
        
        utilizacao = random.choices(['Próprio', 'Terceiro'], weights=[70, 30], k=1)[0]
        
        return {
            'id': f"imovel_{str(id_imovel).zfill(6)}",
            # Dados REISCNBP - Contrato
            'contrato': {
                'numero': codigo_contrato,
                'denominacao': denominacao_contrato,
                'tipoContrato': tipo_contrato,
                'inicioContrato': inicio_contrato,
                'fimValidade': fim_validade,
                'rescisaoEm': rescisao,
                'parceiroNegocio': 900127000 + locador_id
            },
            # Dados REISBU - Edifício
            'edificio': {
                'codigo': codigo_edificio,
                'denominacao': denominacao_edificio,
                'status': status,
                'cep': cep,
                'local': cidade,
                'rua': f"{tipo_logradouro} {nome_rua}",
                'numero': numero,
                'bairro': bairro,
                'regiao': uf,
                'inicioValidadeObj': inicio_validade_obj,
                'objetoValidoAte': objeto_valido_ate,
                'tipoEdificio': {
                    'codigo': tipo_edificio_cod,
                    'nome': tipo_edificio_nome
                },
                'criadoPor': f"C{random.randint(100000, 999999)}",
                'chavePais': 'BR',
                'endereco': endereco_completo,
                'estadoConservacao': random.choice(self.estado_conservacao),
                'funcao': {
                    'codigo': funcao_cod,
                    'nome': funcao_nome
                },
                'denominacaoImovel': random.choice(self.denominacoes_imovel),
                'utilizacaoPrincipal': utilizacao,
                'tipoApolice': random.randint(1, 5),
                'inscricaoIPTU': f"IM: INSC. {random.randint(100000, 999999)}",
                'numeroITR': f"CÓD. IMÓVEL {random.randint(1000, 9999)}",
                'grupoAutorizacoes': random.randint(7000, 7999)
            },
            'locadorId': f"locador_{str(locador_id).zfill(6)}"
        }
    
    def gerar_dados_completos(self, num_imoveis: int = 100) -> Dict:
        """Gera dataset completo com imóveis e locadores"""
        print(f"🏗️  Gerando {num_imoveis} imóveis com dados realistas...")
        
        locadores = []
        imoveis = []
        
        # Gerar locadores (aproximadamente 40% do número de imóveis)
        num_locadores = int(num_imoveis * 0.4)
        cidades_locadores = random.choices(self.cidades_brasil, k=num_locadores)
        
        for i in range(1, num_locadores + 1):
            cidade, uf = cidades_locadores[i-1]
            eh_pj = random.random() < 0.3  # 30% PJ, 70% PF
            locador = self.gerar_locador(i, eh_pj, cidade, uf)
            locadores.append(locador)
            print(f"  ✓ Locador {i}/{num_locadores} gerado")
        
        # Gerar imóveis (alguns locadores terão múltiplos imóveis)
        for i in range(1, num_imoveis + 1):
            # Selecionar locador aleatório
            id_locador = random.randint(1, num_locadores)
            imovel = self.gerar_imovel(i, id_locador)
            imoveis.append(imovel)
            print(f"  ✓ Imóvel {i}/{num_imoveis} gerado")
        
        return {
            'imoveis': imoveis,
            'locadores': locadores,
            'metadados': {
                'dataGeracao': datetime.now().isoformat(),
                'fonte': 'Gerador automático de dados mockados',
                'versao': '2.0',
                'totalImoveis': len(imoveis),
                'totalLocadores': len(locadores),
                'estrutura': 'SAP REISCNBP + REISBU'
            }
        }

    def gerar_dados_dijur(self, dados_sap: Dict, cobertura: float = 0.72) -> Dict:
        """Gera um mock DIJUR amplo e consistente com a massa SAP."""
        imoveis = dados_sap.get('imoveis', [])
        locadores = {locador['id']: locador for locador in dados_sap.get('locadores', [])}

        if not imoveis:
            return {'registros': []}

        quantidade = max(12, int(len(imoveis) * cobertura))
        quantidade = min(quantidade, len(imoveis))
        amostra = random.sample(imoveis, quantidade)

        situacoes_sijur = [
            'Distribuído',
            'Em análise',
            'Aguardando subsídios',
            'Manifestação emitida',
            'Concluído'
        ]
        situacoes_cefor = [
            'Aguardando instrução',
            'Em acompanhamento',
            'Encaminhado para regularização',
            'Finalizado'
        ]

        registros = []
        ano_corrente = datetime.now().year

        for indice, imovel in enumerate(sorted(amostra, key=lambda item: item['edificio']['codigo']), start=1):
            codigo_imovel = str(imovel['edificio']['codigo'])
            locador = locadores.get(imovel.get('locadorId', ''))
            nome_locador = locador['nome'] if locador else 'Locador não identificado'

            data_entrada = datetime.now() - timedelta(days=random.randint(5, 540))
            last_sync = data_entrada + timedelta(days=random.randint(0, 20), hours=random.randint(1, 12))

            registros.append({
                'imovel_sap': codigo_imovel,
                'codigo_sijur': f"SIJUR-{ano_corrente}-{indice:05d}",
                'numero_processo_dijur': f"08001.{indice:06d}/{ano_corrente}-{random.randint(10, 99)}",
                'situacao_sijur': random.choice(situacoes_sijur),
                'situacao_cefor': random.choice(situacoes_cefor),
                'data_entrada_dijur': data_entrada.replace(microsecond=0).isoformat() + 'Z',
                'partes_dijur': f"CAIXA ECONÔMICA FEDERAL x {nome_locador}",
                'last_sync_at': last_sync.replace(microsecond=0).isoformat() + 'Z'
            })

        return {'registros': registros}


def carregar_dados_sap_existentes(caminho_arquivo: str) -> Dict:
    with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo:
        return json.load(arquivo)


def salvar_json(caminho_arquivo: str, dados: Dict) -> None:
    with open(caminho_arquivo, 'w', encoding='utf-8') as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)


def criar_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Gera mocks SAP e DIJUR para o protótipo SILIC.')
    parser.add_argument('--imoveis', type=int, default=100, help='Quantidade de imóveis para a massa SAP mockada.')
    parser.add_argument('--cobertura-dijur', type=float, default=0.72, help='Proporção da massa SAP com registro DIJUR.')
    parser.add_argument('--somente-dijur', action='store_true', help='Gera apenas public/dados-dijur.json a partir de um dados-sap.json existente.')
    parser.add_argument('--input-sap', default=None, help='Caminho do JSON SAP usado quando --somente-dijur for informado.')
    return parser

def main():
    parser = criar_parser()
    args = parser.parse_args()

    print("=" * 70)
    print("🏢 GERADOR DE DADOS MOCKADOS - SILIC 2.0")
    print("=" * 70)
    print()

    gerador = GeradorDadosSAP()
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_sap_path = os.path.join(script_dir, '..', 'public', 'dados-sap.json')
    output_dijur_path = os.path.join(script_dir, '..', 'public', 'dados-dijur.json')

    if args.somente_dijur:
        input_sap_path = args.input_sap or output_sap_path
        print(f"📂 Carregando base SAP existente: {input_sap_path}")
        dados = carregar_dados_sap_existentes(input_sap_path)
    else:
        dados = gerador.gerar_dados_completos(args.imoveis)
        print(f"\n💾 Salvando dados SAP em: {output_sap_path}")
        salvar_json(output_sap_path, dados)

    dados_dijur = gerador.gerar_dados_dijur(dados, args.cobertura_dijur)
    print(f"💾 Salvando dados DIJUR em: {output_dijur_path}")
    salvar_json(output_dijur_path, dados_dijur)
    
    print("\n" + "=" * 70)
    print("✅ GERAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 70)
    print(f"\n📊 Resumo:")
    print(f"   • Registros DIJUR gerados: {len(dados_dijur['registros'])}")
    print(f"   • Arquivo DIJUR: {output_dijur_path}")

    if args.somente_dijur:
        print(f"   • Base SAP utilizada: {args.input_sap or output_sap_path}")
        print("\n" + "=" * 70)
        return

    print(f"   • Imóveis gerados: {dados['metadados']['totalImoveis']}")
    print(f"   • Locadores gerados: {dados['metadados']['totalLocadores']}")
    print(f"   • Arquivo SAP: {output_sap_path}")
    print(f"\n🎯 Status dos imóveis:")
    
    status_count = {}
    for imovel in dados['imoveis']:
        status = imovel['edificio']['status']
        status_count[status] = status_count.get(status, 0) + 1
    
    for status, count in sorted(status_count.items()):
        percentual = (count / len(dados['imoveis'])) * 100
        print(f"   • {status}: {count} ({percentual:.1f}%)")
    
    print("\n🌎 Distribuição por estado:")
    uf_count = {}
    for imovel in dados['imoveis']:
        uf = imovel['edificio']['regiao']
        uf_count[uf] = uf_count.get(uf, 0) + 1
    
    for uf, count in sorted(uf_count.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"   • {uf}: {count} imóveis")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
