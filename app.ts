import express, { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import Redis from 'ioredis';
import * as util from 'util';

const app = express();

const client = Redis.createClient();
const getAsync = util.promisify(client.get).bind(client);

const cachedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // await client.connect();
    const cachedData = await getAsync('posts');
    if (cachedData !== undefined && cachedData !== null) {
      res.send(JSON.parse(cachedData));
    } else {
      next();
    }
  } catch (error) {
    res.send(error);
  }
};

app.get('/', cachedMiddleware, async (req: Request, res: Response) => {
  const resp = await axios.get('https://jsonplaceholder.typicode.com/todos');

  const data = resp.data;

  client.setex('posts', 3600, JSON.stringify(data));
  res.send(data);
});

app.listen(3003, () => {
  console.log('server is running on port ' + 3003);
});
