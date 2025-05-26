# 3. DOCUMENTO DE ESPECIFICAÇÃO DE REQUISITOS DE SOFTWARE

## 3.1 Objetivos deste documento
Descrever e especificar as necessidades dos viajantes brasileiros que devem ser atendidas pelo projeto Viajey.

## 3.2 Escopo do produto

### 3.2.1 Nome do produto e seus componentes principais
O produto será uma plataforma de planejamento de viagens denominada Viajey. Ele será composto por sete componentes (módulos) com os devidos elementos necessários à gestão de viagens.

### 3.2.2 Missão do produto
Auxiliar no planejamento e organização de viagens de modo abrangente, desde a escolha dos locais e atrações turísticas até a organização pessoal do viajante. 

### 3.2.3 Limites do produto
O Viajey não fornece nenhuma forma de reserva de acomodações ou atrações em geral, bem como não informa questões jurídicas acerca de nenhum destino, como obtenção de visto para viagem, vacinas necessárias e demais assuntos legais, sendo necessário realizar buscas externas.

### 3.2.4 Benefícios do produto

| # | Benefício | Valor para o Cliente |
|--------------------|------------------------------------|----------------------------------------|
|1	| Facilidade na criação de itinerário para viagem |	Essencial |
|2 | Melhora da organização pessoal com o checklist de viagem | Essencial |
|3	| Facilidade na escolha de locais e atrações com as recomendações categorizadas e filtros	| Essencial | 
|4 | Facilidade na criação de roteiro para viagens em grupo com as opções de compartilhamento | Recomendável | 
|5	| Melhora na organização financeira ao apresentar o cálculo do gasto total planejado para a viagem	| Recomendável | 

## 3.3 Descrição geral do produto

### 3.3.1 Requisitos Funcionais

| Código | Requisito Funcional (Funcionalidade) | Descrição |
|--------|--------------------------------------|-----------|
| RF1    | Gerenciar conta                     | Processamento de inclusão, alteração e remoção de conta na plataforma. |
| RF2    | Fazer login na plataforma           | Processamento de autenticação de usuários, incluindo entrada de credenciais e validação. |
| RF3    | Fazer logout na plataforma          | Permite que o usuário saia da sua conta cadastrada na plataforma. |
| RF4    | Recuperar senha                     | Permite que o usuário redefina a sua senha por meio de seu e-mail cadastrado na plataforma. |
| RF5    | Realizar buscas por palavra chave   | Campo de busca para facilitar a localização de destinos, recomendações e roteiros. |
| RF6    | Gerenciar itinerário                | Permite que o usuário crie, edite e exclua seus roteiros de viagem personalizados. |
| RF7    | Gerenciar checklist de itens para viagem | Processamento de inclusão, alteração e remoção de lista de itens essenciais para a viagem. |
| RF8    | Utilizar mapa interativo            | Exibição de atrações turísticas em mapa interativo para facilitar a visualização das rotas. |
| RF9    | Aplicar filtros de pesquisa         | Disponibiliza opções de filtragem para melhor organização e busca de informações. |
| RF10   | Compartilhar itinerário             | Permite que o usuário compartilhe itinerários criados. |
| RF11   | Gerenciar favoritos                 | Processamento de inclusão, alteração e remoção de preferências. |
| RF12   | Gerenciar conteúdo                  | Permite que o usuário acesse dicas de viagem disponibilizadas pela plataforma. |
| RF13   | Gerenciar roteiros recomendados por IA | Permite que o usuário salve, altere e exclua roteiros recomendados por IA. |
| RF14   | Gerenciar avaliações                | Processamento de inclusão, alteração e remoção de avaliações. |
| RF15   | Gerenciar anúncios                  | Permite que o parceiro inclua, edite e exclua anúncios de seus serviços. |
| RF16   | Consultar conteúdos                 | Permite que o usuário consulte os conteúdos disponibilizados na plataforma. |
| RF17   | Consultar anúncios                  | Permite que o usuário consulte os anúncios disponibilizados na plataforma. |
| RF18   | Aprovar anúncios                    | Permite que o administrador aprove os anúncios publicados pelos parceiros. |


### 3.3.2 Requisitos Não Funcionais

| Código | Requisito Não Funcional (Restrição) | Descrição |
|--------|--------------------------------------|-----------|
| RNF1   | Ambiente                             | O sistema deve ser compatível com o Google Chrome, garantindo uma experiência consistente. |
| RNF2   | Desenvolvimento                      | As tecnologias fundamentais para o sistema são HTML, CSS e Javascript. |
| RNF3   | Segurança                            | O sistema deve restringir o acesso por meio de senhas individuais para cada usuário. |
| RNF4   | Usabilidade                          | A interface do usuário deve ser intuitiva e fácil de usar, com um design limpo e organizado. |
| RNF5   | Acessibilidade                       | O sistema deve ser acessível a usuários com deficiência, seguindo as diretrizes de acessibilidade da Web (WCAG). |
| RNF6   | Manutenibilidade                     | O código do sistema deve ser modular e bem documentado, facilitando a manutenção e futuras atualizações. |
| RNF7   | Conformidade                         | O sistema deve estar de acordo com as leis e regulamentos de proteção de dados relevantes, como a LGPD no Brasil e a GDPR na União Europeia. |

### 3.3.3 Usuários 

| Ator | Descrição |
|--------------------|------------------------------------|
| Viajante |	Usuário com permissão para criar seus roteiros, editá-los, excluí-los, compartilhá-los, favoritar e avaliar itens (atrações, passeios, etc), bem como criar seus próprios checklists de viagem. |
| Parceiro |	Usuário com permissão para criar, editar e excluir seus anúncios. |
| Administrador |	Usuário com permissão total ao sistema, mas com funcionalidades exclusivas de aprovação ou rejeição de anúncio e gerenciamento de conteúdos. |

## 3.4 Modelagem do Sistema

### 3.4.1 Diagrama de Casos de Uso

