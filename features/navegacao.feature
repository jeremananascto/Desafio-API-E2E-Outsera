# language: pt
@e2e @navegacao
Funcionalidade: Navegação pela loja
  Como cliente autenticado
  Quero navegar pelo catálogo, carrinho e formulário de checkout
  Para iniciar uma compra

  Contexto:
    Dado que estou logado como "standard_user"

  @smoke @positive
  Cenário: Navegar do catálogo até o formulário de dados de entrega
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E abro o carrinho
    E inicio o checkout
    Então devo ver a página "Checkout: Your Information"
    E a URL deve conter "/checkout-step-one.html"

  @positive
  Cenário: Catálogo exibe todos os produtos
    Então devo ver 6 produtos no catálogo

  @positive
  Cenário: Contador do carrinho acompanha os produtos adicionados
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E adiciono "Sauce Labs Bike Light" ao carrinho
    Então o contador do carrinho deve exibir 2

  @positive
  Cenário: Continuar comprando retorna ao catálogo mantendo o carrinho
    Quando adiciono "Sauce Labs Backpack" ao carrinho
    E abro o carrinho
    E volto para o catálogo
    Então devo ver a página de produtos
    E o contador do carrinho deve exibir 1

  @positive
  Esquema do Cenário: Ordenação do catálogo
    Quando ordeno os produtos por "<ordenacao>"
    Então os produtos devem estar ordenados por "<ordenacao>"

    Exemplos:
      | ordenacao         |
      | Name (A to Z)     |
      | Name (Z to A)     |
      | Price (low to high) |
      | Price (high to low) |
