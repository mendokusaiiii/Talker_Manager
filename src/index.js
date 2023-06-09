const express = require('express');

const fs = require('fs').promises;
const path = require('path');

const { emailValidate, passwordValidate } = require('./middlewares/validators');
const tokens = require('./middlewares/tokenGenerator');
const { 
  speakerName, 
  speakerAge, 
  speakerRate, 
  speakerTalk, 
  speakerWatched,
} = require('./middlewares/speakerValidate');

const authentications = require('./middlewares/authenticator');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const talkerObj = path.resolve(__dirname, 'talker.json');

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.post('/login', emailValidate, passwordValidate, (_req, res) => {
  const token = tokens();
  return res.status(200).send({ token });
});

app.get('/talker/search', authentications, async (req, res) => {
  const { q } = req.query;
  const talkerList = JSON.parse(await fs.readFile(talkerObj));

  if (!q || !q.length) {
    return res.status(200).json(talkerList);
  }
  const search = q.toLowerCase();
  const searchList = talkerList.filter((talkers) => talkers.name
    .toLowerCase().includes(search));
  if (searchList.length === 0) {
    return res.status(200).json([]);
  }
  return res.status(200).json(searchList);
});

app.get('/talker', async (_req, res) => {
  const talkerList = await fs.readFile(talkerObj);
  const response = await JSON.parse(talkerList);
  return res.status(200).json(response);
  });

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkerList = await fs.readFile(talkerObj);
  const response = await JSON.parse(talkerList);
  const talker = response.find((item) => item.id === Number(id));

  if (talker) {
    return res.status(200).send(talker);
  }

  return res.status(404).send({ message: 'Pessoa palestrante não encontrada' });
});

  app.post('/talker', authentications, speakerName, speakerAge, speakerTalk,
speakerWatched, speakerRate, async (req, res) => {
  const talker = { ...req.body };
  const talkerList = await fs.readFile(talkerObj);
  const response = await JSON.parse(talkerList);
  const speakerId = response.length + 1;
  const currentSpeaker = { ...talker, id: speakerId };
  const newTalkerList = [...response, currentSpeaker];
  await fs.writeFile(talkerObj, JSON.stringify(newTalkerList));
  res.status(201).json(currentSpeaker);
});

app.put('/talker/:id', authentications, speakerName, speakerAge, speakerTalk,
  speakerWatched, speakerRate, async (req, res) => {
  const { id } = req.params;
  const speakerUpdate = { ...req.body };
  const currentSpeaker = { ...speakerUpdate, id: Number(id) };
  const talkerList = await fs.readFile(talkerObj);
  const otherTalkers = talkerList.filter((element) => element.id !== Number(id));
  const newList = [...otherTalkers, currentSpeaker];
  await fs.writeFile(talkerObj, JSON.stringify(newList));
  res.status(200).json(currentSpeaker);
});

app.delete('/talker/:id', authentications, async (req, res) => {
  const { id } = req.params;
  const talkerList = JSON.parse(await fs.readFile(talkerObj));
  const newList = talkerList.filter((item) => item.id !== Number(id));
  await fs.writeFile(talkerObj, JSON.stringify(newList));
  res.status(204).json();
});

app.listen(PORT, () => {
  console.log('Online');
});
