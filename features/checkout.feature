# language: pt
@e2e @checkout
Funcionalidade: Checkout de compra
  Como cliente autenticado
  Quero finalizar a compra dos produtos do carrinho
  Para receber meu pedido

  Contexto:
    Dado que estou logado como "standard_user"

  @smoke @positive
  Cenário: Compra completa de um produto com dados válidos
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E abro o carrinho
    E inicio o checkout
    E preencho os dados de entrega válidos
    E continuo o checkout
    Então devo ver a página "Checkout: Overview"
    E o subtotal deve ser a soma dos preços dos produtos
    Quando finalizo a compra
    Então devo ver a confirmação "Thank you for your order!"

  @positive
  Cenário: Compra com múltiplos produtos
    Quando adiciono os seguintes produtos ao carrinho:
      | Sauce Labs Backpack      |
      | Sauce Labs Bike Light    |
      | Sauce Labs Bolt T-Shirt  |
    E abro o carrinho
    Então o carrinho deve conter 3 produtos
    Quando inicio o checkout
    E preencho os dados de entrega válidos
    E continuo o checkout
    Então o subtotal deve ser a soma dos preços dos produtos
    Quando finalizo a compra
    Então devo ver a confirmação "Thank you for your order!"

  @positive
  Cenário: Remover produto do carrinho
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E adiciono "Sauce Labs Onesie" ao carrinho
    E abro o carrinho
    E removo "Sauce Labs Backpack" do carrinho
    Então o carrinho deve conter 1 produto
    E o carrinho não deve listar "Sauce Labs Backpack"

  @positive
  Cenário: Cancelar o checkout retorna ao carrinho
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E abro o carrinho
    E inicio o checkout
    E cancelo o checkout
    Então a URL deve conter "/cart.html"
    E o carrinho deve conter 1 produto

  @negative
  Esquema do Cenário: Dados de entrega incompletos impedem o avanço
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E abro o carrinho
    E inicio o checkout
    E preencho os dados de entrega com nome "<nome>", sobrenome "<sobrenome>" e CEP "<cep>"
    E continuo o checkout
    Então devo ver a mensagem de erro de checkout "<mensagem>"
    E a URL deve conter "/checkout-step-one.html"

    Exemplos:
      | nome  | sobrenome | cep       | mensagem                  |
      |       | Silva     | 06700-000 | First Name is required    |
      | Maria |           | 06700-000 | Last Name is required     |
      | Maria | Silva     |           | Postal Code is required   |
      |       |           |           | First Name is required    |
