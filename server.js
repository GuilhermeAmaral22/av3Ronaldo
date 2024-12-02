require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const mysql = require('mysql2/promise');
const axios = require('axios');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

// Rotas

// GET - Listar todos os eventos
fastify.get('/eventos', async (request, reply) => {
  try {
    const [rows] = await db.query('SELECT * FROM Eventos');
    reply.send(rows);
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao buscar Eventos' });
  }
});

// POST - Criar um novo evento
fastify.post('/eventos', async (request, reply) => {
  const { id, titulo, descricao, data_evento, hora_evento, local } = request.body;
  const funcionarioID = fetch();
  try {
    const [result] = await db.query(
      'INSERT INTO Eventos (id, titulo, descricao, data_evento, hora_evento, local, funcionarioID) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, titulo, descricao, data_evento, hora_evento, local, funcionarioID]
    );
    reply.status(201).send({ id: result.insertId });
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao criar evento' });
  }
  console.log(request.body);
});

// PUT - Atualizar um evento
fastify.put('/eventos/:id', async (request, reply) => {
  const { id } = request.params;
  const { titulo, descricao, data_evento, hora_evento, local, funcionarioID } = request.body;
  try {
    const [result] = await db.query(
      'UPDATE Eventos SET titulo = ?, descricao = ?, data_evento = ?, hora_evento = ?, local = ?, funcionarioID = ? WHERE id = ?',
      [titulo, descricao, data_evento, hora_evento, local, funcionarioID, id]
    );
    if (result.affectedRows === 0) {
      reply.status(404).send({ error: 'Evento não encontrado' });
    } else {
      reply.send({ message: 'Evento atualizado com sucesso' });
    }
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao atualizar evento' });
  }
});

// DELETE - Excluir um evento
fastify.delete('/eventos/:id', async (request, reply) => {
  const { id } = request.params;
  try {
    const [result] = await db.query('DELETE FROM Eventos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      reply.status(404).send({ error: 'Evento não encontrado' });
    } else {
      reply.send({ message: 'Evento excluído com sucesso' });
    }
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao excluir evento' });
  }
});

const fetch = async (request, reply) => {
  try {
    // Faz a requisição GET para a API externa
    const response = await axios.get('https://micronode-production.up.railway.app/api/funcionario');
    
    // Obtém os dados da resposta
    const funcionarios = response.data;

    // Extrai apenas os IDs de todos os funcionários
    const ids = funcionarios.map(funcionario => funcionario.id);

    // Seleciona um ID aleatório
    const randomId = ids[Math.floor(Math.random() * ids.length)];

    // Retorna o ID aleatório
    reply.send({ randomId });
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao buscar Funcionarios', details: err.message });
  }
};

// Inicializar o Servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Servidor rodando na porta 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
