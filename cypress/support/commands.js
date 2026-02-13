// cypress/support/commands.js
// ***********************************************
// Custom commands for your inventory project
// ***********************************************

// Comando para criar produto via API (mais rápido que pela UI)
Cypress.Commands.add('createProduct', (name, price, quantity) => {
  return cy.request('POST', `${Cypress.env('apiUrl')}/products`, {
    name: name,
    price: price,
    quantity: quantity
  })
})

// Comando para criar matéria-prima via API
Cypress.Commands.add('createRawMaterial', (name, stockQuantity) => {
  return cy.request('POST', `${Cypress.env('apiUrl')}/raw-materials`, {
    name: name,
    stockQuantity: stockQuantity
  })
})

// Comando para associar matéria-prima ao produto
Cypress.Commands.add('createAssociation', (productId, rawMaterialId, quantityRequired) => {
  return cy.request('POST', `${Cypress.env('apiUrl')}/product-materials`, {
    productId: productId,
    rawMaterialId: rawMaterialId,
    quantityRequired: quantityRequired
  })
})

// Comando para limpar dados (se você tiver endpoint de reset)
Cypress.Commands.add('resetDatabase', () => {
  return cy.request('POST', `${Cypress.env('apiUrl')}/test/reset`)
})

// Comando para esperar loading desaparecer
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-cy="loading"]').should('not.exist')
})

// Comando para confirmar modal de exclusão
Cypress.Commands.add('confirmDelete', () => {
  cy.window().then((win) => {
    cy.stub(win, 'confirm').returns(true)
  })
})

// Comando para cancelar modal de exclusão
Cypress.Commands.add('cancelDelete', () => {
  cy.window().then((win) => {
    cy.stub(win, 'confirm').returns(false)
  })
})

// Evitar que testes falhem por erros não capturados
Cypress.on('uncaught:exception', (err, runnable) => {
  // Retornar false aqui previne que o Cypress falhe o teste
  // Você pode adicionar lógica para ignorar apenas erros específicos
  return false
})