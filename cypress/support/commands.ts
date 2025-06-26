/// <reference types="cypress" />

// Add custom commands here
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom command types here
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
    }
  }
}

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/sign-in')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.visit('/dashboard')
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
})

// Export to make this a module
export {} 