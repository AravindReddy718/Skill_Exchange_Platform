import User from "../../../models/User.js";
import Skill from "../../../models/Skill.js";
import ExchangeRequest from "../../../models/ExchangeRequest.js";
import Session from "../../../models/Session.js";
import Report from "../../../models/Report.js";

/**
 * Fetch platform-wide statistics and chart aggregations for the admin overview.
 */
export const getOverviewData = async () => {
  // Start window 6 months ago for the monthly activity chart
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    suspendedUsers,
    verifiedUsers,
    totalSkills,
    pendingExchanges,
    activeSwaps,
    scheduledSessions,
    completedSessions,
    pendingReports,
    popularSkills,
    monthlyExchanges,
    monthlyCompletedSessions,
  ] = await Promise.all([
    User.countDocuments({ role: "member" }),
    User.countDocuments({ role: "member", isSuspended: true }),
    User.countDocuments({ role: "member", isVerified: true }),
    Skill.countDocuments({ isActive: true }),
    ExchangeRequest.countDocuments({ status: "pending" }),
    ExchangeRequest.countDocuments({ status: "accepted" }),
    Session.countDocuments({ status: "scheduled" }),
    Session.countDocuments({ status: "completed" }),
    Report.countDocuments({ status: "pending" }),

    // Top 8 most-offered skills across members
    User.aggregate([
      { $match: { role: "member" } },
      { $unwind: "$skillsOffered" },
      { $group: { _id: "$skillsOffered.skill", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "skills",
          localField: "_id",
          foreignField: "_id",
          as: "skillInfo",
        },
      },
      { $unwind: "$skillInfo" },
      {
        $project: {
          _id: 0,
          skillId: "$_id",
          name: "$skillInfo.name",
          category: "$skillInfo.category",
          count: 1,
        },
      },
    ]),

    // Monthly exchange requests (last 6 months)
    ExchangeRequest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]),

    // Monthly completed sessions (last 6 months)
    Session.aggregate([
      { $match: { status: "completed", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Fill in all 6 months (even months with 0 activity) so the chart has no gaps
  const exchangeMap = new Map(
    monthlyExchanges.map((m) => [
      `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
      m.count,
    ])
  );
  const sessionMap = new Map(
    monthlyCompletedSessions.map((m) => [
      `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
      m.count,
    ])
  );

  const activityTimeline = [];
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(sixMonthsAgo.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    activityTimeline.push({
      month: key,
      exchanges: exchangeMap.get(key) || 0,
      completedSessions: sessionMap.get(key) || 0,
    });
  }

  return {
    stats: {
      totalUsers,
      suspendedUsers,
      verifiedUsers,
      totalSkills,
      pendingExchanges,
      activeSwaps,
      scheduledSessions,
      completedSessions,
      pendingReports,
    },
    charts: {
      popularSkills,
      activityTimeline,
    },
  };
};
