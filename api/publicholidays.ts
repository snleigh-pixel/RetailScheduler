import type { Request, Response } from 'express';

/**
 * Serverless Connection: Nager.Date Public Holidays
 * Upstream endpoint:
 * GET https://date.nager.at/api/v3/PublicHolidays/2026/SG
 * 
 * Stored in /api/publicholidays.ts
 * No keys hardcoded. Optional keys read via process.env.
 */
export default async function handler(req: Request, res: Response) {
  try {
    const year = (req.query?.year || '2026') as string;
    const countryCode = ((req.query?.countryCode || req.query?.country || 'SG') as string).toUpperCase();

    const targetUrl = `https://date.nager.at/api/v3/PublicHolidays/${encodeURIComponent(year)}/${encodeURIComponent(countryCode)}`;

    // Key handling: read from process.env if provided later by user, never hardcoded
    const apiKey = process.env.NAGER_DATE_API_KEY || process.env.DATE_API_KEY;
    const headers: Record<string, string> = {
      'accept': 'application/json',
      'user-agent': 'ShiftFlow-Retail-Scheduler/1.0',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['X-Api-Key'] = apiKey;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: true,
        statusCode: response.status,
        message: errorText || `Nager.Date responded with status ${response.status}`,
        targetUrl,
      });
    }

    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err?.message || 'Failed to connect to Nager.Date API',
    });
  }
}