Como observado no diagrama de casos de uso da Figura 1, o usuário viajante terá acesso à criação de conta na plataforma e o gerenciamento da mesma, funções básicas do sistema como login, logout e recuperação de senha, gerenciamento de itinerários (sejam eles personalizados de forma manual ou com auxílio de IA), checklists, itens favoritados, avaliações realizadas, consultar anúncios e conteúdos publicados no sistema, utilizar funcionalidades como mapa interativo, filtros e barra de pesquisa por palavra-chave, bem como compartilhar itinerários criados. Já o usuário parceiro, terá acesso à todas as funções básicas do sistema relacionados à gerenciamento de conta, login, logout e recuperação de senha, porém sem acesso às demais funcionalidades e com uma função exclusiva de gerenciamento de anúncios. Por fim, o usuário administrador terá acesso total ao sistema, exceto ao gerenciamento de anúncios, pois será responsável por aprovar a publicação dos anúncios criados por usuários parceiros, além de realizar o gerenciamento do conteúdo disponível no sistema.

#### Figura 1: Diagrama de Casos de Uso do Sistema.

 ![Casos de Uso - Viajey (3)](https://github.com/user-attachments/assets/2d83f31d-b992-47a8-b096-16e2533b4da5)
 
### 3.4.2 Descrições de Casos de Uso

### Gerenciar Conta (CSU01)

**Sumário:** O viajante, parceiro ou administrador realiza a gestão (inclusão, remoção, alteração e consulta) dos dados de sua conta.

**Ator Primário:** Viajante / Parceiro / Administrador

**Pré-condições:** O usuário deve ter acesso ao Sistema e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa o Sistema;
2) O usuário realiza login no Sistema com seu e-mail e senha cadastrados; <br>
3) O usuário acessa a área “Meu Perfil” dentro do Sistema; <br>
4) O Sistema exibe as operações que podem ser realizadas: criação ou remoção de conta, consulta e alteração de dados; <br>
5) O usuário seleciona a operação desejada ou opta por finalizar o caso de uso ao sair da página “Meu Perfil”; <br>
6) Se o usuário desejar continuar com o gerenciamento de conta, o caso de uso termina com o salvamento dos dados; caso contrário o caso de uso finaliza. <br>

**Fluxo Alternativo (1):** Inclusão

a) O usuário seleciona a operação de criação de conta; <br>
b) O usuário seleciona o seu tipo de perfil (parceiro, viajante ou administrador); <br>
c) O Sistema solicita o preenchimento de dados como nome, sobrenome, celular, e-mail e senha; <br>
d) O usuário preenche os dados requisitados e confirma a criação da conta; <br>
e) O Sistema verifica se o usuário já está cadastrado. Se sim, o Sistema reporta o fato e volta ao início; caso contrário, valida as informações preenchidas e cria a conta; <br>
f) O Sistema exibe a tela de login para que o usuário acesse o Sistema. <br>

**Fluxo Alternativo (5):** Remoção

a) O usuário seleciona a operação de remoção de conta; <br>
b) O Sistema exibe uma mensagem para a confirmação da remoção de conta; <br>
c) O usuário confirma a remoção da conta; caso contrário, o usuário cancela a operação de remoção e o Sistema retorna à área “Meu Perfil”; <br>
d) Com a confirmação do usuário, o Sistema exclui a conta e exibe uma mensagem de confirmação de remoção. <br>

**Fluxo Alternativo (5):** Alteração

a) O usuário seleciona a operação de alteração de dados da conta; <br>
b) O Sistema exibe os campos editáveis (nome, sobrenome, celular e e-mail); <br>
c) O usuário modifica os campos desejados e confirma o salvamento das alterações dos dados; <br>
d) O Sistema valida as alterações e atualiza os dados da conta. Se os dados inseridos não forem válidos, o Sistema reporta o fato e volta à tela de alteração dos dados para o preenchimento correto do usuário; <br>
e) O Sistema exibe uma mensagem de confirmação da atualização dos dados. <br>
 
**Fluxo Alternativo (3):** Consulta

a) O usuário visualiza os dados da conta cadastrada no Sistema.

**Pós-condições:** Uma conta de usuário foi criada ou removida, seus dados foram alterados ou apresentados na tela.


### Fazer login na plataforma (CSU02)

**Sumário:** O viajante ou parceiro realiza o login no Sistema com suas credenciais de acesso.

**Ator Primário:** Viajante / Parceiro

**Pré-condições:** O usuário deve possuir uma conta criada no Sistema e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a página de login do Sistema; <br>
2) O Sistema exibe os campos para inserção das credenciais de acesso (e-mail e senha); <br>
3) O usuário realiza a inserção de seu e-mail e senha nos campos correspondentes; <br>
4) O Sistema valida as credenciais de acesso inseridas. Se os dados inseridos forem inválidos, o Sistema reporta o fato e volta ao início; caso contrário, autentica o usuário, o redireciona à página inicial do Sistema e o caso de uso termina. <br>

**Fluxo Alternativo (4):** Conta Inexistente

a) O Sistema identifica que o usuário não possui conta cadastrada; <br>
b) O Sistema reporta o fato e redireciona o usuário à página de criação de conta. <br>

**Pós-condições:** Um usuário foi autenticado no Sistema ou redirecionado à página de criação de conta.


### Fazer logout na plataforma (CSU03)

**Sumário:** O viajante ou parceiro realiza o logout no Sistema.

**Ator Primário:** Viajante / Parceiro

**Pré-condições:** O usuário deve possuir uma conta criada no Sistema, estar logado e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a área “Meu Perfil” no Sistema; <br>
2) O Sistema exibe as operações disponíveis (alteração de perfil, remoção, logout, etc); <br>
3) O usuário seleciona a opção de fazer logout”; <br>
4) O Sistema exibe uma mensagem para a confirmação do logout; <br>
5) O usuário confirma a ação de logout; caso contrário; o usuário cancela a operação de logout e o Sistema retorna à área “Meu Perfil”; <br>
6) Com a confirmação do usuário, o Sistema realiza o logout e redireciona o usuário à página de login. <br>

