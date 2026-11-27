
import { useEffect, useState } from "react";
import api from "../../../services/api";

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const PROFICIENCY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

function ProfilePage() {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profilePicture: "",
  });

  const [availability, setAvailability] = useState({
    days: [],
    timezone: "Asia/Kolkata",
  });

  const [availableSkills, setAvailableSkills] = useState([]);

  const [skillsForm, setSkillsForm] = useState({
    skillsOffered: [],
    skillsWanted: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileResponse, skillsResponse] = await Promise.all([
        api.get("/member/profile"),
        api.get("/member/profile/skills/available"),
      ]);

      const data = profileResponse.data.profile;

      setProfile(data);
      setAvailableSkills(skillsResponse.data.skills);

      setFormData({
        name: data.name || "",
        bio: data.bio || "",
        profilePicture: data.profilePicture || "",
      });

      setAvailability({
        days: data.availability?.days || [],
        timezone: data.availability?.timezone || "Asia/Kolkata",
      });

      setSkillsForm({
        skillsOffered: (data.skillsOffered || []).map((item) => ({
          skill: item.skill._id,
          level: item.level,
        })),
        skillsWanted: (data.skillsWanted || []).map((skill) => skill._id),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // PROFILE FUNCTIONS

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.put("/member/profile", formData);
      setProfile(response.data.profile);
      setEditing(false);
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileCancel = () => {
    setFormData({
      name: profile.name || "",
      bio: profile.bio || "",
      profilePicture: profile.profilePicture || "",
    });
    setEditing(false);
    setError("");
  };

  // SKILLS FUNCTIONS

  const toggleOfferedSkill = (skillId) => {
    setSkillsForm((current) => {
      const exists = current.skillsOffered.some(
        (item) => item.skill === skillId
      );

      return {
        skillsOffered: exists
          ? current.skillsOffered.filter((item) => item.skill !== skillId)
          : [
              ...current.skillsOffered,
              { skill: skillId, level: "beginner" },
            ],
        skillsWanted: current.skillsWanted.filter((id) => id !== skillId),
      };
    });
  };

  const toggleWantedSkill = (skillId) => {
    setSkillsForm((current) => {
      const exists = current.skillsWanted.includes(skillId);

      return {
        ...current,
        skillsWanted: exists
          ? current.skillsWanted.filter((id) => id !== skillId)
          : [...current.skillsWanted, skillId],
      };
    });
  };

  const updateSkillLevel = (skillId, level) => {
    setSkillsForm((current) => ({
      ...current,
      skillsOffered: current.skillsOffered.map((item) =>
        item.skill === skillId ? { ...item, level } : item
      ),
    }));
  };

  const handleSkillsSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.put(
        "/member/profile/skills",
        skillsForm
      );

      const updatedProfile = response.data.profile;

      setProfile(updatedProfile);

      setSkillsForm({
        skillsOffered: (updatedProfile.skillsOffered || []).map((item) => ({
          skill: item.skill._id,
          level: item.level,
        })),
        skillsWanted: (updatedProfile.skillsWanted || []).map(
          (skill) => skill._id
        ),
      });

      setEditingSkills(false);
      setMessage("Skills updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update skills");
    } finally {
      setSaving(false);
    }
  };

  const handleSkillsCancel = () => {
    setSkillsForm({
      skillsOffered: (profile.skillsOffered || []).map((item) => ({
        skill: item.skill._id,
        level: item.level,
      })),
      skillsWanted: (profile.skillsWanted || []).map((skill) => skill._id),
    });

    setEditingSkills(false);
    setError("");
  };

  // AVAILABILITY FUNCTIONS

  const toggleDay = (day) => {
    setAvailability((current) => {
      const exists = current.days.some((entry) => entry.day === day);

      return {
        ...current,
        days: exists
          ? current.days.filter((entry) => entry.day !== day)
          : [...current.days, { day, slots: [] }],
      };
    });
  };

  const addSlot = (day) => {
    setAvailability((current) => ({
      ...current,
      days: current.days.map((entry) =>
        entry.day === day
          ? {
              ...entry,
              slots: [...entry.slots, { start: "09:00", end: "10:00" }],
            }
          : entry
      ),
    }));
  };

  const updateSlot = (day, index, field, value) => {
    setAvailability((current) => ({
      ...current,
      days: current.days.map((entry) =>
        entry.day === day
          ? {
              ...entry,
              slots: entry.slots.map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
              ),
            }
          : entry
      ),
    }));
  };

  const removeSlot = (day, index) => {
    setAvailability((current) => ({
      ...current,
      days: current.days.map((entry) =>
        entry.day === day
          ? {
              ...entry,
              slots: entry.slots.filter((_, i) => i !== index),
            }
          : entry
      ),
    }));
  };

  const handleAvailabilitySave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.put("/member/profile", {
        availability,
      });

      setProfile(response.data.profile);

      setAvailability({
        days: response.data.profile.availability.days,
        timezone: response.data.profile.availability.timezone,
      });

      setEditingAvailability(false);
      setMessage("Availability updated successfully");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update availability"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityCancel = () => {
    setAvailability({
      days: profile.availability?.days || [],
      timezone: profile.availability?.timezone || "Asia/Kolkata",
    });

    setEditingAvailability(false);
    setError("");
  };

  if (loading) return <p>Loading profile...</p>;
  if (error && !profile) return <p>{error}</p>;
  if (!profile) return <p>Profile not found.</p>;

  return (
    <div>
      <h1>My Profile</h1>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {/* PROFILE SECTION */}

      <section>
        {editing ? (
          <form onSubmit={handleProfileSave}>
            <h2>Edit Profile</h2>

            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleProfileChange}
              required
            />

            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleProfileChange}
              maxLength={500}
            />

            <label htmlFor="profilePicture">Profile Picture URL</label>
            <input
              id="profilePicture"
              name="profilePicture"
              type="url"
              value={formData.profilePicture}
              onChange={handleProfileChange}
            />

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>

            <button type="button" onClick={handleProfileCancel}>
              Cancel
            </button>
          </form>
        ) : (
          <>
            {profile.profilePicture && (
              <img src={profile.profilePicture} alt="Profile" width="100" />
            )}

            <h2>{profile.name}</h2>
            <p>@{profile.username}</p>
            <p>{profile.bio || "No bio added yet."}</p>

            <button onClick={() => setEditing(true)}>Edit Profile</button>
          </>
        )}
      </section>

      {/* SKILLS SECTION */}

      <section>
        <h2>My Skills</h2>

        {!editingSkills ? (
          <>
            <h3>Skills I Can Teach</h3>

            {profile.skillsOffered?.length ? (
              <ul>
                {profile.skillsOffered.map((item) => (
                  <li key={item._id}>
                    {item.skill?.name} — {item.level}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No skills offered yet.</p>
            )}

            <h3>Skills I Want to Learn</h3>

            {profile.skillsWanted?.length ? (
              <ul>
                {profile.skillsWanted.map((skill) => (
                  <li key={skill._id}>{skill.name}</li>
                ))}
              </ul>
            ) : (
              <p>No skills selected yet.</p>
            )}

            <button onClick={() => setEditingSkills(true)}>
              Edit Skills
            </button>
          </>
        ) : (
          <form onSubmit={handleSkillsSave}>
            <h3>Select Skills You Can Teach</h3>

            {availableSkills.map((skill) => {
              const offeredItem = skillsForm.skillsOffered.find(
                (item) => item.skill === skill._id
              );

              const isWanted = skillsForm.skillsWanted.includes(skill._id);

              return (
                <div key={skill._id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(offeredItem)}
                      disabled={isWanted}
                      onChange={() => toggleOfferedSkill(skill._id)}
                    />
                    {skill.name} ({skill.category})
                  </label>

                  {offeredItem && (
                    <select
                      value={offeredItem.level}
                      onChange={(e) =>
                        updateSkillLevel(skill._id, e.target.value)
                      }
                    >
                      {PROFICIENCY_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}

            <h3>Select Skills You Want to Learn</h3>

            {availableSkills.map((skill) => {
              const isOffered = skillsForm.skillsOffered.some(
                (item) => item.skill === skill._id
              );

              return (
                <div key={skill._id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={skillsForm.skillsWanted.includes(skill._id)}
                      disabled={isOffered}
                      onChange={() => toggleWantedSkill(skill._id)}
                    />
                    {skill.name} ({skill.category})
                  </label>
                </div>
              );
            })}

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Skills"}
            </button>

            <button
              type="button"
              onClick={handleSkillsCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </form>
        )}
      </section>

      {/* AVAILABILITY SECTION */}

      <section>
        <h2>My Availability</h2>

        {availability.days.length ? (
          availability.days.map((entry) => (
            <div key={entry.day}>
              <strong>{entry.day}</strong>

              {entry.slots.map((slot, index) => (
                <p key={index}>
                  {slot.start} – {slot.end}
                </p>
              ))}
            </div>
          ))
        ) : (
          <p>No availability added yet.</p>
        )}

        <p>Timezone: {availability.timezone}</p>

        {!editingAvailability && (
          <button onClick={() => setEditingAvailability(true)}>
            Edit Availability
          </button>
        )}

        {editingAvailability && (
          <form onSubmit={handleAvailabilitySave}>
            <h3>Edit Weekly Availability</h3>

            <div>
              {WEEKDAYS.map((day) => (
                <label key={day} style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={availability.days.some(
                      (entry) => entry.day === day
                    )}
                    onChange={() => toggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>

            {availability.days.map((entry) => (
              <div key={entry.day}>
                <h4>{entry.day}</h4>

                {entry.slots.map((slot, index) => (
                  <div key={index}>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) =>
                        updateSlot(entry.day, index, "start", e.target.value)
                      }
                      required
                    />

                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) =>
                        updateSlot(entry.day, index, "end", e.target.value)
                      }
                      required
                    />

                    <button
                      type="button"
                      onClick={() => removeSlot(entry.day, index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button type="button" onClick={() => addSlot(entry.day)}>
                  Add Time Slot
                </button>
              </div>
            ))}

            <label htmlFor="timezone">Timezone</label>

            <select
              id="timezone"
              value={availability.timezone}
              onChange={(e) =>
                setAvailability({
                  ...availability,
                  timezone: e.target.value,
                })
              }
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Availability"}
            </button>

            <button
              type="button"
              onClick={handleAvailabilityCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default ProfilePage;
