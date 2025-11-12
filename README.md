# 🏠 SILIC Input Doc - TypeScript + Vite

**Sistema de Gestão de Imóveis SILIC 2.0 migrado para TypeScript e Vite**

🚀 **Demo:** [https://osvaldojeronymo.github.io/show-input-doc/](https://osvaldojeronymo.github.io/show-input-doc/)

## 📋 Visão Geral

Este projeto é uma migração completa do sistema SILIC Input Doc original (JavaScript puro) para uma stack moderna com TypeScript e Vite. Mantém todas as funcionalidades do sistema original, mas com melhor organização de código, tipagem estática e ferramentas de desenvolvimento otimizadas.

## 🛠️ Tecnologias

- **TypeScript** - Tipagem estática e melhor experiência de desenvolvimento
- **Vite** - Build tool moderna e extremamente rápida
- **CSS3** - Estilização seguindo padrões visuais da CAIXA
- **HTML5** - Estrutura semântica e acessível

## 📁 Estrutura do Projeto

```
show-input-doc/
├── 📂 src/
│   ├── 📂 components/       # Componentes modulares (futuro)
│   ├── 📂 styles/          # Arquivos CSS
│   │   └── style.css
│   ├── 📂 types/           # Definições TypeScript
│   │   └── index.ts
│   ├── 📂 utils/           # Funções utilitárias
│   │   └── index.ts
│   └── 📄 main.ts          # Classe principal da aplicação
├── 📂 public/
│   └── logo-caixa.svg      # Assets estáticos
├── 📄 index.html           # Página principal
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
└── 📄 README.md
```

## 🚀 Comandos Disponíveis

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
# Acessa: http://localhost:3000/show-input-doc/

# Verificar tipos TypeScript
npm run typecheck
```

### Build e Deploy
```bash
# Build para produção
npm run build

# Preview do build local
npm run preview

# Deploy para GitHub Pages
npm run deploy
```

## 📊 Funcionalidades

### ✅ **Implementadas**
- ✅ Dashboard com estatísticas em tempo real
- ✅ Sistema de geração de dados demo
- ✅ Estrutura modular TypeScript
- ✅ Configuração para GitHub Pages
- ✅ Build otimizado para produção

### 🔄 **Em Desenvolvimento**  
- 🔄 Interface completa de gestão de imóveis
- 🔄 Sistema avançado de filtros
- 🔄 Paginação dinâmica
- 🔄 Modais interativos
- 🔄 CRUD completo de locadores

## 🎯 Diferenças da Versão Original

| Aspecto | Versão Original | Versão TypeScript |
|---------|-----------------|-------------------|
| **Linguagem** | JavaScript Vanilla | TypeScript |
| **Build Tool** | Nenhuma | Vite |
| **Estrutura** | Arquivo único | Modular |
| **Tipagem** | Dinâmica | Estática |
| **Dev Experience** | Básica | IntelliSense + Hot Reload |
| **Deploy** | Manual | Automatizado (GitHub Actions) |

## 📋 Tipos Principais

```typescript
interface Imovel {
  id: string;
  codigo: string;
  endereco: string;
  cidade: string;
  tipo: 'residencial' | 'comercial' | 'terreno' | 'industrial';
  status: 'disponivel' | 'ocupado' | 'manutencao' | 'vendido';
  valor?: number;
  area?: number;
  // ... outros campos
}

interface Locador {
  id: string;
  nome: string;
  tipo: 'fisica' | 'juridica';
  documento: string; // CPF ou CNPJ
  status: 'ativo' | 'inativo';
  // ... outros campos
}
```

## ⚙️ Configurações

### **Vite (vite.config.ts)**
```typescript
{
  base: '/show-input-doc/',  // Para GitHub Pages
  port: 3000,               // Porta de desenvolvimento  
  // Aliases para imports limpos
}
```

### **TypeScript (tsconfig.json)**
```json
{
  "target": "ES2020",
  "strict": true,           // Tipagem rígida
  "moduleResolution": "bundler"
}
```

## 🌐 Deploy GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages:

1. **URL de produção:** `https://osvaldojeronymo.github.io/show-input-doc/`
2. **Branch de deploy:** `gh-pages` (criada automaticamente)
3. **Comando de deploy:** `npm run deploy`

### Como fazer deploy:

```bash
# 1. Fazer build
npm run build

# 2. Deploy para GitHub Pages  
npm run deploy
```

## 📞 Suporte e Contribuição

- **Repositório original:** [silic-input-doc](https://github.com/osvaldojeronymo/silic-input-doc)
- **Documentação:** Código TypeScript totalmente comentado
- **Issues:** Use o sistema de issues do GitHub para reportar problemas

## 📈 Roadmap

- [ ] **Fase 1:** Migração completa das funcionalidades JS → TS
- [ ] **Fase 2:** Implementação de testes unitários  
- [ ] **Fase 3:** Componentização com Web Components
- [ ] **Fase 4:** PWA e funcionalidades offline
- [ ] **Fase 5:** Integração com APIs reais

---

💡 **Este projeto demonstra a evolução de um sistema JavaScript legacy para uma arquitetura moderna e escalável.**
