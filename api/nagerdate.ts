import { holidaysHandler } from './holidays';

/**
 * Nager.Date Dedicated Endpoint
 * GET /api/nagerdate
 * Pulls live data from: https://date.nager.at/api/v3/PublicHolidays/2026/SG
 */
export default holidaysHandler;
export { holidaysHandler as nagerDateHandler };
