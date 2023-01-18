import express from 'express';
import http from 'http';
// const axios = require('axios');
import axios from 'axios';
import Logging from './library/Logging';
import { config } from './config/config';

const router = express();

const StartServer = () => {
  router.use((req, res, next) => {
    Logging.info(`Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
    res.on('finish', () => {
      Logging.info(`Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
    });

    next();
  });

  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());

  router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
    }

    next();
  });

  router.get('/api/search', async (req, res, next) => {
    try {
      const response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${process.env.TOKEN}&cx=${process.env.CX}&q=${req.query.str}`);
      console.log(response.data);
      res.status(200).json({ response: response.data });
    } catch (error) {
      console.error(error);
    }
  });

  router.use((req, res, next) => {
    const error = new Error('not found');
    Logging.error(error);

    return res.status(404).json({ message: error.message });
  });

  http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}.`));
};

StartServer();
