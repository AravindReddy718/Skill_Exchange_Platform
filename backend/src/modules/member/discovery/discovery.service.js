
import User from "../../../models/User.js";

const LEVEL_SCORES = {
  beginner: 5,
  intermediate: 10,
  advanced: 15,
  expert: 20,
};

const roundScore = (score) => Math.round(score * 100) / 100;

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const calculateAvailability = (availabilityA, availabilityB) => {
  if (
    !availabilityA ||
    !availabilityB ||
    availabilityA.timezone !== availabilityB.timezone
  ) {
    return { score: 0, overlaps: [] };
  }

  const daysA = availabilityA.days || [];
  const daysB = availabilityB.days || [];

  let totalA = 0;
  let totalB = 0;
  let overlapMinutes = 0;

  const overlaps = [];

  for (const entry of daysA) {
    for (const slot of entry.slots || []) {
      totalA += timeToMinutes(slot.end) - timeToMinutes(slot.start);
    }
  }

  for (const entry of daysB) {
    for (const slot of entry.slots || []) {
      totalB += timeToMinutes(slot.end) - timeToMinutes(slot.start);
    }
  }

  const candidateDays = new Map(
    daysB.map((entry) => [entry.day, entry.slots || []])
  );

  for (const entryA of daysA) {
    const slotsB = candidateDays.get(entryA.day);

    if (!slotsB) continue;

    let dayOverlap = 0;

    for (const slotA of entryA.slots || []) {
      for (const slotB of slotsB) {
        const start = Math.max(
          timeToMinutes(slotA.start),
          timeToMinutes(slotB.start)
        );

        const end = Math.min(
          timeToMinutes(slotA.end),
          timeToMinutes(slotB.end)
        );

        if (end > start) {
          const duration = end - start;
          overlapMinutes += duration;
          dayOverlap += duration;
        }
      }
    }

    if (dayOverlap > 0) {
      overlaps.push({
        day: entryA.day,
        minutes: dayOverlap,
      });
    }
  }

  if (totalA === 0 || totalB === 0) {
    return { score: 0, overlaps };
  }

  // Symmetric Dice similarity score.
  const score = (2 * overlapMinutes) / (totalA + totalB);

  return {
    score: roundScore(score * 20),
    overlaps,
  };
};

export const discoverMembers = async (currentUserId) => {
  const currentUser = await User.findById(currentUserId)
    .populate("skillsOffered.skill", "name category")
    .populate("skillsWanted", "name category");

  if (!currentUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const candidates = await User.find({
    _id: { $ne: currentUserId },
    role: "member",
    isSuspended: false,
  })
    .select(
      "name username bio profilePicture isVerified availability skillsOffered skillsWanted"
    )
    .populate("skillsOffered.skill", "name category")
    .populate("skillsWanted", "name category");

  const currentOffered = new Map(
    currentUser.skillsOffered
      .filter((item) => item.skill)
      .map((item) => [
        item.skill._id.toString(),
        {
          level: item.level,
          skill: item.skill,
        },
      ])
  );

  const currentWanted = new Map(
    currentUser.skillsWanted
      .filter(Boolean)
      .map((skill) => [skill._id.toString(), skill])
  );

  const recommendations = [];

  for (const candidate of candidates) {
    const candidateOffered = new Map(
      candidate.skillsOffered
        .filter((item) => item.skill)
        .map((item) => [
          item.skill._id.toString(),
          {
            level: item.level,
            skill: item.skill,
          },
        ])
    );

    const candidateWanted = new Map(
      candidate.skillsWanted
        .filter(Boolean)
        .map((skill) => [skill._id.toString(), skill])
    );

    // Skills the candidate can teach the current user.
    const skillsYouCanLearn = [...currentWanted.keys()]
      .filter((id) => candidateOffered.has(id))
      .map((id) => ({
        skill: currentWanted.get(id),
        level: candidateOffered.get(id).level,
      }));

    // Skills the current user can teach the candidate.
    const skillsCandidateCanLearn = [...candidateWanted.keys()]
      .filter((id) => currentOffered.has(id))
      .map((id) => ({
        skill: candidateWanted.get(id),
        level: currentOffered.get(id).level,
      }));

    const learnScore =
      currentWanted.size > 0
        ? (skillsYouCanLearn.length / currentWanted.size) * 30
        : 0;

    const teachScore =
      candidateWanted.size > 0
        ? (skillsCandidateCanLearn.length / candidateWanted.size) * 30
        : 0;

    const skillScore = learnScore + teachScore;

    // Skip candidates without any reciprocal skill compatibility.
    if (skillScore === 0) continue;

    // Teaching proficiency score.
    const matchedLevels = [
      ...skillsYouCanLearn.map((item) => item.level),
      ...skillsCandidateCanLearn.map((item) => item.level),
    ];

    const proficiencyScore =
      matchedLevels.reduce(
        (total, level) => total + (LEVEL_SCORES[level] || 0),
        0
      ) / matchedLevels.length;

    // Weekly availability compatibility.
    const availability = calculateAvailability(
      currentUser.availability,
      candidate.availability
    );

    const totalScore = roundScore(
      skillScore + proficiencyScore + availability.score
    );

    const reasons = [];

    if (skillsYouCanLearn.length > 0) {
      reasons.push(
        `Can teach you: ${skillsYouCanLearn
          .map((item) => item.skill.name)
          .join(", ")}`
      );
    }

    if (skillsCandidateCanLearn.length > 0) {
      reasons.push(
        `Wants to learn from you: ${skillsCandidateCanLearn
          .map((item) => item.skill.name)
          .join(", ")}`
      );
    }

    if (availability.overlaps.length > 0) {
      reasons.push(
        `Availability overlaps on: ${availability.overlaps
          .map((item) => item.day)
          .join(", ")}`
      );
    }

    recommendations.push({
      member: {
        _id: candidate._id,
        name: candidate.name,
        username: candidate.username,
        bio: candidate.bio,
        profilePicture: candidate.profilePicture,
        isVerified: candidate.isVerified,
        skillsOffered: candidate.skillsOffered,
        skillsWanted: candidate.skillsWanted,
      },
      score: totalScore,
      breakdown: {
        skillScore: roundScore(skillScore),
        proficiencyScore: roundScore(proficiencyScore),
        availabilityScore: availability.score,
      },
      matchedSkills: {
        skillsYouCanLearn,
        skillsCandidateCanLearn,
      },
      availabilityOverlap: availability.overlaps,
      reasons,
    });
  }

  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
};
