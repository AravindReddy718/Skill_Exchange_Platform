
import User from "../../../models/User.js";
import "../../../models/Skill.js";
import Skill from "../../../models/Skill.js";

export const getMyProfile = async (userId) => {
  const user = await User.findById(userId)
    .select("-password")
    .populate("skillsOffered.skill", "name category")
    .populate("skillsWanted", "name category");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};


export const updateMyProfile = async (userId, profileData) => {
  const allowedFields = [
    "name",
    "bio",
    "profilePicture",
    "availability",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (profileData[field] !== undefined) {
      updates[field] = profileData[field];
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    {
        returnDocument: "after",
        runValidators: true,
    }
  )
    .select("-password")
    .populate("skillsOffered.skill", "name category")
    .populate("skillsWanted", "name category");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};



export const updateMySkills = async (userId, skillsData) => {
  const { skillsOffered, skillsWanted } = skillsData;

  // Validate offered skill IDs
  const offeredIds = skillsOffered.map((item) => item.skill);
  const wantedIds = skillsWanted;

  // Prevent duplicate skills
  if (new Set(offeredIds).size !== offeredIds.length) {
    const error = new Error("Duplicate offered skills are not allowed");
    error.statusCode = 400;
    throw error;
  }

  if (new Set(wantedIds).size !== wantedIds.length) {
    const error = new Error("Duplicate wanted skills are not allowed");
    error.statusCode = 400;
    throw error;
  }

  // A skill cannot be both offered and wanted
  const offeredSet = new Set(offeredIds.map(String));

  if (wantedIds.some((id) => offeredSet.has(String(id)))) {
    const error = new Error("A skill cannot be both offered and wanted");
    error.statusCode = 400;
    throw error;
  }

  // Validate that all referenced skills exist and are active
  const allSkillIds = [...offeredIds, ...wantedIds];

  const validSkills = await Skill.find({
    _id: { $in: allSkillIds },
    isActive: true,
  }).select("_id");

  if (validSkills.length !== new Set(allSkillIds.map(String)).size) {
    const error = new Error("One or more skills are invalid or inactive");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        skillsOffered,
        skillsWanted,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  )
    .select("-password")
    .populate("skillsOffered.skill", "name category")
    .populate("skillsWanted", "name category");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

