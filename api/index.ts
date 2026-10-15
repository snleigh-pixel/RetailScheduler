import { Router } from 'express';
import { healthHandler } from './health';
import { busArrivalsHandler } from './busarrivals';
import { holidaysHandler } from './holidays';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', healthHandler);

// Bus arrivals endpoint
apiRouter.get('/busarrivals', busArrivalsHandler);

// Nager.Date Public Holidays endpoints
apiRouter.get('/holidays', holidaysHandler);
apiRouter.get('/nagerdate', holidaysHandler);
apiRouter.get('/v3/PublicHolidays/:year?/:countryCode?', (req, res) => {
  if (req.params.year) req.query.year = req.params.year;
  if (req.params.countryCode) req.query.countryCode = req.params.countryCode;
  return holidaysHandler(req, res);
});

export default apiRouter;
export { healthHandler, busArrivalsHandler, holidaysHandler };
