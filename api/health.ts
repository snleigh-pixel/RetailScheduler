import type { Request, Response } from 'express';

/**
 * Health Check Endpoint
 * GET /api/health
 */
export async function healthHandler(req: Request, res: Response) {
  try {
    return res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'retail-scheduler-api',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Internal Server Error',
    });
  }
}

export default healthHandler;
