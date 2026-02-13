// cypress/e2e/raw-materials.cy.js
// Testes para o componente RawMaterials

describe('Raw Materials CRUD', () => {
  
  beforeEach(() => {
    cy.visit('/raw-materials')
  })

  describe('Create Raw Material', () => {
    
    it('should create a new raw material successfully', () => {
      cy.get('[data-cy="raw-material-name-input"]').type('Steel')
      cy.get('[data-cy="raw-material-quantity-input"]').type('100')
      
      cy.get('[data-cy="submit-raw-material-btn"]').click()
      
      cy.wait(500)
      cy.get('[data-cy="raw-materials-list"]').should('contain', 'Steel')
      cy.get('[data-cy="raw-materials-list"]').should('contain', '100')
    })

    it('should validate required fields', () => {
      cy.get('[data-cy="submit-raw-material-btn"]').click()
      
      cy.get('[data-cy="raw-material-name-input"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty
      })
    })

    it('should validate empty quantity field', () => {
        cy.get('[data-cy="raw-material-name-input"]').type('Test Material')
        
        // ← ADICIONEI ESTA LINHA
        cy.get('[data-cy="raw-material-quantity-input"]').invoke('removeAttr', 'required')
        
        cy.get('[data-cy="submit-raw-material-btn"]').click()
        
        cy.get('[data-cy="error-message"]').should('contain', 'Please fill all fields')
    })

    it('should clear form after successful creation', () => {
      cy.get('[data-cy="raw-material-name-input"]').type('Test Material')
      cy.get('[data-cy="raw-material-quantity-input"]').type('50')
      
      cy.get('[data-cy="submit-raw-material-btn"]').click()
      
      cy.wait(500)
      cy.get('[data-cy="raw-material-name-input"]').should('have.value', '')
      cy.get('[data-cy="raw-material-quantity-input"]').should('have.value', '')
    })
  })

  describe('Read Raw Materials', () => {
    
    it('should list all raw materials', () => {
      cy.request('POST', 'http://localhost:8080/raw-materials', {
        name: 'Wood',
        stockQuantity: 75
      })
      cy.request('POST', 'http://localhost:8080/raw-materials', {
        name: 'Plastic',
        stockQuantity: 50
      })
      
      cy.reload()
      
      cy.get('[data-cy="raw-material-row"]').should('have.length.at.least', 2)
    })

    it('should display raw material details correctly', () => {
      cy.request('POST', 'http://localhost:8080/raw-materials', {
        name: 'Aluminum',
        stockQuantity: 200
      })
      
      cy.reload()
      
      cy.get('[data-cy="raw-material-row"]').last().within(() => {
        cy.get('[data-cy="raw-material-name"]').should('contain', 'Aluminum')
        cy.get('[data-cy="raw-material-stock"]').should('contain', '200')
      })
    })

    it('should show empty state when no materials', () => {
      cy.reload()
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="raw-material-row"]').length === 0) {
          cy.get('[data-cy="empty-state"]').should('be.visible')
          cy.get('[data-cy="empty-state"]').should('contain', 'No raw materials found')
        }
      })
    })
  })

  describe('Update Raw Material', () => {
    
    beforeEach(() => {
      cy.request('POST', 'http://localhost:8080/raw-materials', {
        name: 'Original Material',
        stockQuantity: 100
      })
      cy.reload()
    })

    it('should update material name', () => {
      cy.get('[data-cy="edit-raw-material-btn"]').last().click()
      
      cy.get('[data-cy="raw-material-name-input"]').clear().type('Updated Material')
      cy.get('[data-cy="submit-raw-material-btn"]').click()
      
      cy.wait(500)
      cy.get('[data-cy="raw-materials-list"]').should('contain', 'Updated Material')
    })

    it('should update stock quantity', () => {
      cy.get('[data-cy="edit-raw-material-btn"]').last().click()
      
      cy.get('[data-cy="raw-material-quantity-input"]').clear().type('500')
      cy.get('[data-cy="submit-raw-material-btn"]').click()
      
      cy.wait(500)
      cy.get('[data-cy="raw-materials-list"]').should('contain', '500')
    })

    it('should cancel update', () => {
      cy.get('[data-cy="edit-raw-material-btn"]').last().click()
      
      cy.get('[data-cy="raw-material-name-input"]').clear().type('Changed Name')
      cy.get('[data-cy="cancel-btn"]').click()
      
      cy.get('[data-cy="raw-materials-list"]').should('contain', 'Original Material')
      cy.get('[data-cy="raw-materials-list"]').should('not.contain', 'Changed Name')
    })
  })

  describe('Delete Raw Material', () => {
    
    beforeEach(() => {
        cy.request('POST', 'http://localhost:8080/raw-materials', {
            name: 'Material to Delete',
            stockQuantity: 100
        })

        cy.intercept('GET', 'http://localhost:8080/raw-materials').as('getMaterials')
        cy.reload()
        cy.wait('@getMaterials')
    })

    it('should delete material with confirmation', () => {
      // Contar linhas antes
      cy.get('[data-cy="raw-material-row"]').its('length').then((countBefore) => {
        
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true)
        })
        
        // Interceptar requisições
        cy.intercept('DELETE', 'http://localhost:8080/raw-materials/*').as('deleteMaterial')
        cy.intercept('GET', 'http://localhost:8080/raw-materials').as('getMaterials')
        
        cy.get('[data-cy="delete-raw-material-btn"]').last().click()
        
        // Esperar requisições terminarem
        cy.wait('@deleteMaterial')
        cy.wait('@getMaterials')
        
        // Verificar que tem 1 linha a menos
        cy.get('[data-cy="raw-material-row"]').should('have.length', countBefore - 1)
      })
    })

    it('should cancel deletion', () => {
      // Contar linhas antes
      cy.get('[data-cy="raw-material-row"]').its('length').then((countBefore) => {
        
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(false)
        })
        
        cy.get('[data-cy="delete-raw-material-btn"]').last().click()
        
        // Verificar que manteve a mesma quantidade
        cy.get('[data-cy="raw-material-row"]').should('have.length', countBefore)
      })
    })
  })

  describe('Responsiveness', () => {
    
    it('should be usable on mobile', () => {
      cy.viewport('iphone-6')
      
      cy.get('[data-cy="raw-material-form"]').should('be.visible')
      cy.get('[data-cy="raw-materials-list"]').should('be.visible')
    })

    it('should be usable on tablet', () => {
      cy.viewport('ipad-2')
      
      cy.get('[data-cy="raw-material-form"]').should('be.visible')
      cy.get('[data-cy="raw-materials-list"]').should('be.visible')
    })
  })
})