**Pós-condições:** Um usuário realizou logout na plataforma.


### Recuperar senha (CSU04)

**Sumário:** O viajante ou parceiro esquece/perde sua senha e precisa a recuperar para logar no Sistema.

**Ator Primário:** Viajante / Parceiro

**Pré-condições:** O usuário deve possuir uma conta criada no Sistema, ter acesso ao e-mail cadastrado no Sistema e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a página de login do Sistema; <br>
2) O Sistema exibe os campos para inserção das credenciais de acesso (e-mail e senha); <br>
3) O usuário realiza a inserção de seu e-mail e senha nos campos correspondentes; <br>
4) O Sistema valida as credenciais de acesso inseridas e retorna uma mensagem de dados inválidos; <br>
5) O usuário clica em “Esqueci minha senha”; <br>
6) O Sistema solicita a inserção do e-mail cadastrado na conta; <br>
7) O usuário insere seu e-mail; <br>
8) O Sistema valida o e-mail inserido e envia um e-mail com instruções para a recuperação da senha; <br>
9) O usuário acessa o e-mail e segue as instruções para redefinir sua senha; <br>
10) O usuário é direcionado à uma página para redefinição de senha, onde define uma nova senha; <br>
11) O Sistema realiza a atualização da senha da conta, exibe uma mensagem de confirmação e o caso de uso termina. <br>

**Fluxo Alternativo (8):** E-mail Não Encontrado

a) O Sistema verifica o e-mail inserido e retorna uma mensagem de e-mail não encontrado; <br>
b) O usuário realiza a inserção de um e-mail válido para dar continuidade ao caso de uso; caso contrário, o usuário entra em contato com o Suporte do Sistema e o caso de uso é finalizado. <br>

**Fluxo Alternativo (8):** Falha no Envio do E-mail

a) O Sistema realiza a tentativa de envio de e-mail; <br>
b) O Sistema reporta a falha no envio do e-mail; <br>
c) O usuário insere novamente o seu e-mail para o recebimento das instruções; <br>
d) O Sistema realiza o envio do e-mail para recuperação de senha e o usuário dá continuidade ao caso de uso; caso contrário, o usuário entra em contato com o Suporte do Sistema e o caso de uso é finalizado. <br>

**Pós-condições:** Um usuário atualizou sua senha para acesso ao Sistema ou um usuário não conseguiu realizar esta atualização e entrou em contato com o Suporte.


### Realizar buscas por palavra-chave (CSU05)

**Sumário:** O viajante quer localizar um destino, atração ou tópico específico no Sistema e utiliza o recurso da barra de pesquisa.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve possuir acesso ao Sistema e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a barra de pesquisa do Sistema; <br>
2) O usuário insere a palavra-chave que deseja buscar; <br>
3) O Sistema retorna os resultados da busca com destinos, roteiros ou tópicos relacionados; <br>
4) O usuário navega pelos resultados retornados; <br>
5) O usuário seleciona o resultado desejado e o caso de uso termina; caso contrário, o caso de uso é finalizado. <br>

**Fluxo Alternativo (3):** Nenhum Resultado Encontrado

a) O Sistema retorna o resultado da busca com uma mensagem de que não foi possível retornar resultados àquela busca e sugere palavras-chave alternativas ao usuário.

**Pós-condições:** Um usuário localizou o que buscava através da barra de pesquisa do Sistema ou recebeu sugestões de palavras-chave alternativas pois não foi possível retornar resultados ao que foi pesquisado.


### Gerenciar itinerário (CSU06)

**Sumário:** O viajante realiza a gestão (inclusão, remoção, alteração e consulta) de seus itinerários.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve possuir uma conta criada no Sistema, estar logado em sua conta e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a seção “Meus Itinerários” no Sistema; <br>
2) O Sistema exibe a lista de todos os itinerários deste usuário e as operações que podem ser realizadas: criação, alteração, consulta ou remoção de itinerário; <br>
3) O usuário seleciona a operação desejada ou opta por finalizar o caso de uso ao sair da seção “Meus Itinerários”; <br>
4) Se o usuário desejar continuar com o gerenciamento de itinerários, o caso de uso termina com o salvamento dos dados; caso contrário o caso de uso finaliza. <br>

**Fluxo Alternativo (2):** Inclusão

a) O usuário seleciona a operação de criação de itinerário; <br>
b) O Sistema solicita o preenchimento de dados como nome do itinerário, datas, destinos, valores, atividades e notas; <br>
c) O usuário preenche os dados requisitados e confirma a criação do itinerário; <br>
d) O Sistema verifica se os dados obrigatórios foram preenchidos. Se sim, o Sistema cria o itinerário e exibe a seção “Meus Itinerários” com o itinerário criado; caso contrário, o Sistema reporta o fato para que o usuário preencha os dados faltantes; <br>

**Fluxo Alternativo (2):** Remoção

a) O usuário acessa um itinerário específico e seleciona a operação de remoção; <br>
b) O Sistema exibe uma mensagem para a confirmação da remoção do itinerário; <br>
c) O usuário confirma a remoção do itinerário; caso contrário; o usuário cancela a operação de remoção e o Sistema retorna ao itinerário; <br>
d) Com a confirmação do usuário, o Sistema exclui o itinerário, exibe uma mensagem de confirmação de remoção e retorna à seção “Meus Itinerários”. <br>

**Fluxo Alternativo (2):** Alteração

a) O usuário acessa um itinerário específico e seleciona a operação de alteração de dados do itinerário; <br>
b) O Sistema exibe os campos editáveis (nome, datas, destinos, valores, atividades, notas…); <br>
c) O usuário modifica os campos desejados e confirma o salvamento das alterações realizadas; <br>
d) O Sistema valida as alterações e atualiza os dados do itinerário. Se os dados inseridos não forem válidos, o Sistema reporta o fato e volta à tela de alteração dos dados; <br>
e) O Sistema exibe uma mensagem de confirmação da atualização dos dados e retorna ao itinerário. <br>
 
**Fluxo Alternativo (2):** Consulta

