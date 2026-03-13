# 🎨 Diagrama Visual - Integração SAP × SILIC 2.0

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    FLUXO COMPLETO DE INTEGRAÇÃO SAP                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│  PASSO 1: DADOS DE ORIGEM (SAP)                                             │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────┐
    │      📊 Sistema SAP - CAIXA           │
    │                                        │
    │  • Contratos de Locação               │
    │  • Dados de Locadores                 │
    │  • Endereços Completos                │
    │  • Informações de Contato             │
    └────────────────┬───────────────────────┘
                     │
                     │ Exportar
                     ▼
    ┌────────────────────────────────────────┐
    │   📁 rel-SAP.xlsx                     │
    │                                        │
    │  22 colunas × N linhas                │
    │  • Contrato                           │
    │  • Denominação                        │
    │  • Parceiro de negócios               │
    │  • CPF/CNPJ                           │
    │  • Endereços                          │
    │  • Telefones                          │
    │  • Datas                              │
    └────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PASSO 2: IMPORTAÇÃO E CONVERSÃO (Python)                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────┐
    │   🔧 ./import-sap.sh                  │
    │                                        │
    │  OU                                    │
    │                                        │
    │   🐍 python3 scripts/import-sap-data.py│
    └────────────────┬───────────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  🔄 PROCESSAMENTO                                           │
    │                                                             │
    │  1️⃣  Ler Excel (pandas)                                     │
    │  2️⃣  Validar estrutura                                      │
    │  3️⃣  Mapear campos SAP → TypeScript                        │
    │  4️⃣  Gerar IDs únicos                                       │
    │  5️⃣  Determinar tipo de imóvel                             │
    │  6️⃣  Calcular status do contrato                           │
    │  7️⃣  Formatar documentos (CPF/CNPJ)                        │
    │  8️⃣  Extrair e organizar endereços                         │
    │  9️⃣  Gerar metadados                                        │
    │  🔟 Salvar JSON                                             │
    └────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │   📤 dados-sap.json                   │
    │                                        │
    │  {                                     │
    │    "imoveis": [...],                  │
    │    "locadores": [...],                │
    │    "metadados": {...}                 │
    │  }                                     │
    └────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PASSO 3: CARREGAMENTO NO PROTÓTIPO (TypeScript)                           │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────┐
    │   💻 npm run dev                      │
    └────────────────┬───────────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  🚀 SistemaSILIC (main.ts)                                  │
    │                                                             │
    │  async carregarDados() {                                    │
    │      const dadosSAP = await SAPDataLoader.carregarDados(); │
    │                                                             │
    │      if (dadosSAP) {                                        │
    │          // ✅ Usa dados do SAP                            │
    │          this.imoveis = dadosSAP.imoveis;                  │
    │          this.locadores = dadosSAP.locadores;              │
    │          this.usandoDadosSAP = true;                       │
    │      } else {                                               │
    │          // 📋 Usa dados demo                              │
    │          this.carregarDadosDemo();                         │
    │          this.usandoDadosSAP = false;                      │
    │      }                                                      │
    │  }                                                          │
    └────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  🎨 INTERFACE DO USUÁRIO                                    │
    │                                                             │
    │  ┌─────────────────────────────────────────────────────┐   │
    │  │ [LOGO CAIXA]  SILIC 2.0                            │   │
    │  │              Protótipo - Gestão de Imóveis         │   │
    │  │              🗂️ Dados do SAP                       │   │
    │  └─────────────────────────────────────────────────────┘   │
    │                                                             │
    │  ┌─────────────────────────────────────────────────────┐   │
    │  │  ✅ Dados do SAP carregados com sucesso!          │   │
    │  └─────────────────────────────────────────────────────┘   │
    │                                                             │
    │  ┌─────────────────────────────────────────────────────┐   │
    │  │         📊 DASHBOARD                                │   │
    │  │                                                     │   │
    │  │    Imóveis Cadastrados: 1                          │   │
    │  │                                                     │   │
    │  │    [Disponível: 0] [Ocupado: 1]                   │   │
    │  │    [Manutenção: 0] [Vendido: 0]                   │   │
    │  └─────────────────────────────────────────────────────┘   │
    │                                                             │
    │  ┌─────────────────────────────────────────────────────┐   │
    │  │  📋 LISTA DE IMÓVEIS                               │   │
    │  │                                                     │   │
    │  │  Código: 10000000                                  │   │
    │  │  Endereço: CT - AG VIÇOSA DE ALAGOAS, AL          │   │
    │  │  Status: Ocupado                                   │   │
    │  │  Tipo: Comercial                                   │   │
    │  │  Locador: GERALDINA TOLEDO DE VASCONCELOS...      │   │
    │  └─────────────────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                         MAPEAMENTO DE CAMPOS                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

SAP (Excel)                          →    TypeScript (JSON)
─────────────────────────────────────────────────────────────────────────────

📊 IMÓVEIS
├── Contrato                         →    codigo
├── Denominação do contrato          →    endereco
├── Bairro                           →    bairro
├── Local                            →    cidade
├── Região                           →    estado
├── Código postal                    →    cep
├── Denom.tipo contrato              →    tipo (mapeado)
├── Início + Fim + Rescisão          →    status (calculado)
├── Início do contrato               →    dataRegistro
└── [Informações extras]             →    caracteristicas
    ├── contratoInicio
    ├── contratoFim
    ├── tipoContrato
    └── parceiroNegocio

