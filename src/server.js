const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rotas principais
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'desktop.html'));
});

app.get('/explorar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'explorar.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

app.get('/itinerary', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'itinerary.html'));
});

app.get('/itinerary-kanban', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'itinerary-kanban.html'));
});

// Fallback para rotas não encontradas
app.get('*', (req, res) => {
  // Tenta servir o arquivo diretamente do diretório public
  const filePath = path.join(__dirname, 'public', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      // Se o arquivo não existir, redireciona para a página inicial
      res.redirect('/');
    }
  });
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});