a) O usuário acessa um itinerário específico e visualiza todos os dados do itinerário cadastrado no Sistema.

**Pós-condições:** Um itinerário foi criado ou removido, seus dados foram alterados ou apresentados na tela.


### Gerenciar checklist de itens para viagem (CSU07)

**Sumário:** O viajante realiza a gestão (inclusão, remoção, alteração e consulta) de seus checklists de viagem.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve possuir uma conta criada no Sistema, estar logado em sua conta e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a seção “Meus Itinerários” no Sistema; <br>
2) O Sistema exibe a lista de todos os itinerários deste usuário; <br>
3) O usuário seleciona um itinerário específico e acessa o checklist de itens relacionado ao itinerário; <br>
4) O Sistema apresenta as operações que podem ser realizadas: criação, consulta, alteração ou remoção de checklist; <br>
5) O usuário seleciona a operação desejada ou opta por finalizar o caso de uso ao sair do itinerário; <br>
6) Se o usuário desejar continuar com o gerenciamento de checklist, o caso de uso termina com o salvamento dos dados; caso contrário o caso de uso finaliza. <br>

**Fluxo Alternativo (4):** Inclusão

a) O usuário seleciona a operação de criação de checklist; <br>
b) O Sistema solicita o preenchimento de dados como nome do checklist e itens a serem incluídos; <br>
c) O usuário preenche os dados requisitados e confirma a criação do checklist; <br>
d) O Sistema valida os dados, cria o checklist e exibe o checklist criado no devido itinerário. <br>

**Fluxo Alternativo (4):** Remoção

a) O usuário seleciona a operação de remoção de checklist; <br>
b) O Sistema exibe uma mensagem para a confirmação da remoção do checklist; <br>
c) O usuário confirma a remoção do checklist; caso contrário; o usuário cancela a operação de remoção e o Sistema retorna ao checklist; <br>
d) Com a confirmação do usuário, o Sistema exclui o checklist, exibe uma mensagem de confirmação de remoção e retorna ao itinerário. <br>

**Fluxo Alternativo (4):** Alteração

a) O usuário seleciona a operação de alteração de dados do checklist; <br>
b) O Sistema exibe os campos editáveis (nome e itens incluídos); <br>
c) O usuário modifica os campos desejados e confirma o salvamento das alterações dos dados; <br>
d) O Sistema valida as alterações e atualiza os dados do checklist; <br>
e) O Sistema exibe uma mensagem de confirmação da atualização dos dados e retorna ao checklist. <br>
 
**Fluxo Alternativo (3):** Consulta

a) O usuário acessa um itinerário específico e visualiza o checklist relacionado a esse itinerário.

**Pós-condições:** Um checklist foi criado ou removido, seus dados foram alterados ou apresentados na tela.


### Utilizar mapa interativo (CSU08)

**Sumário:** O viajante utiliza o mapa interativo do Sistema para localizar atrações, atividades e rotas de viagem.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve ter acesso ao Sistema e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a seção “Mapa Interativo” na página inicial do Sistema; <br>
2) O Sistema exibe o mapa com marcadores (atrações, restaurantes, etc) para interação; <br>
3) O usuário interage com o mapa e seleciona um marcador para obter mais informações; caso contrário, o caso de uso finaliza; <br>
4) Se o usuário desejar ter as informações completas sobre um determinado marcador, o Sistema o direciona à página específica do marcador e o caso de uso termina. <br>

**Fluxo Alternativo (2):** Busca Direta por Localização

a) O usuário utiliza a barra de pesquisa para  buscar um local específico; <br>
b) Se o Sistema localizar o local pesquisado, o mesmo retorna a busca centralizando o mapa na região pesquisada e apresentando os marcadores (atrações, restaurantes, etc) mais próximos; caso contrário, o Sistema exibe uma mensagem de que não foi possível retornar resultados àquela busca. <br>

**Fluxo Alternativo (2):** Utilização de Filtros

a) O usuário aplica filtros para visualizar marcadores por categoria (restaurantes, museus, parques, etc); <br>
b) O Sistema exibe no mapa apenas os marcadores que correspondem aos filtros selecionados pelo usuário. <br>

**Fluxo Alternativo (2):** Exibição de Rotas

a) O usuário seleciona dois ou mais pontos no mapa para gerar uma rota de viagem; <br>
b) O Sistema calcula e exibe a rota no mapa com informações sobre distância e tempo estimado de viagem. <br>

**Pós-condições:** Um usuário utilizou o mapa interativo do Sistema para encontrar marcadores ou exibir uma rota de viagem.


### Aplicar filtros de pesquisa (CSU09)

**Sumário:** O viajante aplica filtros de pesquisa para refinar e organizar os resultados de suas buscas no Sistema.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve ter acesso ao Sistema e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a página inicial do Sistema; <br>
2) O usuário seleciona os filtros desejados (data, destino ou categoria) para uma busca mais assertiva; <br>
3) O Sistema executa a busca com base nos filtros selecionados e exibe os resultados ao usuário. <br>

**Fluxo Alternativo (3):** Nenhum Resultado Encontrado

a) O Sistema retorna o resultado da busca com uma mensagem de que não foi possível retornar resultados àquela busca e sugere palavras-chave alternativas ao usuário.

**Pós-condições:** Um usuário utilizou os filtros disponíveis no Sistema e encontrou o que desejava ou não foi possível encontrar resultados satisfatórios.


### Compartilhar itinerário (CSU10)

**Sumário:** O viajante realiza o compartilhamento de seus itinerários criados no Sistema.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve possuir uma conta criada no Sistema, estar logado em sua conta, possuir um itinerário criado e conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a seção “Meus Itinerários” no Sistema; <br>
2) O Sistema exibe a lista de todos os itinerários deste usuário; <br>
3) O usuário seleciona um itinerário específico e em seguida seleciona a operação de compartilhamento de itinerário; <br>
4) O Sistema exibe as opções de compartilhamento possíveis (redes sociais ou link público); <br>
5) O usuário seleciona a opção de compartilhamento desejada; <br>
6) O Sistema processa a solicitação de compartilhamento; <br>
7) O usuário finaliza o compartilhamento do itinerário e o caso de uso termina; caso contrário, o caso de uso é finalizado e o Sistema direciona o usuário ao itinerário novamente. <br>

