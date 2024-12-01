

const fastify = require('fastify')({ logger: true });

fastify.register(require('fastify-mysql'), {
  promise: true,
  connectionString: 'mysql://root:DnxDVFNeRldnmioBCWZLEkPUEPNgKXIP@junction.proxy.rlwy.net:48615/railway'
});

// Rotas

// GET - Listar todos os eventos
fastify.get('/eventos', async (request, reply) => {
  const connection = await fastify.mysql.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM eventos');
    reply.send(rows);
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao buscar eventos' });
  } finally {
    connection.release();
  }
});

// POST - Criar um novo evento
fastify.post('/eventos', async (request, reply) => {
  const { titulo, descricao, data_evento, hora_evento, local } = request.body;
  const connection = await fastify.mysql.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO eventos (titulo, descricao, data_evento, hora_evento, local) VALUES (?, ?, ?, ?, ?)',
      [titulo, descricao, data_evento, hora_evento, local]
    );
    reply.status(201).send({ id: result.insertId });
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao criar evento' });
  } finally {
    connection.release();
  }
});

// PUT - Atualizar um evento
fastify.put('/eventos/:id', async (request, reply) => {
  const { id } = request.params;
  const { titulo, descricao, data_evento, hora_evento, local } = request.body;
  const connection = await fastify.mysql.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE eventos SET titulo = ?, descricao = ?, data_evento = ?, hora_evento = ?, local = ? WHERE id = ?',
      [titulo, descricao, data_evento, hora_evento, local, id]
    );
    reply.send({ message: 'Evento atualizado com sucesso' });
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao atualizar evento' });
  } finally {
    connection.release();
  }
});

// DELETE - Excluir um evento
fastify.delete('/eventos/:id', async (request, reply) => {
  const { id } = request.params;
  const connection = await fastify.mysql.getConnection();
  try {
    await connection.query('DELETE FROM eventos WHERE id = ?', [id]);
    reply.send({ message: 'Evento excluído com sucesso' });
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao excluir evento' });
  } finally {
    connection.release();
  }
});

// Inicializar o Servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Servidor rodando na porta 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();