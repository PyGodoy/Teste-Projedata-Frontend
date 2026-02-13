# 📦 Sistema de Inventário - Frontend

Sistema de gerenciamento de inventário desenvolvido em React + TypeScript + Vite, com testes unitários e E2E.

## 🚀 Tecnologias

- **React** 19.2.0
- **TypeScript** 5.9.3
- **Vite** 7.3.1
- **Axios** 1.13.5
- **Vitest** - Testes unitários
- **Cypress** - Testes E2E
- **Testing Library** - Utilitários de teste

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Backend da API rodando em `http://localhost:8080`

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone 
cd Teste-Projedata-Frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Instale o Cypress (se ainda não estiver instalado):
```bash
npm install --save-dev cypress
```

## 🏃 Executando o Projeto

### Modo de Desenvolvimento

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em: `http://localhost:5173`

### Build de Produção

Para criar uma build otimizada para produção:
```bash
npm run build
```

### Preview da Build

Para visualizar a build de produção localmente:
```bash
npm run preview
```

## 🧪 Testes

### Testes Unitários

O projeto utiliza **Vitest** e **Testing Library** para testes unitários.

#### Executar todos os testes unitários:
```bash
npm run test
```

#### Executar testes específicos:

**Teste de Matérias-Primas:**
```bash
npm run test RawMaterials.test.tsx
```

**Teste de Produção:**
```bash
npm run test Production.test.tsx
```

**Teste de Produtos:**
```bash
npm run test Products.test.tsx
```

**Teste de Relação Produto-Matéria-Prima:**
```bash
npm run test ProductRawMaterials.test.tsx
```

### Testes E2E (Cypress)

O projeto utiliza **Cypress** para testes end-to-end.

#### Abrir interface do Cypress:
```bash
npm run cypress:open
```

Após abrir a interface, você pode executar os seguintes testes:

- `Production.cy.js` - Testes do módulo de Produção
- `ProductRawMaterials.cy.js` - Testes de Relação Produto-Matéria-Prima
- `Products.cy.js` - Testes do módulo de Produtos
- `RawMaterials.cy.js` - Testes do módulo de Matérias-Primas

#### Executar testes Cypress em modo headless:
```bash
npm run cypress:run
```

## 🔗 Configuração da API

O frontend se comunica com a API backend através do Axios. 

**URL da API:** `http://localhost:8080`

Certifique-se de que o backend está rodando antes de iniciar o frontend.

## 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run lint` | Executa o linter ESLint |
| `npm run test` | Executa todos os testes unitários |
| `npm run cypress:open` | Abre interface do Cypress |
| `npm run cypress:run` | Executa testes Cypress em modo headless |

## ✅ Checklist de Desenvolvimento

- [ ] Backend rodando em `localhost:8080`
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor de desenvolvimento iniciado (`npm run dev`)
- [ ] Testes unitários passando (`npm run test`)
- [ ] Testes E2E passando (`npm run cypress:run`)

## 📝 Notas

- Certifique-se de que a API backend está acessível antes de rodar o frontend
- Os testes E2E podem falhar se a API não estiver respondendo corretamente
- Para desenvolvimento, mantenha tanto o frontend quanto o backend rodando simultaneamente
