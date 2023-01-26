const express = require('express');

const fs = require('fs').promises;
const path = require('path');

const { emailValidate, passwordValidate } = require('./middlewares/validators');
const tokens = require('./middlewares/tokenGenerator');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.post('/login', emailValidate, passwordValidate, (_req, res) => {
  const token = tokens();
  return res.status(200).send({ token });
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkerList = await fs.readFile(path.resolve(__dirname, './talker.json'));
  const response = await JSON.parse(talkerList);
  const talker = response.find((item) => item.id === Number(id));

  if (talker) {
    return res.status(200).send(talker);
  }

  return res.status(404).send({ message: 'Pessoa palestrante não encontrada' });
});

app.get('/talker', async (_req, res) => {
  const talkerList = await fs.readFile(path.resolve(__dirname, './talker.json'));
  const response = await JSON.parse(talkerList);
  return res.status(200).json(response);
  });

app.listen(PORT, () => {
  console.log('Online');
});
