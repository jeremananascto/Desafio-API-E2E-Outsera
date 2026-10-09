# language: pt
@e2e @login
Funcionalidade: Login na aplicação
  Como cliente da loja
  Quero me autenticar com meu usuário e senha
  Para acessar o catálogo de produtos

  Contexto:
    Dado que estou na página de login

  @smoke @positive
  Cenário: Login com credenciais válidas
    Quando faço login com usuário "standard_user" e senha "secret_sauce"
    Então devo ver a página de produtos
    E a URL deve conter "/inventory.html"

  @positive
  Cenário: Logout retorna para a tela de login
    Quando faço login com usuário "standard_user" e senha "secret_sauce"
    E faço logout
    Então devo permanecer na página de login

  @positive
  Cenário: Campo de senha oculta os caracteres digitados
    Quando digito "secret_sauce" no campo de senha
    Então o campo de senha deve estar mascarado

  @negative
  Esquema do Cenário: Login com credenciais inválidas
    Quando faço login com usuário "<usuario>" e senha "<senha>"
    Então devo ver a mensagem de erro de login "<mensagem>"
    E devo permanecer na página de login

    Exemplos: senha incorreta, usuário inexistente, usuário bloqueado e variações
      | usuario         | senha        | mensagem                                                                  |
      | standard_user   | senha_errada | Username and password do not match any user in this service               |
      | usuario_fantasma| secret_sauce | Username and password do not match any user in this service               |
      | STANDARD_USER   | secret_sauce | Username and password do not match any user in this service               |
      | standard_user   | SECRET_SAUCE | Username and password do not match any user in this service               |
      | locked_out_user | secret_sauce | Sorry, this user has been locked out.                                     |
      | ' OR '1'='1     | ' OR '1'='1  | Username and password do not match any user in this service               |

  @negative
  Esquema do Cenário: Campos obrigatórios em branco
    Quando faço login com usuário "<usuario>" e senha "<senha>"
    Então devo ver a mensagem de erro de login "<mensagem>"
    E devo permanecer na página de login

    Exemplos:
      | usuario       | senha        | mensagem             |
      |               |              | Username is required |
      |               | secret_sauce | Username is required |
      | standard_user |              | Password is required |

  @negative @security
  Esquema do Cenário: Páginas protegidas exigem autenticação
    Quando acesso diretamente o caminho "<caminho>" sem estar autenticado
    Então devo ver a mensagem de erro de login "You can only access '<caminho>' when you are logged in."
    E devo permanecer na página de login

    Exemplos:
      | caminho                |
      | /inventory.html        |
      | /cart.html             |
      | /checkout-step-one.html|
