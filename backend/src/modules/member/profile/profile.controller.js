
import {
  getMyProfile,
  updateMyProfile,
  updateMySkills,
  getAvailableSkills,
} from "./profile.service.js";

export const getProfile = async (req, res, next) => {
  try {
    const profile = await getMyProfile(req.user._id);

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await updateMyProfile(
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};


export const updateSkills = async (req, res, next) => {
  try {
    const profile = await updateMySkills(
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Skills updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSkillsController = async (req, res, next) => {
  try {
    const skills = await getAvailableSkills();

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};