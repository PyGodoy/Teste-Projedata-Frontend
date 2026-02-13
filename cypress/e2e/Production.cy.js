// cypress/e2e/production.cy.js
// Testes básicos para o componente Production

describe('Production Component', () => {
  
  let testProductId;
  let testRawMaterialId;

  beforeEach(() => {
    // Visitar a página de produção
    cy.visit('/production')
  })

  // TESTE 1: Verificar que a página carrega
  it('should load the production page', () => {
    cy.get('[data-cy="production-container"]').should('be.visible')
    cy.contains('Production Suggestion').should('be.visible')
    cy.get('[data-cy="refresh-btn"]').should('be.visible')
  })

  // TESTE 2: Mostrar empty state quando não há produtos
  it('should show empty state when no products can be produced', () => {
    // Limpar todos os dados
    cy.request('GET', 'http://localhost:8080/product-materials').then((response) => {
      response.body.forEach((assoc) => {
        cy.request('DELETE', `http://localhost:8080/product-materials/${assoc.id}`)
      })
    })
    
    cy.wait(300)
    cy.reload()
    cy.wait(500)
    
    cy.get('[data-cy="empty-state"]').should('be.visible')
    cy.get('[data-cy="empty-state"]').should('contain', 'No products can be produced')
  })

  // TESTE 3: Mostrar produtos quando existem dados
  it('should display production data when products can be produced', () => {
    // Criar produto
    cy.request('POST', 'http://localhost:8080/products', {
      name: 'Test Product',
      price: 100.00,
      quantity: 10
    }).then((response) => {
      testProductId = response.body.id;
    })
    
    // Criar matéria-prima
    cy.request('POST', 'http://localhost:8080/raw-materials', {
      name: 'Test Material',
      stockQuantity: 50
    }).then((response) => {
      testRawMaterialId = response.body.id;
    })
    
    // Criar associação
    cy.then(() => {
      cy.request('POST', 'http://localhost:8080/product-materials', {
        productId: testProductId,
        rawMaterialId: testRawMaterialId,
        quantityRequired: 2
      })
    })
    
    cy.wait(500)
    cy.reload()
    cy.wait(500)
    
    // Verificar que a tabela aparece
    cy.get('[data-cy="production-table"]').should('be.visible')
    cy.get('[data-cy="production-row"]').should('have.length.at.least', 1)
    cy.get('[data-cy="total-value"]').should('be.visible')
  })

  // TESTE 4: Verificar estrutura da tabela
  it('should display table headers correctly', () => {
    cy.get('[data-cy="production-table"]').should('exist')
    cy.get('[data-cy="production-table"]').within(() => {
      cy.contains('Product').should('exist')
      cy.contains('Quantity').should('exist')
      cy.contains('Price per unit').should('exist')
    })
  })

  // TESTE 5: Botão de refresh funciona
  it('should refresh data when refresh button is clicked', () => {
    cy.intercept('GET', 'http://localhost:8080/production').as('getProduction')
    
    cy.get('[data-cy="refresh-btn"]').first().click()
    
    cy.wait('@getProduction')
  })

  // TESTE 6: Verificar formato do preço
  it('should display prices in correct format', () => {
    // Criar dados de teste primeiro
    cy.request('POST', 'http://localhost:8080/products', {
      name: 'Price Test Product',
      price: 123.45,
      quantity: 10
    }).then((response) => {
      testProductId = response.body.id;
    })
    
    cy.request('POST', 'http://localhost:8080/raw-materials', {
      name: 'Price Test Material',
      stockQuantity: 100
    }).then((response) => {
      testRawMaterialId = response.body.id;
    })
    
    cy.then(() => {
      cy.request('POST', 'http://localhost:8080/product-materials', {
        productId: testProductId,
        rawMaterialId: testRawMaterialId,
        quantityRequired: 1
      })
    })
    
    cy.wait(500)
    cy.reload()
    cy.wait(500)
    
    // Verificar que os preços começam com $ e contêm números
    cy.get('[data-cy="product-price"]').first().should('contain', '$')
    cy.get('[data-cy="product-price"]').first().invoke('text').should('include', '.')
  })

  // TESTE 7: Verificar que o total value é exibido
  it('should calculate and display total value', () => {
    // Criar dados de teste
    cy.request('POST', 'http://localhost:8080/products', {
      name: 'Value Test Product',
      price: 50.00,
      quantity: 10
    }).then((response) => {
      testProductId = response.body.id;
    })
    
    cy.request('POST', 'http://localhost:8080/raw-materials', {
      name: 'Value Test Material',
      stockQuantity: 100
    }).then((response) => {
      testRawMaterialId = response.body.id;
    })
    
    cy.then(() => {
      cy.request('POST', 'http://localhost:8080/product-materials', {
        productId: testProductId,
        rawMaterialId: testRawMaterialId,
        quantityRequired: 1
      })
    })
    
    cy.wait(500)
    cy.reload()
    cy.wait(500)
    
    cy.get('[data-cy="total-value"]').should('be.visible')
    cy.get('[data-cy="total-value"]').should('contain', 'Total Value:')
    cy.get('[data-cy="total-value"]').should('contain', '$')
  })
})