**Fluxo Alternativo (4):** Compartilhamento via Redes Sociais

a) O usuário seleciona a opção de compartilhamento via redes sociais; <br>
b) O Sistema exibe as opções de redes sociais disponíveis; <br>
c) O usuário seleciona a rede social desejada; caso contrário, o usuário cancela a operação de compartilhamento e o Sistema o direciona ao itinerário novamente; <br>
d) O Sistema redireciona o usuário à rede social escolhida para envio do link do itinerário. <br>

**Fluxo Alternativo (4):** Compartilhamento via Link Público

a) O usuário seleciona a opção de compartilhamento via link público; <br>
b) O Sistema gera um link público de acesso ao itinerário e exibe ao usuário; <br>
c) O usuário copia o link gerado e finaliza o compartilhamento do itinerário; caso contrário, o usuário cancela a operação e o Sistema o direciona ao itinerário novamente. <br>

**Fluxo Alternativo (6):** Falha no Compartilhamento

a) O Sistema realiza a tentativa de gerar um link do itinerário para compartilhamento; <br>
b) O Sistema reporta a falha no processamento do compartilhamento; <br>
c) O usuário realiza uma nova tentativa de compartilhamento; <br>
d) O Sistema realiza o processamento do compartilhamento e o usuário dá continuidade ao caso de uso; caso contrário, o usuário entra em contato com o Suporte do Sistema e o caso de uso é finalizado. <br>

**Pós-condições:** Um itinerário foi compartilhado via link público ou redes sociais, ou não foi possível realizar o compartilhamento e um usuário contatou o Suporte do Sistema.


### Gerenciar favoritos (CSU11)

**Sumário:** O viajante realiza a gestão (inclusão, alteração, remoção e consulta) de seus itens favoritados.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve possuir uma conta criada no Sistema, estar logado em sua conta e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a página inicial do Sistema; <br>
2) O usuário acessa a seção “Meus Favoritos” no Sistema; <br>
3) O Sistema exibe a lista de itens favoritos deste usuário e as operações que podem ser realizadas: alteração, consulta ou remoção; <br>
4) O usuário seleciona a operação desejada e o caso de uso termina com o processamento da operação; caso contrário, o usuário opta por finalizar o caso de uso ao sair da seção "Meus Favoritos". <br>

**Fluxo Alternativo (1):** Inclusão

a) O usuário visualiza um item/anúncio do seu interesse e o favorita; <br>
b) O Sistema exibe as opções de pastas de favoritos que o usuário já tem criado. O usuário seleciona uma dessas pastas ou opta por salvar na seção “Meus Favoritos” de forma geral; <br>
c) O Sistema salva o item na seção “Meus Favoritos”. <br>

**Fluxo Alternativo (3):** Remoção

a) O usuário acessa um item da seção “Meus Favoritos” e seleciona a operação de remoção; <br>
b) O Sistema exibe uma mensagem de sucesso, confirmando a remoção do item da lista de favoritos e atualizando a listagem. <br>

**Fluxo Alternativo (3):** Alteração

a) O usuário acessa um item da seção “Meus Favoritos” e seleciona a operação de alteração de pasta; <br>
b) O Sistema exibe as outras pastas de favoritos que o usuário possui; <br>
c) O usuário seleciona uma das pastas exibidas para mover o favorito. <br>

**Fluxo Alternativo (3):** Consulta

a) O usuário seleciona a operação de visualizar detalhes do favorito; <br>
b) O Sistema redireciona o usuário à página do item favoritado para visualizar todos os detalhes. <br>

**Pós-condições:** Um item foi favoritado (incluído), removido, alterado de uma pasta à outra ou apresentado na tela.


### Gerenciar conteúdo (CSU12)

**Sumário:** O administrador realiza a gestão (inclusão, remoção, alteração, publicação e consulta) de conteúdos no Sistema.7

**Ator Primário:** Administrador

**Pré-condições:** O usuário deve possuir uma conta de Administrador criada no Sistema, estar logado em sua conta e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a seção “Conteúdos” no Sistema; <br>
2) O Sistema exibe a lista de todos os conteúdos do Sistema (em rascunho e publicados) e as operações que podem ser realizadas: criação, alteração, consulta, publicação ou remoção de conteúdo; <br>
3) O usuário seleciona a operação desejada ou opta por finalizar o caso de uso ao sair da seção “Conteúdos”; <br>
4) Se o usuário desejar continuar com o gerenciamento de conteúdo, o caso de uso termina com o salvamento dos dados; caso contrário o caso de uso finaliza. <br>

**Fluxo Alternativo (2):** Inclusão

a) O usuário seleciona a operação de criação de conteúdo; <br>
b) O Sistema solicita o preenchimento de dados como título e corpo do conteúdo; <br>
c) O usuário preenche os dados requisitados e confirma a criação do conteúdo; caso contrário, o usuário cancela a operação e é direcionado ao conteúdo novamente; <br>
d) Com a confirmação do usuário, um rascunho de conteúdo é criado e exibido pelo Sistema na seção “Conteúdos”. <br>

**Fluxo Alternativo (2):** Remoção

a) O usuário acessa um conteúdo específico e seleciona a operação de remoção de conteúdo; <br>
b) O Sistema exibe uma mensagem para a confirmação da remoção do conteúdo; <br>
c) O usuário confirma a remoção do conteúdo; caso contrário, o usuário cancela a operação de remoção e o Sistema retorna ao conteúdo; <br>
d) Com a confirmação do usuário, o Sistema exclui o conteúdo, exibe uma mensagem de confirmação de remoção e retorna à seção “Conteúdos”. <br>

**Fluxo Alternativo (2):** Alteração

