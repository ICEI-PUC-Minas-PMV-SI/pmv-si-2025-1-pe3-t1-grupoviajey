# Viajey - Aplicativo de Planejamento de Viagens

## Descrição
Viajey é uma aplicação web de planejamento de viagens que oferece recursos abrangentes para gerenciamento de roteiros com interface interativa e personalizada.

## Tecnologias Utilizadas
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js/Express
- **Banco de Dados**: PostgreSQL
- **Estilos**: Bootstrap 5 com tema dark personalizado

## Funcionalidades Principais
- Visualização de destinos populares
- Criação de roteiros de viagem
- Organização de atividades em formato kanban por período do dia
- Sistema de arrastar e soltar para organização das atividades
- Compartilhamento de roteiros
- Gerenciamento de perfil de usuário

## Estrutura do Projeto
- `server.js`: Servidor principal Node.js/Express
- `public/`: Arquivos HTML para as diferentes páginas
- `static/css/`: Estilos CSS personalizados
- `static/js/`: Scripts JavaScript para funcionalidades específicas
- `static/img/`: Imagens e ícones

## Página Kanban
Uma das principais funcionalidades é a página de gerenciamento de roteiro no estilo kanban, que permite:
- Arrastar e soltar atividades entre períodos do dia (manhã, tarde, noite)
- Organizar atividades dentro de cada período (atividades à esquerda ocorrem antes)
- Adicionar novos dias ao roteiro
- Adicionar novas atividades com formulário completo

## Banco de Dados
O aplicativo utiliza PostgreSQL com o seguinte esquema:
- `users`: Dados dos usuários
- `itineraries`: Informações dos roteiros
- `itinerary_days`: Dias específicos de cada roteiro
- `activities`: Atividades planejadas para cada dia

## Deploy
### Requisitos
- Node.js 20+
- PostgreSQL
- Variáveis de ambiente:
  - `DATABASE_URL`: URL de conexão com o PostgreSQL (formato: `postgres://user:password@host:port/database`)
  - `PORT`: Porta para o servidor (padrão: 5000)
  - `NODE_ENV`: Ambiente de execução
  - `GOOGLE_MAPS_API_KEY`: Chave da API do Google Maps para funcionalidade de mapas

### Deploy no EasyPanel
1. Configure um novo projeto no EasyPanel
2. Conecte ao repositório Git
3. Use o Dockerfile incluído no projeto
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`: URL de conexão com PostgreSQL
   - `GOOGLE_MAPS_API_KEY`: Chave do Google Maps API
5. Inicie o contêiner

O Dockerfile está configurado para instalar todas as dependências e iniciar o servidor automaticamente.

### Configurando o Google Maps API
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative as seguintes APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Crie uma chave de API com as restrições apropriadas
5. Adicione a chave como variável de ambiente `GOOGLE_MAPS_API_KEY`