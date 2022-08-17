import express from 'express';
import fetch from 'node-fetch';
import htmlExpress from 'html-express-js';
import bodyParser from 'body-parser';
import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 3001
const app = express();

app.engine(
  'js',
  htmlExpress({
    includesDir: 'includes',
  })
);
// use engine
app.set('views', `${__dirname}/public`);
app.set('view engine', 'js');
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json({
  limit: '50mb',
}));

const requests = [];
let activeRequestUrl = '';
const ALLOW_PASSTHROUGH = process.argv[2] || false;

const getActiveRequest = (url) => requests.find(r => r.url === url);

app.get('/stats2/*', async (req, res) => {
  const url = `${process.env.STATS_DOMAIN}${req.url}`;
  try {
    const response = await fetch(url, req.query);
    const data = await response.json();
    activeRequestUrl = url;
    requests.push({
      url,
      data,
      responseFromUi: null,
    });
    if (ALLOW_PASSTHROUGH) {
      return res.json(data);
    }

  } catch (error) {
    console.log(error);
  }

  const waitForUi = () => {
    if (requests.length === 0) {
      return;
    }
    const activeRequest = getActiveRequest(url);
    activeRequestUrl = url;
    if (!activeRequest.responseFromUi) {
      setTimeout(waitForUi, 1000);
    } else {
      res.send(activeRequest.responseFromUi);
    }
  };

  waitForUi();

})

app.get('/json-editor', (req, res) => {
  const allRequestsHandled = requests.every(request => request.responseFromUi);
  const pendingRequests = requests && requests.filter(request => !request.responseFromUi).length
  if (!activeRequestUrl || allRequestsHandled) {
    res.render('json-editor', { data: { isLoading: true } });
  } else {
    const dataToSend = getActiveRequest(activeRequestUrl).data;
    res.render('json-editor', { data: dataToSend, activeRequestUrl, pendingRequests });
  }
})

app.post('/new-json', ({ body }, res) => {
  const { newData, activeRequestUrl } = body;
  const request = getActiveRequest(activeRequestUrl);
  request.responseFromUi = newData;
  res.send('ok');
})

app.get('/clear-requests', (req, res) => {
  requests.length = 0;
  res.send('ok');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})