
import { useEffect, useState } from "react";
import api from "../../../services/api";

function DiscoveryPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [activeRequestMember, setActiveRequestMember] = useState(null);
  const [requestForm, setRequestForm] = useState({
    skillOffered: "",
    skillRequested: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setError("");
      const response = await api.get("/member/discovery");
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  const openRequestForm = (item) => {
    const { skillsYouCanLearn, skillsCandidateCanLearn } =
      item.matchedSkills;

    setActiveRequestMember(item);

    setRequestForm({
      skillOffered: skillsCandidateCanLearn[0]?.skill._id || "",
      skillRequested: skillsYouCanLearn[0]?.skill._id || "",
      message: "",
    });

    setMessage("");
    setError("");
  };

  const closeRequestForm = () => {
    setActiveRequestMember(null);
    setRequestForm({
      skillOffered: "",
      skillRequested: "",
      message: "",
    });
    setError("");
  };

  const handleRequestChange = (e) => {
    setRequestForm({
      ...requestForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();

    if (!activeRequestMember) return;

    setSending(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/member/exchanges", {
        receiver: activeRequestMember.member._id,
        skillOffered: requestForm.skillOffered,
        skillRequested: requestForm.skillRequested,
        message: requestForm.message,
      });

      setMessage(response.data.message || "Exchange request sent successfully");
      closeRequestForm();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send exchange request"
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Finding compatible members...</p>;

  if (error && recommendations.length === 0) {
    return (
      <div>
        <p role="alert">{error}</p>
        <button onClick={fetchRecommendations}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Discover Members</h1>
      <p>Find people to exchange skills with.</p>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {recommendations.length === 0 ? (
        <p>
          No compatible members found yet. Add more skills to your profile
          to discover potential learning partners.
        </p>
      ) : (
        <>
          <p>{recommendations.length} compatible members found</p>

          {recommendations.map((item) => {
            const { member, score, breakdown, matchedSkills } = item;

            const canExchange =
              matchedSkills.skillsYouCanLearn.length > 0 &&
              matchedSkills.skillsCandidateCanLearn.length > 0;

            return (
              <article
                key={member._id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  {member.profilePicture && (
                    <img
                      src={member.profilePicture}
                      alt={member.name}
                      width="60"
                      height="60"
                      style={{ borderRadius: "50%" }}
                    />
                  )}

                  <h2>{member.name}</h2>
                  <p>@{member.username}</p>
                  {member.isVerified && <span>Verified Member</span>}
                  <p>{member.bio || "No bio available."}</p>
                </div>

                <h3>{score}% Compatibility</h3>

                <div>
                  <p>Skill match: {breakdown.skillScore}/60</p>
                  <p>
                    Teaching proficiency: {breakdown.proficiencyScore}/20
                  </p>
                  <p>
                    Availability: {breakdown.availabilityScore}/20
                  </p>
                </div>

                <h3>Skills you can learn</h3>

                {matchedSkills.skillsYouCanLearn.length ? (
                  <ul>
                    {matchedSkills.skillsYouCanLearn.map((item) => (
                      <li key={item.skill._id}>
                        {item.skill.name} — {item.level}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No matching skills.</p>
                )}

                <h3>Skills you can teach</h3>

                {matchedSkills.skillsCandidateCanLearn.length ? (
                  <ul>
                    {matchedSkills.skillsCandidateCanLearn.map((item) => (
                      <li key={item.skill._id}>
                        {item.skill.name} — {item.level}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No matching skills.</p>
                )}

                <h3>Why this match?</h3>

                <ul>
                  {item.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>

                <h3>Availability overlap</h3>

                {item.availabilityOverlap.length ? (
                  <ul>
                    {item.availabilityOverlap.map((overlap) => (
                      <li key={overlap.day}>
                        {overlap.day}: {overlap.minutes} minutes
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No common availability detected.</p>
                )}

                {canExchange ? (
                  <button
                    type="button"
                    onClick={() => openRequestForm(item)}
                  >
                    Send Exchange Request
                  </button>
                ) : (
                  <p>
                    A reciprocal skill match is needed to send an exchange
                    request.
                  </p>
                )}

                {activeRequestMember?.member._id === member._id && (
                  <form onSubmit={handleSendRequest}>
                    <h3>Send Request to {member.name}</h3>

                    <label htmlFor={`offered-${member._id}`}>
                      Skill you will teach
                    </label>

                    <select
                      id={`offered-${member._id}`}
                      name="skillOffered"
                      value={requestForm.skillOffered}
                      onChange={handleRequestChange}
                      required
                    >
                      {matchedSkills.skillsCandidateCanLearn.map((item) => (
                        <option
                          key={item.skill._id}
                          value={item.skill._id}
                        >
                          {item.skill.name}
                        </option>
                      ))}
                    </select>

                    <label htmlFor={`requested-${member._id}`}>
                      Skill you want to learn
                    </label>

                    <select
                      id={`requested-${member._id}`}
                      name="skillRequested"
                      value={requestForm.skillRequested}
                      onChange={handleRequestChange}
                      required
                    >
                      {matchedSkills.skillsYouCanLearn.map((item) => (
                        <option
                          key={item.skill._id}
                          value={item.skill._id}
                        >
                          {item.skill.name}
                        </option>
                      ))}
                    </select>

                    <label htmlFor={`message-${member._id}`}>
                      Message (optional)
                    </label>

                    <textarea
                      id={`message-${member._id}`}
                      name="message"
                      value={requestForm.message}
                      onChange={handleRequestChange}
                      maxLength={500}
                      placeholder="Introduce yourself and explain what you'd like to exchange..."
                    />

                    <p>{requestForm.message.length}/500 characters</p>

                    <button type="submit" disabled={sending}>
                      {sending ? "Sending..." : "Send Request"}
                    </button>

                    <button
                      type="button"
                      onClick={closeRequestForm}
                      disabled={sending}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </>
      )}
    </div>
  );
}

export default DiscoveryPage;
