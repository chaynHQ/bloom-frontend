import { NextFunction, Request, Response } from 'express';

export enum ENVIRONMENT {
  LOCAL = 'local',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

const sslRedirect = (environments: ENVIRONMENT[], status = 302) => {
  const currentEnv = process.env.NEXT_PUBLIC_ENV;
  // an ENV variable could be undefined so you need to cast as unknown and then Environment for typescript to be happy
  const isCurrentEnv = environments.includes(currentEnv as unknown as ENVIRONMENT);
  return (req: Request, res: Response, next: NextFunction) => {
    if (isCurrentEnv) {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        res.redirect(status, 'https://' + req.hostname + req.originalUrl);
        next();
      } else {
        next();
      }
    } else next();
  };
};

export default sslRedirect;
