// cypress/e2e/products.cy.js
// Testes para o componente Products

describe('Products CRUD', () => {
  
  beforeEach(() => {
    // Visitar a página de produtos
    cy.visit('/products')
  })

  describe('Create Product', () => {
    
    it('should create a new product successfully', () => {
      // Preencher formulário
      cy.get('[data-cy="product-name-input"]').type('Test Product')
      cy.get('[data-cy="product-price-input"]').type('99.90')
      cy.get('[data-cy="product-quantity-input"]').type('10')
      
      // Submeter
      cy.get('[data-cy="submit-product-btn"]').click()
      
      // Verificar que foi criado
      cy.get('[data-cy="products-table"]').should('contain', 'Test Product')
      cy.get('[data-cy="products-table"]').should('contain', '$99.90')
      cy.get('[data-cy="products-table"]').should('contain', '10')
    })

    it('should validate required fields', () => {
      // Tentar submeter sem preencher
      cy.get('[data-cy="submit-product-btn"]').click()
      
      // HTML5 validation vai impedir o submit
      cy.get('[data-cy="product-name-input"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty
      })
    })

    it('should validate price as positive number', () => {
        cy.get('[data-cy="product-name-input"]').type('Test Product')
        cy.get('[data-cy="product-price-input"]').type('0')  // Zero é inválido
        cy.get('[data-cy="product-quantity-input"]').type('5')
        
        cy.get('[data-cy="submit-product-btn"]').click()
        
        cy.get('[data-cy="error-message"]').should('contain', 'Price must be a positive number')
    })

    it('should clear form after successful creation', () => {
      cy.get('[data-cy="product-name-input"]').type('Test Product')
      cy.get('[data-cy="product-price-input"]').type('99.90')
      cy.get('[data-cy="product-quantity-input"]').type('10')
      
      cy.get('[data-cy="submit-product-btn"]').click()
      
      // Aguardar um pouco para o form limpar
      cy.wait(500)
      
      // Verificar que form foi limpo
      cy.get('[data-cy="product-name-input"]').should('have.value', '')
      cy.get('[data-cy="product-price-input"]').should('have.value', '')
      cy.get('[data-cy="product-quantity-input"]').should('have.value', '')
    })
  })

  describe('Read Products', () => {
    
    it('should list all products', () => {
      // Criar alguns produtos via API primeiro
      cy.request('POST', 'http://localhost:8080/products', {
        name: 'Product 1',
        price: 100.00,
        quantity: 10
      })
      cy.request('POST', 'http://localhost:8080/products', {
        name: 'Product 2',
        price: 200.00,
        quantity: 20
      })
      
      cy.reload()
      
      cy.get('[data-cy="product-row"]').should('have.length.at.least', 2)
    })

    it('should display product details correctly', () => {
      cy.request('POST', 'http://localhost:8080/products', {
        name: 'Display Test',
        price: 123.45,
        quantity: 7
      })
      
      cy.reload()
      
      cy.get('[data-cy="product-row"]').last().within(() => {
        cy.get('[data-cy="product-name"]').should('contain', 'Display Test')
        cy.get('[data-cy="product-price"]').should('contain', '123.45')
        cy.get('[data-cy="product-quantity"]').should('contain', '7')
      })
    })

    it('should show empty state when no products', () => {
      // Assumindo que você tem um endpoint para limpar o banco
      // cy.request('POST', 'http://localhost:8080/api/test/reset')
      
      cy.reload()
      
      // Se não houver produtos, deve mostrar empty state
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="product-row"]').length === 0) {
          cy.get('[data-cy="empty-state"]').should('be.visible')
        }
      })
    })
  })

  describe('Update Product', () => {
    
    beforeEach(() => {
      // Criar produto para editar
      cy.request('POST', 'http://localhost:8080/products', {
        name: 'Original Name',
        price: 100.00,
        quantity: 5
      })
      cy.reload()
    })

    it('should update product name', () => {
      cy.get('[data-cy="edit-product-btn"]').last().click()
      
      cy.get('[data-cy="product-name-input"]').clear().type('Updated Name')
      cy.get('[data-cy="submit-product-btn"]').click()
      
      cy.wait(500)
      cy.get('[data-cy="products-table"]').should('contain', 'Updated Name')
    })

    it('should update product price', () => {
      cy.get('[data-cy="edit-product-btn"]').last().click()
      
      cy.get('[data-cy="product-price-input"]').clear().type('250.00')
      cy.get('[data-cy="submit-product-btn"]').click()
      
      cy.wait(500)
      cy.get('[data-cy="products-table"]').should('contain', '250.00')
    })

    it('should cancel update', () => {
      cy.get('[data-cy="edit-product-btn"]').last().click()
      
      cy.get('[data-cy="product-name-input"]').clear().type('Changed Name')
      cy.get('[data-cy="cancel-btn"]').click()
      
      // Verificar que manteve o nome original
      cy.get('[data-cy="products-table"]').should('contain', 'Original Name')
      cy.get('[data-cy="products-table"]').should('not.contain', 'Changed Name')
    })
  })

  describe('Delete Product', () => {
    
    beforeEach(() => {
      cy.request('POST', 'http://localhost:8080/products', {
        name: 'Product to Delete',
        price: 100.00,
        quantity: 5
      })
      cy.reload()
    })

    it('should delete product with confirmation', () => {
      // CONTAR LINHAS ANTES
      cy.get('[data-cy="product-row"]').its('length').then((countBefore) => {
        
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true)
        })
        
        // Interceptar requisições
        cy.intercept('DELETE', 'http://localhost:8080/products/*').as('deleteProduct')
        cy.intercept('GET', 'http://localhost:8080/products').as('getProducts')
        
        cy.get('[data-cy="delete-product-btn"]').last().click()
        
        // Esperar as requisições terminarem
        cy.wait('@deleteProduct')
        cy.wait('@getProducts')
        
        // VERIFICAR QUE TEM 1 LINHA A MENOS
        cy.get('[data-cy="product-row"]').should('have.length', countBefore - 1)
      })
    })

    it('should cancel deletion', () => {
      // CONTAR LINHAS ANTES
      cy.get('[data-cy="product-row"]').its('length').then((countBefore) => {
        
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(false)
        })
        
        cy.get('[data-cy="delete-product-btn"]').last().click()
        
        // VERIFICAR QUE MANTEVE A MESMA QUANTIDADE
        cy.get('[data-cy="product-row"]').should('have.length', countBefore)
      })
    })
  })

  describe('Responsiveness', () => {
    
    it('should be usable on mobile', () => {
      cy.viewport('iphone-6')
      
      cy.get('[data-cy="product-form"]').should('be.visible')
      cy.get('[data-cy="products-table"]').should('be.visible')
    })

    it('should be usable on tablet', () => {
      cy.viewport('ipad-2')
      
      cy.get('[data-cy="product-form"]').should('be.visible')
      cy.get('[data-cy="products-table"]').should('be.visible')
    })
  })
})