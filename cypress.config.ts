import { defineConfig } from 'cypress'
import * as dotenv from 'dotenv'

// Carrega variáveis do arquivo .env
dotenv.config()

// Lê a URL do backend do arquivo .env
const API_URL = process.env.VITE_API_URL || 'http://localhost:8080';

export default defineConfig({
  e2e: {
    // URL base do seu front-end
    baseUrl: 'http://localhost:5173',
    
    // Configurações de viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeout padrão para comandos
    defaultCommandTimeout: 10000,
    
    // Timeout para requisições
    requestTimeout: 10000,
    
    // Desabilitar vídeos (mais rápido)
    video: false,
    
    // Screenshots apenas em falhas
    screenshotOnRunFailure: true,
    
    // Configuração de retry
    retries: {
      // Retry em modo CI
      runMode: 2,
      // Não retry em modo dev
      openMode: 0,
    },
    
    // Variáveis de ambiente
    env: {
      apiUrl: API_URL,
    },
    
    // Configuração de navegadores suportados
    setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
      // Implementar listeners de eventos aqui se necessário
      
      // Exemplo: Task para resetar banco de dados
      on('task', {
        log(message: string) {
          console.log(message)
          return null
        },
      })
      
      return config
    },
    
    // Especificar padrão de arquivos de teste
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Pastas de suporte
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
  },
})