👥 LOCADORES
├── Nome/ender. (extraído)           →    nome
├── Tipo ID Fiscal                   →    tipo (fisica/juridica)
├── NºID fiscal                      →    documento
├── Nº telefone                      →    telefone
├── Endereço de e-mail               →    email
└── Endereço completo                →    endereco
    ├── Rua                          →    logradouro
    ├── Nº                           →    numero
    ├── Bairro                       →    bairro
    ├── Local                        →    cidade
    ├── Região                       →    estado
    └── Código postal                →    cep


╔══════════════════════════════════════════════════════════════════════════════╗
║                          REGRAS DE NEGÓCIO                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

🏢 DETERMINAÇÃO DO TIPO DE IMÓVEL
┌────────────────────────────────────────────────────────────────┐
│  IF denominação contém "ag" OR "agência"    → Comercial       │
│  ELSE IF contém "residencial" OR "casa"     → Residencial     │
│  ELSE IF contém "terreno" OR "lote"         → Terreno         │
│  ELSE IF contém "galpão" OR "industrial"    → Industrial      │
│  ELSE                                        → Comercial       │
└────────────────────────────────────────────────────────────────┘

📈 DETERMINAÇÃO DO STATUS DO CONTRATO
┌────────────────────────────────────────────────────────────────┐
│  IF tem data de rescisão                     → Vendido        │
│  ELSE IF data fim < hoje                     → Manutenção     │
│  ELSE IF data fim >= hoje                    → Ocupado        │
│  ELSE                                         → Disponível     │
└────────────────────────────────────────────────────────────────┘

🔑 GERAÇÃO DE IDs ÚNICOS
┌────────────────────────────────────────────────────────────────┐
│  ID = MD5(seed)[:12]                                          │
│                                                               │
│  Imóvel:   seed = "imovel_" + Contrato                       │
│  Locador:  seed = "locador_" + NºID fiscal                   │
└────────────────────────────────────────────────────────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                        ARQUITETURA DO SISTEMA                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│  CAMADA DE DADOS                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
    rel-SAP.xlsx ──────┬────────→ dados-sap.json
                       │
                import-sap-data.py
                       │
                 (Transformação)

┌─────────────────────────────────────────────────────────────────────────────┐
│  CAMADA DE CARREGAMENTO                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
    SAPDataLoader.ts
        │
        ├── carregarDados()           → Fetch JSON
        ├── temDadosDisponiveis()     → Verificação
        ├── obterEstatisticas()       → Análise
        └── formatarInfo()            → Formatação

┌─────────────────────────────────────────────────────────────────────────────┐
│  CAMADA DE APLICAÇÃO                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
    SistemaSILIC (main.ts)
        │
        ├── carregarDados()           → Orquestração
        ├── atualizarDashboard()      → Estatísticas
        ├── atualizarTabelaImoveis()  → Lista
        └── mostrarNotificacao()      → Feedback

┌─────────────────────────────────────────────────────────────────────────────┐
│  CAMADA DE APRESENTAÇÃO                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
    index.html + src/styles/style.css
        │
        ├── Header (Logo + Indicador)
        ├── Dashboard (Estatísticas)
        ├── Tabela (Lista de Imóveis)
        └── Notificações (Feedback)


╔══════════════════════════════════════════════════════════════════════════════╗
║                            LINHA DO TEMPO                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

    [1] Copiar Excel      →  [2] Importar      →  [3] Iniciar App
         30 seg                   5 seg                10 seg

    │                      │                    │
    │ rel-SAP.xlsx        │ dados-sap.json     │ Interface Carregada
    │ copiado para        │ gerado com         │ com dados do SAP
    │ public/             │ sucesso            │
    │                      │                    │
    └──────────────────────┴────────────────────┴──────────────────→
                                                            PRONTO!


╔══════════════════════════════════════════════════════════════════════════════╗
║                          INDICADORES VISUAIS                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

✅ DADOS DO SAP CARREGADOS
┌─────────────────────────────────────────────────────────────────┐
│  🗂️ Dados do SAP    (Badge verde no header)                    │
│                                                                 │
│  ✅ Dados do SAP carregados com sucesso! (Notificação verde)  │
└─────────────────────────────────────────────────────────────────┘

📋 DADOS DEMO (FALLBACK)
┌─────────────────────────────────────────────────────────────────┐
│  📋 Dados Demo      (Badge laranja no header)                  │
│                                                                 │
│  ℹ️ Usando dados de demonstração (Notificação azul)          │
└─────────────────────────────────────────────────────────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                              PRÓXIMOS PASSOS                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

    [ ] Adicionar mais registros no Excel de exemplo
    [ ] Implementar validação de dados na importação
    [ ] Criar interface para upload de arquivo
    [ ] Adicionar filtros específicos para dados SAP
    [ ] Implementar cache de dados
    [ ] Criar relatórios customizados
    [ ] Integração direta com API do SAP
    [ ] Sistema de auditoria
    [ ] Dashboard analítico avançado
```

**Legenda:**

- 📊 Dados/Sistema
- 🔧 Ferramentas
- 🐍 Python
- 💻 TypeScript
- 🎨 Interface
- ✅ Sucesso
- 📋 Alternativa
- 🗂️ SAP
- ⚠️ Atenção

---

**Versão**: 1.0.0  
**Data**: 12/11/2025  
**Projeto**: SILIC 2.0
