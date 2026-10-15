import type { Request, Response } from 'express';

/**
 * Bus Arrivals Endpoint
 * GET /api/busarrivals?busStopCode=09048&serviceNo=14
 * 
 * Fetches real-time bus arrivals for retail staff transit planning.
 * API key is read strictly from process.env (never hardcoded).
 */
export async function busArrivalsHandler(req: Request, res: Response) {
  try {
    const busStopCode = (req.query.busStopCode || req.query.BusStopCode || '09048') as string;
    const serviceNo = (req.query.serviceNo || req.query.ServiceNo || '') as string;

    // API keys loaded from environment variables (no hardcoded keys)
    const apiKey = process.env.LTA_DATAMALL_API_KEY || process.env.BUS_API_KEY || process.env.TRANSIT_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        status: 'configured_waiting_for_key',
        message: 'No bus API key detected in environment variables. Set LTA_DATAMALL_API_KEY in your .env or environment to enable live upstream transit data.',
        busStopCode,
        serviceNo,
        timestamp: new Date().toISOString(),
        mockArrivals: [
          {
            serviceNo: serviceNo || '14',
            operator: 'SBST',
            nextBus: {
              estimatedArrival: new Date(Date.now() + 4 * 60000).toISOString(),
              load: 'Seats Available',
              feature: 'WAB',
              type: 'Double Deck',
            },
            subsequentBus: {
              estimatedArrival: new Date(Date.now() + 12 * 60000).toISOString(),
              load: 'Standing Available',
              feature: 'WAB',
              type: 'Single Deck',
            },
          },
          {
            serviceNo: '124',
            operator: 'SBST',
            nextBus: {
              estimatedArrival: new Date(Date.now() + 7 * 60000).toISOString(),
              load: 'Seats Available',
              feature: 'WAB',
              type: 'Single Deck',
            },
          },
        ],
      });
    }

    // Call upstream LTA DataMall BusArrival endpoint
    const url = new URL('https://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2');
    url.searchParams.set('BusStopCode', busStopCode);
    if (serviceNo) {
      url.searchParams.set('ServiceNo', serviceNo);
    }

    const upstreamResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'AccountKey': apiKey,
        'accept': 'application/json',
      },
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return res.status(upstreamResponse.status).json({
        status: 'upstream_error',
        statusCode: upstreamResponse.status,
        message: errorText || 'Failed to fetch upstream bus arrivals',
      });
    }

    const data = await upstreamResponse.json();
    return res.status(200).json({
      status: 'success',
      busStopCode,
      timestamp: new Date().toISOString(),
      services: data?.Services || [],
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Error processing bus arrivals request',
    });
  }
}

export default busArrivalsHandler;
