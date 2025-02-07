/* eslint-disable no-undef */
describe('Login process', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit(
            'http://localhost:9090/semoss-ui/packages/client/dist/#/login',
        );

        cy.contains('Username');

        cy.get('#mui-1').type(`${Cypress.env('user')}`);

        cy.get('#mui-2').type(`${Cypress.env('pass')}`);

        cy.get('.MuiButton-contained').parent().click();
        cy.get('[data-testid="CloseIcon"]').click();
    });
    it('can open function catalog', () => {
        cy.get('[data-testid="Storage-icon"]').click();
        cy.contains('Storage Catalog').should('exist');
    });
});
