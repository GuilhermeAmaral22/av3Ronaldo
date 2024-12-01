require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const mysql = require('mysql2/promise');

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
  const { titulo, descricao, data_evento, hora_evento, local } = request.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Eventos (titulo, descricao, data_evento, hora_evento, local) VALUES (?, ?, ?, ?, ?)',
      [titulo, descricao, data_evento, hora_evento, local]
    );
    reply.status(201).send({ id: result.insertId });
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao criar evento' });
  }
});

// PUT - Atualizar um evento
fastify.put('/eventos/:id', async (request, reply) => {
  const { id } = request.params;
  const { titulo, descricao, data_evento, hora_evento, local } = request.body;
  try {
    const [result] = await db.query(
      'UPDATE Eventos SET titulo = ?, descricao = ?, data_evento = ?, hora_evento = ?, local = ? WHERE id = ?',
      [titulo, descricao, data_evento, hora_evento, local, id]
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
