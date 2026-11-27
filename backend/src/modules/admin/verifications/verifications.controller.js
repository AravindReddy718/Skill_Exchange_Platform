import {
  getVerifications,
  reviewVerificationRequest,
} from "./verifications.service.js";


export const listVerifications = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await getVerifications({ status, page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const reviewVerification = async (req, res, next) => {
  try {
    const { verificationId } = req.params;
    const { status, rejectionReason } = req.body || {};

    const verification = await reviewVerificationRequest({
      verificationId,
      status,
      rejectionReason,
      currentAdminId: req.user._id,
    });

    res.status(200).json({
      message:
        status === "approved"
          ? "Verification approved and user badge granted."
          : "Verification rejected.",
      verification,
    });
  } catch (error) {
    next(error);
  }
};
