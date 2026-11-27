
import { discoverMembers } from "./discovery.service.js";

export const getDiscoverMembers = async (req, res, next) => {
  try {
    const recommendations = await discoverMembers(req.user._id);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};
