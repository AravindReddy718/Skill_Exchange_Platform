import { getOverviewData } from "./overview.service.js";

/**
 * GET /api/admin/overview
 * Returns platform stats and chart data for the admin dashboard.
 */
export const getOverview = async (req, res, next) => {
  try {
    const data = await getOverviewData();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
