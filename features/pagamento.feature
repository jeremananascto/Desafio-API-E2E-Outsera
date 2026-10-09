# language: pt
@e2e @pagamento
Funcionalidade: Pagamento com cartão
  Como cliente
  Quero informar os dados do meu cartão
  Para concluir o pagamento do pedido

  Contexto:
    Dado que estou na página de pagamento

  @smoke @positive
  Cenário: Pagamento aprovado com cartão válido
    Quando preencho o cartão com nome "MARIA SILVA", número "4111111111111111", validade "12/35" e CVV "123"
    E confirmo o pagamento
    Então o pagamento deve ser aprovado

  @positive
  Esquema do Cenário: Pagamento aprovado para diferentes bandeiras e formatos
    Quando preencho o cartão com nome "MARIA SILVA", número "<numero>", validade "12/35" e CVV "<cvv>"
    E confirmo o pagamento
    Então o pagamento deve ser aprovado

    Exemplos:
      | bandeira   | numero              | cvv  |
      | Visa       | 4111111111111111    | 123  |
      | Visa espaço| 4111 1111 1111 1111 | 123  |
      | Mastercard | 5555555555554444    | 123  |
      | Amex       | 378282246310005     | 1234 |

  @negative
  Esquema do Cenário: Dados de cartão inválidos são rejeitados
    Quando preencho o cartão com nome "<nome>", número "<numero>", validade "<validade>" e CVV "<cvv>"
    E confirmo o pagamento
    Então devo ver o erro "<mensagem>" no campo "<campo>"
    E o pagamento não deve ser aprovado

    Exemplos: número do cartão
      | nome        | numero           | validade | cvv | campo  | mensagem                         |
      | MARIA SILVA | 1234567890123456 | 12/35    | 123 | numero | Número do cartão inválido        |
      | MARIA SILVA | 4111             | 12/35    | 123 | numero | Número do cartão inválido        |
      | MARIA SILVA | abcd1234abcd1234 | 12/35    | 123 | numero | Número do cartão inválido        |
      | MARIA SILVA |                  | 12/35    | 123 | numero | Número do cartão é obrigatório   |

    Exemplos: validade
      | nome        | numero           | validade | cvv | campo    | mensagem               |
      | MARIA SILVA | 4111111111111111 | 01/20    | 123 | validade | Cartão expirado        |
      | MARIA SILVA | 4111111111111111 | 13/30    | 123 | validade | Validade inválida      |
      | MARIA SILVA | 4111111111111111 | 1230     | 123 | validade | Validade inválida      |
      | MARIA SILVA | 4111111111111111 |          | 123 | validade | Validade é obrigatória |

    Exemplos: CVV e nome
      | nome        | numero           | validade | cvv | campo | mensagem                      |
      | MARIA SILVA | 4111111111111111 | 12/35    | 12  | cvv   | CVV inválido                  |
      | MARIA SILVA | 4111111111111111 | 12/35    | abc | cvv   | CVV inválido                  |
      | MARIA SILVA | 4111111111111111 | 12/35    |     | cvv   | CVV é obrigatório             |
      |             | 4111111111111111 | 12/35    | 123 | nome  | Nome no cartão é obrigatório  |

  @negative
  Cenário: Formulário totalmente em branco exibe erro em todos os campos
    Quando confirmo o pagamento
    Então devo ver erros em todos os campos obrigatórios
    E o pagamento não deve ser aprovado
