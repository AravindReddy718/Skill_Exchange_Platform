import {
  getExchanges,
  forceCancelExchangeRequest,
  getSessions,
  forceCancelSessionById,
} from "./exchanges.service.js";

/**
 * GET /api/admin/exchanges
 */
export const listExchanges = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await getExchanges({ status, page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/exchanges/:exchangeId/force-cancel
 */
export const forceCancelExchange = async (req, res, next) => {
  try {
    const { exchangeId } = req.params;
    const { exchange, cancelledSessionsCount } =
      await forceCancelExchangeRequest({ exchangeId });

    res.status(200).json({
      message: "Exchange force-cancelled successfully.",
      exchange,
      cancelledSessionsCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/exchanges/sessions
 */
export const listSessions = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await getSessions({ status, page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/exchanges/sessions/:sessionId/force-cancel
 */
export const forceCancelSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await forceCancelSessionById({ sessionId });

    res.status(200).json({
      message: "Session force-cancelled successfully.",
      session,
    });
  } catch (error) {
    next(error);
  }
};
