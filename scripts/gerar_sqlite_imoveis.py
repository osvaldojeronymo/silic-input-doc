import sqlite3
import json
from pathlib import Path
from scripts.gerar-dados-mockados import GeradorDadosSAP

def main():
    # Gerar 200 imóveis mockados
    gerador = GeradorDadosSAP()
    dados = gerador.gerar_dados_completos(num_imoveis=200)
    imoveis = dados['imoveis']

    # Definir estrutura da tabela
    campos = [
        'id', 'codigo', 'denominacao', 'tipoContrato', 'utilizacaoPrincipal', 'fimValidade',
        'endereco', 'bairro', 'cidade', 'estado', 'cep', 'tipo', 'status', 'descricao',
        'inscricaoIPTU', 'numeroITR', 'parceiroNegocio', 'locadorId', 'dataRegistro'
    ]

    # Criar banco SQLite
    db_path = Path('imoveis.db')
    if db_path.exists():
        db_path.unlink()  # Remove banco antigo
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()

    # Criar tabela
    cur.execute(f'''
        CREATE TABLE imoveis (
            id TEXT PRIMARY KEY,
            codigo TEXT,
            denominacao TEXT,
            tipoContrato TEXT,
            utilizacaoPrincipal TEXT,
            fimValidade TEXT,
            endereco TEXT,
            bairro TEXT,
            cidade TEXT,
            estado TEXT,
            cep TEXT,
            tipo TEXT,
            status TEXT,
            descricao TEXT,
            inscricaoIPTU TEXT,
            numeroITR TEXT,
            parceiroNegocio TEXT,
            locadorId TEXT,
            dataRegistro TEXT
        )
    ''')

    # Inserir imóveis
    for imovel in imoveis:
        # Flatten para os campos da tabela
        row = {
            'id': imovel['id'],
            'codigo': imovel['contrato']['numero'],
            'denominacao': imovel['contrato']['denominacao'],
            'tipoContrato': imovel['contrato']['tipoContrato'],
            'utilizacaoPrincipal': imovel['edificio']['utilizacaoPrincipal'],
            'fimValidade': imovel['contrato']['fimValidade'],
            'endereco': imovel['edificio']['endereco'],
            'bairro': imovel['edificio']['bairro'],
            'cidade': imovel['edificio']['local'],
            'estado': imovel['edificio']['regiao'],
            'cep': imovel['edificio']['cep'],
            'tipo': imovel['edificio']['tipoEdificio']['nome'],
            'status': imovel['edificio']['status'],
            'descricao': imovel['contrato']['denominacao'],
            'inscricaoIPTU': imovel['edificio']['inscricaoIPTU'],
            'numeroITR': imovel['edificio']['numeroITR'],
            'parceiroNegocio': str(imovel['contrato']['parceiroNegocio']),
            'locadorId': imovel['locadorId'],
            'dataRegistro': imovel.get('dataRegistro', '')
        }
        # Garantir que não há NULL
        for k in campos:
            if row[k] is None:
                row[k] = ''
        cur.execute(f"""
            INSERT INTO imoveis ({', '.join(campos)})
            VALUES ({', '.join(['?' for _ in campos])})
        """, [str(row[k]) for k in campos])

    conn.commit()
    conn.close()
    print(f"Banco SQLite criado e populado com {len(imoveis)} imóveis em {db_path}")

if __name__ == '__main__':
    main()
