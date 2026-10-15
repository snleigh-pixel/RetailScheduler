import type { Request, Response } from 'express';

/**
 * Nager.Date Public Holidays Live Connection
 * GET /api/holidays
 * GET /api/holidays?year=2026&countryCode=SG
 * 
 * Upstream endpoint:
 * GET https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}
 * Default: https://date.nager.at/api/v3/PublicHolidays/2026/SG
 * 
 * Supports process.env.NAGER_DATE_API_KEY if configured (no hardcoded keys).
 */
export async function holidaysHandler(req: Request, res: Response) {
  try {
    const year = (req.query.year || '2026') as string;
    const countryCode = ((req.query.countryCode || req.query.country || 'SG') as string).toUpperCase();

    // Construct Nager.Date upstream endpoint
    const nagerUrl = `https://date.nager.at/api/v3/PublicHolidays/${encodeURIComponent(year)}/${encodeURIComponent(countryCode)}`;

    // Optional API key or custom auth headers from environment variables
    const apiKey = process.env.NAGER_DATE_API_KEY || process.env.DATE_API_KEY;
    const headers: Record<string, string> = {
      'accept': 'application/json',
      'user-agent': 'ShiftFlow-Retail-Scheduler/1.0',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['X-Api-Key'] = apiKey;
    }

    const upstreamResponse = await fetch(nagerUrl, {
      method: 'GET',
      headers,
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return res.status(upstreamResponse.status).json({
        status: 'error',
        statusCode: upstreamResponse.status,
        message: errorText || `Failed to fetch holidays from Nager.Date for ${year}/${countryCode}`,
        upstreamUrl: nagerUrl,
      });
    }

    const holidaysData = await upstreamResponse.json();

    // Cache header for 24h
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    return res.status(200).json({
      status: 'success',
      source: 'Nager.Date API v3',
      endpoint: nagerUrl,
      year: parseInt(year, 10),
      countryCode,
      totalHolidays: Array.isArray(holidaysData) ? holidaysData.length : 0,
      timestamp: new Date().toISOString(),
      data: holidaysData,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Error connecting to Nager.Date API',
    });
  }
}

export default holidaysHandler;
