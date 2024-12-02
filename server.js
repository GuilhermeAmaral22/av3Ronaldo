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

// POST - Criar um novo evento (sem vincular funcionário)
fastify.post('/eventos', async (request, reply) => {
  const { id, titulo, descricao, data_evento, hora_evento, local, funcionarioID } = request.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Eventos (id, titulo, descricao, data_evento, hora_evento, local, funcionarioID) VALUES (?, ?, ?, ?, ?, ?)',
      [id, titulo, descricao, data_evento, hora_evento, local, funcionarioID]
    );
    reply.status(201).send({ id: result.insertId });
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao criar evento' });
  }
  console.log(request.body);
});

// PUT - Vincular um funcionário a um evento já existente
fastify.put('/eventos/:id/vincular-funcionario', async (request, reply) => {
  const { id } = request.params;
  try {
    // Busca um funcionário aleatório
    const funcionarioID = await fetchFuncionarioID();

    // Atualiza o evento com o funcionarioID
    const [result] = await db.query(
      'UPDATE Eventos SET funcionarioID = ? WHERE id = ?',
      [funcionarioID, id]
    );

    if (result.affectedRows === 0) {
      reply.status(404).send({ error: 'Evento não encontrado' });
    } else {
      reply.send({ message: `Funcionário com ID ${funcionarioID} vinculado ao evento com sucesso.` });
    }
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao vincular funcionário ao evento', details: err.message });
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

// Função para buscar um funcionarioID aleatório da API externa
const fetchFuncionarioID = async () => {
  try {
    const response = await axios.get('https://micronode-production.up.railway.app/api/funcionario');
    const funcionarios = response.data;
    const ids = funcionarios.map(funcionario => funcionario.id);
    return ids[Math.floor(Math.random() * ids.length)];
  } catch (err) {
    throw new Error('Erro ao buscar funcionarios: ' + err.message);
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