a) O usuário acessa um conteúdo específico e seleciona a operação de alteração de conteúdo; <br>
b) O Sistema exibe os campos editáveis (título e corpo do conteúdo); <br>
c) O usuário modifica os campos desejados e confirma o salvamento das alterações realizadas; <br>
d) O Sistema valida as alterações e atualiza o conteúdo; <br>
e) O Sistema exibe uma mensagem de confirmação da atualização dos dados e retorna ao conteúdo atualizado. <br>

**Fluxo Alternativo (2):** Publicação

a) O usuário acessa um conteúdo específico que está em rascunho e seleciona a operação de publicação de conteúdo; <br>
b) O Sistema exibe uma mensagem para a confirmação da publicação do conteúdo; <br>
c) O usuário confirma a publicação do conteúdo; caso contrário; o usuário cancela a operação de publicação e o Sistema retorna ao conteúdo em rascunho; <br>
d) Com a confirmação do usuário, o Sistema publica o conteúdo, exibe uma mensagem de confirmação de publicação e retorna à seção “Conteúdos”. <br>
 
**Fluxo Alternativo (2):** Consulta

a) O usuário acessa um conteúdo específico e visualiza o conteúdo completo cadastrado no Sistema.

**Pós-condições:** Um conteúdo foi criado, removido ou publicado, seus dados foram alterados ou apresentados na tela.


### Gerenciar roteiros recomendados por IA (CSU13)

**Sumário:** O viajante utiliza a IA para gerar um roteiro personalizado e realiza o gerenciamento (inclusão, remoção, alteração e consulta) do roteiro no Sistema.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve possuir uma conta criada no Sistema, estar logado em sua conta e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a página inicial do Sistema; <br>
2) O usuário acessa a seção “Meus Itinerários” e o Sistema exibe as operações que podem ser realizadas: criação, alteração, consulta ou remoção de itinerário; <br>
3) O usuário seleciona a operação desejada ou opta por finalizar o caso de uso ao sair da seção “Meus Itinerários”; <br>
4) Se o usuário desejar continuar com o gerenciamento de itinerário, o caso de uso termina com o salvamento dos dados; caso contrário o caso de uso finaliza. <br>

**Fluxo Alternativo (1):** Inclusão

a) O usuário acessa a funcionalidade de gerar roteiro personalizado com IA através do menu principal; <br>
b) O Sistema apresenta um formulário de perguntas guiadas pela IA, buscando entender as preferências do usuário (estilo de viagem, interesses, orçamento, duração da viagem, etc.); <br>
c) O usuário responde as perguntas realizadas e submete o formulário; caso contrário, o usuário desiste do fluxo e o caso de uso finaliza; <br>
d) O Sistema envia as respostas para o motor de IA, que processa os dados e gera um roteiro personalizado de acordo com as respostas do usuário; <br>
e) O usuário realiza o salvamento do roteiro criado na seção “Meus Itinerários”; caso contrário, o usuário pode selecionar a operação de remoção e o caso de uso finaliza ou selecionar a operação de refazer roteiro, onde ele deve responder novamente às questões para criar um roteiro que atenda melhor às suas necessidades; <br>
f) Após o salvamento do roteiro criado, o Sistema exibe o roteiro na seção “Meus Itinerários”. <br>

**Fluxo Alternativo (2):** Remoção

a) O usuário acessa um itinerário específico e seleciona a operação de remoção de itinerário; <br>
b) O Sistema exibe uma mensagem para a confirmação da remoção do itinerário;<br>
c) O usuário confirma a remoção do itinerário; caso contrário; o usuário cancela a operação de remoção e o Sistema retorna ao itinerário; <br>
d) Com a confirmação do usuário, o Sistema exclui o itinerário, exibe uma mensagem de confirmação de remoção e retorna à seção “Meus Itinerários”. <br>

**Fluxo Alternativo (2):** Alteração

a) O usuário acessa um itinerário específico e seleciona a operação de alteração de itinerário; <br>
b) O Sistema exibe os campos editáveis (nome, datas, destinos, valores, atividades, notas…); <br>
c) O usuário modifica os campos desejados e confirma o salvamento das alterações realizadas; <br>
d) O Sistema valida as alterações e atualiza os dados do itinerário. Se os dados inseridos não forem válidos, o Sistema reporta o fato e volta à tela de alteração dos dados; <br>
e) O Sistema exibe uma mensagem de confirmação da atualização dos dados e retorna ao itinerário. <br>
 
**Fluxo Alternativo (2):** Consulta

a) O usuário acessa um itinerário específico e visualiza todos os dados do itinerário cadastrado no Sistema.

**Fluxo Alternativo (1):** Falha na IA

a) O usuário acessa a funcionalidade de gerar roteiro personalizado com IA através do menu principal; <br>
b) O Sistema apresenta um formulário de perguntas guiadas pela IA, buscando entender as preferências do usuário (estilo de viagem, interesses, orçamento, duração da viagem, etc.); <br>
c) O usuário responde as perguntas realizadas e submete o formulário; <br>
d) O Sistema falha na integração com a IA e exibe uma mensagem de erro ao usuário, o orientando a tentar novamente mais tarde. <br>

**Pós-condições:** Um itinerário personalizado com IA foi criado ou removido, seus dados foram alterados ou apresentados na tela, ou houve uma falha de integração do Sistema.


### Gerenciar avaliações (CSU14)

**Sumário:** O viajante realiza a gestão (inclusão, remoção, alteração e consulta) de suas avaliações no Sistema.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve possuir uma conta criada no Sistema, estar logado em sua conta e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a página inicial do Sistema; <br>
2) O usuário acessa a seção “Minhas Avaliações” no Sistema; <br>
3) O Sistema exibe a lista das avaliações efetuadas e as operações que podem ser realizadas: criação, alteração, consulta ou remoção; <br>
4) O usuário seleciona a operação desejada ou opta por finalizar o caso de uso ao sair da seção “Minhas Avaliações”; <br>
5) Se o usuário desejar continuar com o gerenciamento de avaliações, o caso de uso termina com o salvamento dos dados; caso contrário o caso de uso finaliza. <br>

