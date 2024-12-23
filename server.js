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
fastify.get('/eventos', async (request, reply) => {
  try {
    const [rows] = await db.query('SELECT * FROM Eventos');
    reply.send(rows);
  } catch (err) {
    console.error('Erro ao buscar eventos:', err); // Log detalhado no console
    reply.status(500).send({
      error: 'Erro ao buscar eventos',
      details: err.message, // Inclui a mensagem de erro original
    });
  }
});

fastify.post('/eventos', async (request, reply) => {
  const {titulo, descricao, data_evento, hora_evento, local, funcionarioID = null } = request.body; // Valor padrão: null
  try {
    const [result] = await db.query(
      'INSERT INTO Eventos (titulo, descricao, data_evento, hora_evento, local, funcionarioID) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo, descricao, data_evento, hora_evento, local, funcionarioID]
    );
    reply.status(201).send({ id: result.insertId });
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao criar evento', details: err.message });
  }
});

fastify.put('/eventos/:id/vincular-funcionario', async (request, reply) => {
  const { id } = request.params;
  try {
    const funcionarioID = await fetchFuncionarioID();

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
    console.error('Erro ao vincular funcionário ao evento:', err); // Log detalhado no console
    reply.status(500).send({
      error: 'Erro ao vincular funcionário ao evento',
      details: err.message, // Inclui a mensagem de erro original
    });
  }
});

fastify.put('/eventos/:id', async (request, reply) => {
  const { titulo, descricao, data_evento, hora_evento, local, funcionarioID = null } = request.body; // Note que `funcionarioID` está separado
  const { id } = request.params;

  try {
    const [result] = await db.query(
      'UPDATE Eventos SET titulo = ?, descricao = ?, data_evento = ?, hora_evento = ?, local = ?, funcionarioID = ? WHERE id = ?',
      [titulo, descricao, data_evento, hora_evento, local, funcionarioID, id] // Incluindo `funcionarioID` e `id` nos parâmetros corretamente
    );

    if (result.affectedRows === 0) {
      reply.status(404).send({ error: 'Evento não encontrado' });
    } else {
      reply.send({ message: 'Evento atualizado com sucesso' });
    }
  } catch (err) {
    console.error('Erro ao atualizar o evento:', err);
    reply.status(500).send({
      error: 'Erro ao atualizar o evento',
      details: err.message,
    });
  }
});


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
    console.error('Erro ao excluir evento:', err); // Log detalhado no console
    reply.status(500).send({
      error: 'Erro ao excluir evento',
      details: err.message, // Inclui a mensagem de erro original
    });
  }
});

const fetchFuncionarioID = async () => {
  try {
    const response = await axios.get('https://micronode-production.up.railway.app/api/funcionario');
    const funcionarios = response.data;
    const ids = funcionarios.map(funcionario => funcionario.id);
    return ids[Math.floor(Math.random() * ids.length)];
  } catch (err) {
    console.error('Erro ao buscar funcionários:', err); // Log detalhado no console
    throw new Error('Erro ao buscar funcionários: ' + err.message);
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
