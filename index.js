import express from 'express';
import fetch from 'node-fetch';
import { resolve } from 'path';
import htmlExpress from 'html-express-js';
import bodyParser from 'body-parser';

const port = 3001;
const app = express();
const __dirname = resolve();

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
const DISABLE_DEBUGGER = process.argv[2] || false;
console.log('Debugger is', DISABLE_DEBUGGER ? 'disabled' : 'enabled');

const getActiveRequest = (url) => requests.find(r => r.url === url);

app.get('/stats2/*', async (req, res) => {
  const url = `http://ca4-qa.global.nba.com${req.url}`;
  try {
    const response = await fetch(url, req.query);
    const data = await response.json();
    activeRequestUrl = url;
    requests.push({
      url,
      data,
      responseFromUi: null,
    });
    if (DISABLE_DEBUGGER) {
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