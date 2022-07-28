import express, { Request, Response } from 'express';
import next from 'next';
import sslRedirect, { ENVIRONMENT } from './sslRedirect';

const dev = (process.env.NEXT_PUBLIC_ENV as unknown as ENVIRONMENT) === ENVIRONMENT.LOCAL;
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

(async () => {
  try {
    await app.prepare();
    const server = express();
    // Express's middleware to automatically redirect to 'https'.
    server.use(sslRedirect([ENVIRONMENT.PRODUCTION, ENVIRONMENT.STAGING]));
    server.all('*', (req: Request, res: Response) => {
      return handle(req, res);
    });
    server.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(`> Ready on localhost:${port} - env ${process.env.NEXT_PUBLIC_ENV}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
