const API_URL = Cypress.env('apiUrl');

describe('Product Raw Materials CRUD', () => {
  
  let testProductId;
  let testRawMaterialId;

  beforeEach(() => {
    // Visitar a página
    cy.visit('/product-raw-materials')
    
    // Criar produto de teste
    cy.request('POST', `${API_URL}/products`, {
      name: 'Test Product',
      price: 100.00,
      quantity: 10
    }).then((response) => {
      testProductId = response.body.id;
    })
    
    // Criar matéria-prima de teste
    cy.request('POST', `${API_URL}/raw-materials`, {
      name: 'Test Material',
      stockQuantity: 50
    }).then((response) => {
      testRawMaterialId = response.body.id;
    })
    
    cy.wait(500)
    cy.reload()
  })

  // CREATE
  it('should create a new association', () => {
    // Limpar todas associações antigas primeiro
    cy.request('GET', `${API_URL}/product-materials`).then((response) => {
      response.body.forEach((assoc) => {
        cy.request('DELETE', `${API_URL}/product-materials/${assoc.id}`)
      })
    })
    
    cy.wait(300)
    cy.reload()
    
    cy.get('[data-cy="product-select"]').select(testProductId.toString())
    cy.get('[data-cy="raw-material-select"]').select(testRawMaterialId.toString())
    cy.get('[data-cy="quantity-input"]').type('5')
    
    cy.get('[data-cy="submit-association-btn"]').click()
    
    cy.wait(500)
    
    cy.get('[data-cy="association-row"]').should('have.length', 1)
    cy.get('[data-cy="association-row"]').should('contain', 'Test Product')
    cy.get('[data-cy="association-row"]').should('contain', 'Test Material')
    cy.get('[data-cy="association-row"]').should('contain', '5')
  })

  // UPDATE
  it('should edit an association', () => {
    // Limpar todas associações antigas primeiro
    cy.request('GET', `${API_URL}/product-materials`).then((response) => {
      response.body.forEach((assoc) => {
        cy.request('DELETE', `${API_URL}/product-materials/${assoc.id}`)
      })
    })
    
    // Criar associação nova
    cy.request('POST', `${API_URL}/product-materials`, {
      productId: testProductId,
      rawMaterialId: testRawMaterialId,
      quantityRequired: 5
    })
    cy.wait(500)
    cy.reload()

    // Verificar que existe apenas 1 associação
    cy.get('[data-cy="association-row"]').should('have.length', 1)
    
    // Editar
    cy.get('[data-cy="edit-association-btn"]').click()
    
    cy.get('[data-cy="quantity-input"]').should('have.value', '5')
    cy.get('[data-cy="quantity-input"]').clear().type('15')
    cy.get('[data-cy="submit-association-btn"]').click()
    
    cy.wait(500)
    cy.get('[data-cy="association-quantity"]').should('contain', '15')
  })

  // CANCEL EDIT
  it('should cancel edit', () => {
    // Limpar todas associações antigas primeiro
    cy.request('GET', `${API_URL}/product-materials`).then((response) => {
      response.body.forEach((assoc) => {
        cy.request('DELETE', `${API_URL}/product-materials/${assoc.id}`)
      })
    })
    
    // Criar associação nova
    cy.request('POST', `${API_URL}/product-materials`, {
      productId: testProductId,
      rawMaterialId: testRawMaterialId,
      quantityRequired: 5
    })
    cy.wait(500)
    cy.reload()

    // Verificar que existe apenas 1 associação
    cy.get('[data-cy="association-row"]').should('have.length', 1)
    
    // Tentar editar e cancelar
    cy.get('[data-cy="edit-association-btn"]').click()
    cy.get('[data-cy="quantity-input"]').clear().type('20')
    cy.get('[data-cy="cancel-btn"]').click()
    
    // Verificar que não mudou
    cy.get('[data-cy="quantity-input"]').should('have.value', '')
    cy.get('[data-cy="association-quantity"]').should('contain', '5')
  })

  // DELETE
  it('should delete an association', () => {
    // Limpar todas associações antigas primeiro
    cy.request('GET', `${API_URL}/product-materials`).then((response) => {
      response.body.forEach((assoc) => {
        cy.request('DELETE', `${API_URL}/product-materials/${assoc.id}`)
      })
    })
    
    // Criar associação nova
    cy.request('POST', `${API_URL}/product-materials`, {
      productId: testProductId,
      rawMaterialId: testRawMaterialId,
      quantityRequired: 7
    })
    cy.wait(500)
    cy.reload()

    // Confirmar que tem 1 associação
    cy.get('[data-cy="association-row"]').should('have.length', 1)
    
    // Confirmar exclusão
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true)
    })
    
    cy.get('[data-cy="delete-association-btn"]').click()
    
    cy.wait(500)
    
    // Verificar que foi deletada (deve mostrar empty state ou ter 0 rows)
    cy.get('[data-cy="association-row"]').should('have.length', 0)
  })

  // CANCEL DELETE
  it('should cancel delete', () => {
    // Limpar todas associações antigas primeiro
    cy.request('GET', `${API_URL}/product-materials`).then((response) => {
      response.body.forEach((assoc) => {
        cy.request('DELETE', `${API_URL}/product-materials/${assoc.id}`)
      })
    })
    
    // Criar associação nova
    cy.request('POST', `${API_URL}/product-materials`, {
      productId: testProductId,
      rawMaterialId: testRawMaterialId,
      quantityRequired: 7
    })
    cy.wait(500)
    cy.reload()

    // Confirmar que tem 1 associação
    cy.get('[data-cy="association-row"]').should('have.length', 1)
    
    // Cancelar exclusão
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false)
    })
    
    cy.get('[data-cy="delete-association-btn"]').click()
    
    // Verificar que ainda tem 1 associação
    cy.get('[data-cy="association-row"]').should('have.length', 1)
  })
})