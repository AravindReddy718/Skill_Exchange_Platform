
import User from "../../../models/User.js";
import Skill from "../../../models/Skill.js";

const VALID_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const validateAvailability = (availability) => {
  if (
    !availability ||
    typeof availability !== "object" ||
    Array.isArray(availability)
  ) {
    throw createError("Availability must be an object");
  }

  const { days, timezone = "Asia/Kolkata" } = availability;

  if (!Array.isArray(days)) {
    throw createError("Availability days must be an array");
  }

  if (typeof timezone !== "string" || !timezone.trim()) {
    throw createError("A valid timezone is required");
  }

  try {
    Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    throw createError("Invalid timezone");
  }

  const seenDays = new Set();

  for (const dayEntry of days) {
    if (
      !dayEntry ||
      typeof dayEntry !== "object" ||
      Array.isArray(dayEntry)
    ) {
      throw createError("Each availability day must be an object");
    }

    const { day, slots } = dayEntry;

    if (!VALID_DAYS.includes(day)) {
      throw createError(`Invalid weekday: ${day}`);
    }

    if (seenDays.has(day)) {
      throw createError(`Duplicate weekday: ${day}`);
    }

    seenDays.add(day);

    if (!Array.isArray(slots)) {
      throw createError(`Slots must be an array for ${day}`);
    }

    const intervals = [];

    for (const slot of slots) {
      if (
        !slot ||
        typeof slot.start !== "string" ||
        typeof slot.end !== "string" ||
        !TIME_REGEX.test(slot.start) ||
        !TIME_REGEX.test(slot.end)
      ) {
        throw createError(`Invalid time format for ${day}. Use HH:mm`);
      }

      const start = timeToMinutes(slot.start);
      const end = timeToMinutes(slot.end);

      if (end <= start) {
        throw createError(
          `End time must be after start time for ${day}`
        );
      }

      intervals.push({ start, end });
    }

    intervals.sort((a, b) => a.start - b.start);

    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i].start < intervals[i - 1].end) {
        throw createError(`Overlapping time slots found for ${day}`);
      }
    }
  }

  return { days, timezone };
};

export const getMyProfile = async (userId) => {
  const user = await User.findById(userId)
    .select("-password")
    .populate("skillsOffered.skill", "name category")
    .populate("skillsWanted", "name category");

  if (!user) {
    throw createError("User not found", 404);
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
      updates[field] =
        field === "availability"
          ? validateAvailability(profileData[field])
          : profileData[field];
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
    throw createError("User not found", 404);
  }

  return user;
};

export const updateMySkills = async (userId, skillsData) => {
  const { skillsOffered, skillsWanted } = skillsData;

  if (!Array.isArray(skillsOffered) || !Array.isArray(skillsWanted)) {
    throw createError("skillsOffered and skillsWanted must be arrays");
  }

  const offeredIds = skillsOffered.map((item) => item.skill);
  const wantedIds = skillsWanted;

  if (new Set(offeredIds.map(String)).size !== offeredIds.length) {
    throw createError("Duplicate offered skills are not allowed");
  }

  if (new Set(wantedIds.map(String)).size !== wantedIds.length) {
    throw createError("Duplicate wanted skills are not allowed");
  }

  const offeredSet = new Set(offeredIds.map(String));

  if (wantedIds.some((id) => offeredSet.has(String(id)))) {
    throw createError("A skill cannot be both offered and wanted");
  }

  const allSkillIds = [...offeredIds, ...wantedIds];

  const validSkills = await Skill.find({
    _id: { $in: allSkillIds },
    isActive: true,
  }).select("_id");

  if (validSkills.length !== new Set(allSkillIds.map(String)).size) {
    throw createError("One or more skills are invalid or inactive");
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
    throw createError("User not found", 404);
  }

  return user;
};


export const getAvailableSkills = async () => {
  const skills = await Skill.find({ isActive: true })
    .select("name category description")
    .sort({ category: 1, name: 1 });

  return skills;
};