**Fluxo Alternativo (1):** Inclusão

a) O usuário navega por um item/anúncio publicado no Sistema; <br>
b) Dentro do item/anúncio, o usuário seleciona a operação de adicionar avaliação; <br>
c) O Sistema solicita informações do item sendo avaliado, como o destino/serviço, a classificação, a descrição e fotos; <br>
d) O usuário fornece os dados e salva a nova avaliação; <br>
e) O Sistema exibe uma mensagem de sucesso, confirmando a inclusão da nova avaliação; <br>
f) O Sistema redireciona o usuário à seção “Minhas Avaliações” e exibe a avaliação criada. <br>

**Fluxo Alternativo (3):** Remoção

a) O usuário acessa uma avaliação específica e seleciona a operação de remoção; <br>
b) O Sistema exibe uma mensagem para a confirmação da remoção da avaliação; <br>
c) O usuário confirma a remoção da avaliação; caso contrário; o usuário cancela a operação de remoção e o Sistema retorna à listagem das avaliações; <br>
d) O Sistema exibe uma mensagem de sucesso, confirmando a remoção da avaliação e atualizando a listagem na seção “Minhas Avaliações”. <br>

**Fluxo Alternativo (3):** Alteração

a) O usuário acessa uma avaliação específica e seleciona a operação de alteração; <br>
b) O Sistema exibe os campos editáveis; <br>
c) O usuário modifica os campos desejados e confirma o salvamento das alterações realizadas; <br>
d) O Sistema valida as alterações e atualiza a avaliação; <br>
e) O Sistema exibe uma mensagem de confirmação da atualização dos dados e retorna à seção “Minhas Avaliações”. <br>
 
**Fluxo Alternativo (3):** Consulta

a) O usuário acessa uma avaliação específica e seleciona a operação de ver mais detalhes; <br>
b) O Sistema direciona o usuário para uma página com todos os detalhes da avaliação cadastrada. <br>

**Pós-condições:** Uma avaliação foi criada ou removida, seus dados foram alterados ou apresentados na tela.


### Gerenciar anúncios (CSU15)

**Sumário:** O parceiro realiza a gestão (inclusão, remoção, alteração e consulta) de anúncios no Sistema.

**Ator Primário:** Parceiro

**Ator Secundário:** Administrador

**Pré-condições:** O usuário parceiro deve possuir uma conta criada no Sistema, estar logado em sua conta e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário parceiro acessa a seção “Meus Anúncios” no Sistema; <br>
2) O Sistema exibe a lista de todos os anúncios deste usuário e as operações que podem ser realizadas: criação, alteração, consulta ou remoção de anúncio; <br>
3) O usuário seleciona a operação desejada ou opta por finalizar o caso de uso ao sair da seção “Meus Anúncios”; <br>
4) Se o usuário parceiro desejar continuar o gerenciamento de anúncios com as operações de criação ou alteração, o mesmo preenche os dados requisitados pelo Sistema e salva as informações; caso contrário, o caso de uso termina com a consulta ou confirmação da remoção do anúncio; <br>
5) Após o salvamento dos dados, o Sistema direciona o anúncio cadastrado ou editado à seção “Anúncios Pendentes” no perfil do usuário administrador para aprovação do mesmo; <br>
6) O usuário administrador aprova a publicação do anúncio e o caso de uso termina com a publicação do mesmo no Sistema; caso contrário o usuário parceiro recebe uma notificação por e-mail de que seu anúncio foi rejeitado. <br>

**Fluxo Alternativo (2):** Inclusão

a) O usuário parceiro seleciona a operação de criação de anúncio; <br>
b) O Sistema solicita o preenchimento de dados como título do anúncio, valores, fotos e demais dados; <br>
c) O usuário parceiro preenche os dados requisitados e confirma a criação do anúncio; <br>
d) O Sistema verifica se os dados obrigatórios foram preenchidos. Se sim, o Sistema direciona o anúncio para aprovação do usuário administrador; caso contrário, o Sistema reporta o fato para que o usuário preencha os dados faltantes; <br>
e) O usuário administrador valida o anúncio e realiza a aprovação; caso contrário, o usuário parceiro é comunicado via e-mail sobre a rejeição de publicação de seu anúncio no Sistema; <br>
f) Se aprovado, o Sistema publica o anúncio e o exibe a seção na “Meus Anúncios” do usuário parceiro. <br>

**Fluxo Alternativo (2):** Remoção

a) O usuário parceiro acessa um anúncio específico e seleciona a operação de remoção de anúncio; <br>
b) O Sistema exibe uma mensagem para a confirmação da remoção do anúncio; <br>
c) O usuário parceiro confirma a remoção do anúncio; caso contrário; o usuário parceiro cancela a operação de remoção e o Sistema retorna ao anúncio; <br>
d) Com a confirmação do usuário parceiro, o Sistema exclui o anúncio, exibe uma mensagem de confirmação de remoção e retorna à seção “Meus Anúncios”. <br>

**Fluxo Alternativo (2):** Alteração

a) O usuário parceiro acessa um anúncio específico e seleciona a operação de alteração de anúncio; <br>
b) O Sistema exibe os campos editáveis; <br>
c) O usuário modifica os campos desejados e confirma o salvamento das alterações realizadas; <br>
d) O Sistema valida as alterações. Se os dados obrigatórios tiverem sido apagados, o Sistema reporta o fato e volta à tela de alteração dos dados para que o usuário parceiro os preencha; caso contrário, o anúncio é enviado para aprovação do usuário administrador; <br>
e) O usuário administrador valida as alterações realizadas no anúncio e realiza a aprovação; caso contrário, o usuário parceiro é comunicado via e-mail sobre a rejeição das alterações de seu anúncio no Sistema; <br>
f) Se aprovado, o Sistema comunica ao usuário parceiro a aprovação das alterações de seu anúncio via e-mail e o exibe atualizado no Sistema. <br>
 
**Fluxo Alternativo (2):** Consulta

a) O usuário parceiro acessa um anúncio específico e visualiza todos os dados do anúncio cadastrado no Sistema.

