# Viajey Backend

Backend para o sistema de planejamento de viagens Viajey, construído com Node.js, Express e Firebase.

## Estrutura do Firestore

### Modelo Atual:
```
/trips/{tripId}
 ├── tripDays/{dayId}
 │    └── tripPlaces/{placeId}
 │         ├── tripPlaceExpenses/{expenseId}
 │         └── tripPlaceNotes/{noteId}
 ├── tripBudget/{budgetId}
 ├── tripChecklist/{checklistId}
 │    └── checklistItems/{itemId}
 └── unassignedPlaces/{placeId}
      ├── tripPlaceExpenses/{expenseId}
      └── tripPlaceNotes/{noteId}

/users/{userId}
 └── userFavorites/{favoriteId}

/placeReviews/{placeId}
 └── userReviews/{reviewId}

/sitePosts/{postId}
```

### Regras de Negócio:
- **Trips**: Estão na raiz `/trips/{tripId}` com `ownerId` e `collaborators`
- **Acesso**: Apenas owner e collaborators podem acessar uma trip
- **Reviews**: Públicas, organizadas por place
- **Favoritos**: Privados por usuário
- **Posts**: Apenas admin e partner podem criar, apenas admin pode aprovar
- **Locais do Google Maps**: Nunca são persistidos ou atualizados no backend. O backend só armazena dados personalizados do usuário (ex: notas, gastos, favoritos, avaliações, ordem no roteiro). Dados como nome, endereço, etc., vêm sempre da API do Google.

## 🔐 Autenticação e Autorização

### Fluxo de autenticação:
- O frontend faz login/cadastro via Firebase Auth e obtém o ID Token
- O backend recebe o ID Token no header Authorization (Bearer)
- O backend valida o token e verifica Custom Claims (`userType`)

### Custom Claims:
- `admin`: Acesso total ao sistema
- `partner`: Pode criar posts e anúncios
- `traveler`: Usuário padrão

## Endpoints da API

### 🔑 Autenticação

#### POST /api/auth/signup
Cadastra um novo usuário no sistema.

**Payload:**
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "cpfCnpj": "12345678901",
  "userType": "traveler"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "uid": "user123",
    "email": "joao@email.com",
    "customToken": "eyJhbGciOiJSUzI1NiIs..."
  }
}
```

#### GET /api/auth/verify
Verifica se o token de autenticação é válido.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "uid": "user123",
    "email": "joao@email.com",
    "userType": "traveler"
  }
}
```

#### POST /api/auth/forgot-password
Solicita recuperação de senha.

**Payload:**
```json
{
  "email": "joao@email.com"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Se o email estiver cadastrado, um link de redefinição foi enviado",
  "data": {
    "resetLink": "https://viajey-db.firebaseapp.com/__/auth/action..."
  }
}
```

#### POST /api/auth/logout
Realiza logout do usuário (revoga tokens).

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### 👤 Perfil do Usuário

#### GET /api/users/me
Busca o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "cpfCnpj": "12345678901",
    "userType": "traveler",
    "avatarUrl": "",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/users/me
Atualiza o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Payload:**
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "cpfCnpj": "12345678901",
  "userType": "traveler",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "cpfCnpj": "12345678901",
    "userType": "traveler",
    "avatarUrl": "https://example.com/avatar.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Trips
- `GET /api/trips` - Listar viagens do usuário (owner + collaborator)
- `POST /api/trips` - Criar nova viagem
- `GET /api/trips/:tripId` - Buscar viagem específica
- `PUT /api/trips/:tripId` - Atualizar viagem
- `DELETE /api/trips/:tripId` - Deletar viagem (apenas owner)
- `POST /api/trips/:tripId/collaborators` - Adicionar colaborador
- `DELETE /api/trips/:tripId/collaborators/:collaboratorId` - Remover colaborador

### Roadmap
- `GET /api/roadmap/trips/:tripId/roadmap` - Buscar roadmap com estatísticas
- `POST /api/roadmap/trips/:tripId/roadmap` - Criar roadmap
- `PUT /api/roadmap/trips/:tripId/roadmap` - Atualizar roadmap

### Trip Days
- `GET /api/roadmap/trips/:tripId/tripDays` - Listar dias da viagem
- `POST /api/roadmap/trips/:tripId/tripDays` - Criar dia
- `GET /api/roadmap/trips/:tripId/tripDays/:dayId` - Buscar dia específico
- `PUT /api/roadmap/trips/:tripId/tripDays/:dayId` - Atualizar dia
- `DELETE /api/roadmap/trips/:tripId/tripDays/:dayId` - Deletar dia

