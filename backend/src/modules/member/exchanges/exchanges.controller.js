
import {
  createExchangeRequest,
  getSentRequests,
  getReceivedRequests,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
} from "./exchanges.service.js";

export const sendRequest = async (req, res, next) => {
  try {
    const request = await createExchangeRequest(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: "Exchange request sent successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const getSent = async (req, res, next) => {
  try {
    const requests = await getSentRequests(req.user._id);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getReceived = async (req, res, next) => {
  try {
    const requests = await getReceivedRequests(req.user._id);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const request = await acceptExchangeRequest(
      req.params.requestId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Exchange request accepted",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const request = await rejectExchangeRequest(
      req.params.requestId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Exchange request rejected",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRequest = async (req, res, next) => {
  try {
    const request = await cancelExchangeRequest(
      req.params.requestId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Exchange request cancelled",
      request,
    });
  } catch (error) {
    next(error);
  }
};