**Pós-condições:** Um anúncio foi criado ou removido, seus dados foram alterados ou apresentados na tela.


### Consultar conteúdos (CSU16)

**Sumário:** O viajante consulta conteúdos publicados no Sistema.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve ter acesso ao Sistema e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a seção “Conteúdos de Viagem” no Sistema; <br>
2) O Sistema exibe a lista de todos os conteúdos publicados no Sistema; <br>
3) O usuário seleciona um conteúdo para realizar a leitura e o caso de uso termina; caso contrário, o usuário finaliza o caso de uso ao sair da seção “Conteúdos de Viagem”. <br>

**Pós-condições:** Um conteúdo foi acessado pelo usuário para leitura.


### Consultar anúncios (CSU17)

**Sumário:** O viajante consulta anúncios publicados no Sistema.

**Ator Primário:** Viajante

**Pré-condições:** O usuário deve ter acesso ao Sistema e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a página inicial do Sistema; <br>
2) O Sistema exibe as opções de anúncios publicados por categoria; <br>
3) O usuário seleciona uma categoria específica e o Sistema apresenta todos os anúncios disponíveis de acordo com a categoria selecionada; <br>
4) O usuário seleciona um anúncio para visualizar os detalhes e o Sistema exibe a tela do anúncio completo. <br>

**Pós-condições:** Um anúncio foi acessado por um usuário.


### Aprovar anúncios (CSU18)

**Sumário:** O administrador avalia e aprova anúncios para que eles sejam publicados no Sistema.

**Ator Primário:** Administrador

**Ator Secundário:** Parceiro

**Pré-condições:** O usuário deve possuir uma conta de Administrador criada no Sistema, estar logado em sua conta e possuir conexão de internet estável.

**Fluxo Principal:**

1) O usuário acessa a seção “Anúncios” do Sistema; <br>
2) O Sistema exibe a lista de todos os anúncios separados por status “Publicados” e “Aguardando Aprovação”; <br>
3) O usuário seleciona um anúncio com status “Aguardando Aprovação” e avalia as informações deste anúncio; <br>
4) Se o anúncio estiver de acordo com a política do Sistema, o usuário aprova a publicação do anúncio no Sistema e o caso de uso termina; caso contrário, o usuário rejeita a publicação do anúncio e o parceiro é notificado via e-mail, bem como o anúncio é excluído. <br>

**Pós-condições:** Um anúncio foi aprovado e publicado ou rejeitado e excluído.


### 3.4.3 Diagrama de Classes 

A Figura 2 mostra o diagrama de classes do sistema Viajey. Cada usuário (viajante, parceiro ou admin) deve possuir um login único para acessar e ser identificado pelo sistema, assim sendo, essa classe tem o papel de registrar os dados de identificação e acesso que servem de base para que o usuário possa gerenciar sua conta (consultar, cadastrar, editar, remover) e demais funções. <br>
A classe Viajante pode possuir nenhum ou muitos itinerários, avaliações e listas de favoritos. <br>
A classe Local indica um estabelecimento ou anúncio disponível no sistema e é composta pelos seguintes atributos: título, descrição, tipo (parque, museu, etc), preço, endereço e foto. Classes como Avaliação, ListaFavorito, Anúncio e ItemItinerário são compostas e estão relacionadas à esta classe Local. <br>
Cada Avaliação deve ser realizada por um único Viajante, ela deve ter como atributos: título, comentário/descrição e nota do usuário. 
Cada ListaFavorito deve estar relacionada a um único Viajante e deve possuir o atributo 'nome'. <br>
Cada Itinerário deve estar relacionado a um único Viajante e pode ser composto por nenhum ou muitos Checklists, bem como por nenhum ou muitos Itens. Esta classe deve possuir como atributos: título e data de início e fim da viagem. <br>
Um ItemItinerario é composto pelo Local e deve possuir os atributos: data e horário de início e fim do passeio. <br>
Cada Checklist deve estar relacionado a um único itinerário, pode possuir nenhum ou muitos itens e deve ter o atributo 'nome'. Um ItemChecklist pode estar relacionado a um único Checklist e deve possuir os atributos: nome e status (a fazer ou concluído). <br>
Cada Parceiro pode possuir nenhum ou muitos anúncios, ao mesmo passo em que um Anúncio pode estar relacionado a um Local. Assim como a classe Local, a classe Anúncio deve possuir os seguintes atributos: nome, descrição, tipo (parque, museu, etc), preço, endereço e foto. <br>

#### Figura 2: Diagrama de Classes do Sistema.

![Diagrama de Classes - Viajey](https://github.com/user-attachments/assets/c26de7d4-e74e-451f-a9dc-3d004850a73b)


### 3.4.4 Descrições das Classes 

| #   | Nome           | Descrição |
|-----|----------------|-----------|
| 1   | Viajante       | Gerenciar informações relativas a usuários, como inclusão de conta, remoção, alteração ou consulta. |
| 2   | Itinerario     | Gerenciar roteiros personalizados de viagem. |
| 3   | ItemItinerario | Gerenciar itens (locais) adicionados em itinerários criados. |
| 4   | Checklist      | Gerenciar listas (checklists) de itens essenciais para viagem. |
| 5   | ItemChecklist  | Gerenciar itens adicionados em checklists criados. |
| 6   | ListaFavorito  | Gerenciar lista de locais marcados como favoritos. |
| 7   | Avaliacao      | Gerenciar avaliações sobre locais e experiências. |
| 8   | Local          | Itens/anúncios publicados na plataforma para consulta de usuários viajantes. |
| 9   | Anuncio        | Gerenciar anúncios publicados na plataforma por parceiros. |
| 10  | Parceiro       | Gerenciar informações relativas a usuários, como inclusão de conta, remoção, alteração ou consulta, bem como gerenciar anúncios. |
| 11  | Admin          | Usuário com permissões especiais para gerenciar a plataforma, incluindo moderação de conteúdo, gerenciamento de conta e controle de anúncios. |