### Trip Places (Locais do roteiro)
- `DELETE /api/roadmap/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId` - Remover local
- **Não existe endpoint de atualização (PUT/PATCH) para locais do roteiro.**
- **Atenção:** Os dados dos locais (nome, endereço, etc.) não são atualizados pelo backend. Apenas dados personalizados do usuário podem ser armazenados (ex: notas, gastos, ordem, horários).

#### POST /api/roadmap/trips/:tripId/tripDays/:dayId/tripPlaces
Adiciona um novo local a um dia específico do roteiro.

**Payload:**
```json
{
  "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "name": "Sydney Opera House",
  "address": "Bennelong Point, Sydney NSW 2000, Australia",
  "latitude": -33.8567844,
  "longitude": 151.2152967,
  "rating": 4.7,
  "photo": "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=...",
  "types": ["point_of_interest", "establishment"],
  "order": 0
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": "generatedPlaceId",
    "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "name": "Sydney Opera House",
    // ... todos os outros campos do payload
    "createdAt": "2024-05-22T18:00:00.000Z",
    "updatedAt": "2024-05-22T18:00:00.000Z"
  }
}
```

#### DELETE /api/roadmap/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId
Remove um local de um dia específico do roteiro.

### Unassigned Places (Locais não atribuídos)
- `GET /api/roadmap/trips/:tripId/unassignedPlaces` - Listar locais não atribuídos
- `POST /api/roadmap/trips/:tripId/unassignedPlaces` - Adicionar local não atribuído
- `DELETE /api/roadmap/trips/:tripId/unassignedPlaces/:placeId` - Remover local não atribuído
- `POST /api/roadmap/trips/:tripId/unassignedPlaces/:placeId/move-to-day/:dayId` - Mover para dia
- **Não existe endpoint de atualização (PUT/PATCH) para locais não atribuídos.**

### Trip Budget
- `GET /api/roadmap/trips/:tripId/tripBudget` - Buscar orçamento
- `POST /api/roadmap/trips/:tripId/tripBudget` - Criar orçamento
- `PUT /api/roadmap/trips/:tripId/tripBudget` - Atualizar orçamento

### Trip Checklist
- `GET /api/roadmap/trips/:tripId/tripChecklist` - Listar checklists
- `POST /api/roadmap/trips/:tripId/tripChecklist` - Criar checklist
- `GET /api/roadmap/trips/:tripId/tripChecklist/:checklistId` - Buscar checklist específico
- `PUT /api/roadmap/trips/:tripId/tripChecklist/:checklistId` - Atualizar checklist
- `DELETE /api/roadmap/trips/:tripId/tripChecklist/:checklistId` - Deletar checklist
- `POST /api/roadmap/trips/:tripId/tripChecklist/:checklistId/checklistItems` - Adicionar item
- `PUT /api/roadmap/trips/:tripId/tripChecklist/:checklistId/checklistItems` - Atualizar item
- `DELETE /api/roadmap/trips/:tripId/tripChecklist/:checklistId/checklistItems` - Remover item
- `GET /api/roadmap/trips/:tripId/tripChecklist/stats` - Estatísticas dos checklists

### Favorites
- `GET /api/favorites` - Listar favoritos do usuário
- `POST /api/favorites` - Adicionar favorito
- `DELETE /api/favorites/:favoriteId` - Remover favorito

### Reviews
- `GET /api/reviews/places/:placeId` - Listar reviews de um local
- `POST /api/reviews/places/:placeId` - Criar review
- `PUT /api/reviews/places/:placeId/:reviewId` - Atualizar review
- `DELETE /api/reviews/places/:placeId/:reviewId` - Deletar review

### Site Posts
- `GET /api/posts/public` - Listar posts públicos
- `POST /api/posts` - Criar post (admin/partner)
- `PUT /api/posts/:postId` - Atualizar post (admin/author)
- `DELETE /api/posts/:postId` - Deletar post (admin/author)
- `POST /api/posts/:postId/approve` - Aprovar post (admin)
- `POST /api/posts/:postId/reject` - Rejeitar post (admin)

## 🚀 Instalação e Execução

### Pré-requisitos:
- Node.js 18+
- Firebase Admin SDK credentials

### Instalação:
```bash
cd backend
npm install
```
### Execução:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔧 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Firebase Admin SDK** - Backend services
- **Firestore** - Banco de dados NoSQL
- **Joi** - Validação de dados
- **Helmet** - Segurança
- **CORS** - Cross-origin resource sharing
- **Morgan** - Logging

## 📝 Observações

- Toda autenticação é feita pelo frontend via Firebase Auth
- O backend valida tokens e gerencia dados extras
- As regras de segurança do Firestore devem ser configuradas adequadamente
- Custom Claims são usados para controle de permissões
- **O backend nunca persiste ou atualiza dados dos locais do Google Maps. Apenas dados personalizados do usuário são armazenados.**
- A estrutura do banco foi otimizada para performance e escalabilidade 