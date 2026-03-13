> Documento historico: este arquivo descreve um estado anterior do projeto e pode conter caminhos, comandos e links desatualizados.

# SILIC Input Doc - TypeScript + Vite

Este repositório opera oficialmente em `TypeScript + Vite`.

> Nota: o fluxo legado em JavaScript (arquivos `script.js`, `style.css`, `portal*` e arquivos de teste na raiz) foi descontinuado e removido.

## 🚀 Tecnologias Utilizadas

- **TypeScript** - Tipagem estática para maior segurança e produtividade
- **Vite** - Build tool moderna e rápida
- **CSS3** - Estilização seguindo padrões da CAIXA
- **HTML5** - Estrutura semântica

## 📁 Estrutura Atual do Projeto

```
silic-input-doc/
├── src/
│   ├── init.ts                    # Bootstrap da aplicação principal
│   ├── main.ts                    # Lógica principal
│   ├── labels.ts                  # Rótulos de negócio
│   ├── styles/                    # Estilos principais
│   │   └── style.css
│   ├── types/                     # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/
│   │   ├── index.ts
│   │   └── sapDataLoader.ts       # Integração de dados SAP
│   └── form-renderer/             # Módulo React para form renderer
├── public/
│   ├── dados-sap.json
│   └── logo-caixa.svg
├── index.html                     # Entrada principal
├── form-renderer.html             # Entrada do form renderer
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🛠️ Instalação e Uso

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```
3. **Fazer build para produção:**

   ```bash
   npm run build
   ```

4. **Verificar tipos TypeScript:**
   ```bash
   npm run typecheck
   ```

## 📋 Funcionalidades

### ✅ Implementadas

- ✅ Configuração TypeScript + Vite
- ✅ Estrutura modular de arquivos
- ✅ Tipos TypeScript definidos
- ✅ Geração de dados de demonstração
- ✅ Sistema de dashboard com estatísticas
- ✅ Classe principal `SistemaSILIC`

### 🔄 Em Desenvolvimento

- 🔄 Interface de gestão de imóveis
- 🔄 Sistema de filtros e busca
- 🔄 Paginação
- 🔄 Modais de detalhes
- 🔄 Gestão de locadores

### 📝 Tipos Principais

```typescript
interface Imovel {
  id: string;
  codigo: string;
  endereco: string;
  cidade: string;
  tipo: "residencial" | "comercial" | "terreno" | "industrial";
  status: "disponivel" | "ocupado" | "manutencao" | "vendido";
  valor?: number;
  // ... outros campos
}

interface Locador {
  id: string;
  nome: string;
  tipo: "fisica" | "juridica";
  documento: string;
  status: "ativo" | "inativo";
  // ... outros campos
}
```

## 🎯 Estado Atual

1. **Stack oficial:** TypeScript + Vite
2. **Entradas de build:** `index.html` e `form-renderer.html`
3. **Fluxo de dados:** `src/utils/sapDataLoader.ts` + fallback demo
4. **Legado JS:** descontinuado e removido do fluxo de execução

## 🔧 Configurações

### Vite (vite.config.ts)

- Porta: 3000
- Aliases para imports relativos
- Build otimizado

### TypeScript (tsconfig.json)

- Target: ES2020
- Strict mode habilitado
- Path mapping configurado

## 📞 Suporte

Para dúvidas sobre funcionalidades atuais, consulte:

- Código em `src/`
- Configuração de build em `vite.config.ts`
- Scripts de dados em `scripts/`

## 🚀 Próximos Passos

1. Evoluir funcionalidades atuais do módulo principal
2. Implementar testes unitários
3. Configurar CI/CD
4. Adicionar documentação de componentes
5. Otimizar performance
