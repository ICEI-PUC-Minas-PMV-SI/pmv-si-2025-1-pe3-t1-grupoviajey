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
|--------------------|------------------------------------|----------------------------------------|
| RF1 | Gerenciar Curso de Aperfeiçoamento |	Processamento de Inclusão, Alteração, Exclusão e Consulta de Cursos de Aperfeiçoamento |
| RF2 |	Gerenciar Professor	| Processamento de Inclusão, Alteração, Exclusão e Consulta de professores |
| RF3	| Gerenciar Matrícula |	Processamento de Inclusão, Alteração, Exclusão e Consulta de Matrículas de alunos em Cursos de Aperfeiçoamento |
| ... |	...	| ... |

### 3.3.2 Requisitos Não Funcionais

| Código | Requisito Não Funcional (Restrição) |
|--------------------|------------------------------------|
| RNF1 | O ambiente operacional a ser utilizado é o Windows XP. |
| RNF2 | O sistema deverá executar em um computador configurado com uma impressora de tecnologia laser ou de jato de tinta, a ser usada para impressão dos relatórios. |
| RNF3 |	Segurança	O produto deve restringir o acesso por meio de senhas individuais para o usuário. |
| ... |	... |	... |

### 3.3.3 Usuários 

| Ator | Descrição |
|--------------------|------------------------------------|
| Viajante |	Usuário com permissão para criar seus roteiros, editá-los, excluí-los, compartilhá-los, favoritar e avaliar itens (atrações, passeios, etc), bem como criar seus próprios checklists de viagem. |
| Parceiro |	Usuário com permissão para criar, editar e excluir seus anúncios. |
| Administrador |	Usuário com permissão total ao sistema, mas com funcionalidades exclusivas de aprovação ou rejeição de anúncio e gerenciamento de conteúdos. |

## 3.4 Modelagem do Sistema

### 3.4.1 Diagrama de Casos de Uso
Como observado no diagrama de casos de uso da Figura 1, a secretária poderá gerenciar as matrículas e professores no sistema, enquanto o coordenador, além dessas funções, poderá gerenciar os cursos de aperfeiçoamento.

#### Figura 1: Diagrama de Casos de Uso do Sistema.

![dcu](https://github.com/user-attachments/assets/41f6b731-b44e-43aa-911f-423ad6198f47)
 
### 3.4.2 Descrições de Casos de Uso

Cada caso de uso deve ter a sua descrição representada nesta seção. Exemplo:

#### Gerenciar Professor (CSU01)

Sumário: A Secretária realiza a gestão (inclusão, remoção, alteração e consulta) dos dados sobre professores.

Ator Primário: Secretária.

Ator Secundário: Coordenador.

Pré-condições: A Secretária deve ser validada pelo Sistema.

Fluxo Principal:

1) 	A Secretária requisita manutenção de professores.
2) 	O Sistema apresenta as operações que podem ser realizadas: inclusão de um novo professor, alteração de um professor, a exclusão de um professor e a consulta de dados de um professor.
3) 	A Secretária seleciona a operação desejada: Inclusão, Exclusão, Alteração ou Consulta, ou opta por finalizar o caso de uso.
4) 	Se a Secretária desejar continuar com a gestão de professores, o caso de uso retorna ao passo 2; caso contrário o caso de uso termina.

Fluxo Alternativo (3): Inclusão

a)	A Secretária requisita a inclusão de um professor. <br>
b)	O Sistema apresenta uma janela solicitando o CPF do professor a ser cadastrado. <br>
c)	A Secretária fornece o dado solicitado. <br>
d)	O Sistema verifica se o professor já está cadastrado. Se sim, o Sistema reporta o fato e volta ao início; caso contrário, apresenta um formulário em branco para que os detalhes do professor (Código, Nome, Endereço, CEP, Estado, Cidade, Bairro, Telefone, Identidade, Sexo, Fax, CPF, Data do Cadastro e Observação) sejam incluídos. <br>
e)	A Secretária fornece os detalhes do novo professor. <br>
f)	O Sistema verifica a validade dos dados. Se os dados forem válidos, inclui o novo professor e a grade listando os professores cadastrados é atualizada; caso contrário, o Sistema reporta o fato, solicita novos dados e repete a verificação. <br>

Fluxo Alternativo (3): Remoção

a)	A Secretária seleciona um professor e requisita ao Sistema que o remova. <br>
b)	Se o professor pode ser removido, o Sistema realiza a remoção; caso contrário, o Sistema reporta o fato. <br>

Fluxo Alternativo (3): Alteração

a)	A Secretária altera um ou mais dos detalhes do professor e requisita sua atualização. <br>
b)	O Sistema verifica a validade dos dados e, se eles forem válidos, altera os dados na lista de professores, caso contrário, o erro é reportado. <br>
 
Fluxo Alternativo (3): Consulta

a)	A Secretária opta por pesquisar pelo nome ou código e solicita a consulta sobre a lista de professores. <br>
b)	O Sistema apresenta uma lista professores. <br>
c)	A Secretária seleciona o professor. <br>
d)	O Sistema apresenta os detalhes do professor no formulário de professores. <br>

Pós-condições: Um professor foi inserido ou removido, seus dados foram alterados ou apresentados na tela.

### 3.4.3 Diagrama de Classes 

A Figura 2 mostra o diagrama de classes do sistema. A Matrícula deve conter a identificação do funcionário responsável pelo registro, bem com os dados do aluno e turmas. Para uma disciplina podemos ter diversas turmas, mas apenas um professor responsável por ela.

#### Figura 2: Diagrama de Classes do Sistema.
 
![image](https://github.com/user-attachments/assets/abc7591a-b46f-4ea2-b8f0-c116b60eb24e)


### 3.4.4 Descrições das Classes 

| # | Nome | Descrição |
|--------------------|------------------------------------|----------------------------------------|
| 1	|	Aluno |	Cadastro de informações relativas aos alunos. |
| 2	| Curso |	Cadastro geral de cursos de aperfeiçoamento. |
| 3 |	Matrícula |	Cadastro de Matrículas de alunos nos cursos. |
| 4 |	Turma |	Cadastro de turmas.
| 5	|	Professor |	Cadastro geral de professores que ministram as disciplinas. |
| ... |	... |	... |
