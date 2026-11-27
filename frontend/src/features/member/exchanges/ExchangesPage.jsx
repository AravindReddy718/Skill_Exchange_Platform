
import { useEffect, useState } from "react";
import api from "../../../services/api";

function ExchangesPage() {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setError("");

      const [sentResponse, receivedResponse] = await Promise.all([
        api.get("/member/exchanges/sent"),
        api.get("/member/exchanges/received"),
      ]);

      setSentRequests(sentResponse.data.requests || []);
      setReceivedRequests(receivedResponse.data.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load exchange requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    setSavingId(requestId);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/member/exchanges/${requestId}/${action}`
      );

      setMessage(response.data.message || "Request updated successfully");

      await fetchRequests();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update request"
      );
    } finally {
      setSavingId(null);
    }
  };

  const RequestCard = ({ request, type }) => {
    const otherMember =
      type === "sent" ? request.receiver : request.sender;

    return (
      <article
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "12px",
        }}
      >
        <h3>{otherMember?.name || "Unknown Member"}</h3>
        <p>@{otherMember?.username || "unknown"}</p>

        <p>
          <strong>Skill offered:</strong>{" "}
          {request.skillOffered?.name || "Unknown"}
        </p>

        <p>
          <strong>Skill requested:</strong>{" "}
          {request.skillRequested?.name || "Unknown"}
        </p>

        <p>
          <strong>Message:</strong>{" "}
          {request.message || "No message"}
        </p>

        <p>
          <strong>Status:</strong> {request.status}
        </p>

        <p>
          <strong>Created:</strong>{" "}
          {new Date(request.createdAt).toLocaleString()}
        </p>

        {request.status === "pending" && (
          <div>
            {type === "received" ? (
              <>
                <button
                  disabled={savingId === request._id}
                  onClick={() => handleAction(request._id, "accept")}
                >
                  {savingId === request._id ? "Processing..." : "Accept"}
                </button>

                <button
                  disabled={savingId === request._id}
                  onClick={() => handleAction(request._id, "reject")}
                >
                  Reject
                </button>
              </>
            ) : (
              <button
                disabled={savingId === request._id}
                onClick={() => handleAction(request._id, "cancel")}
              >
                {savingId === request._id ? "Cancelling..." : "Cancel Request"}
              </button>
            )}
          </div>
        )}
      </article>
    );
  };

  if (loading) return <p>Loading exchange requests...</p>;

  return (
    <div>
      <h1>Exchange Requests</h1>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <section>
        <h2>Received Requests ({receivedRequests.length})</h2>

        {receivedRequests.length === 0 ? (
          <p>You haven't received any requests yet.</p>
        ) : (
          receivedRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              type="received"
            />
          ))
        )}
      </section>

      <section>
        <h2>Sent Requests ({sentRequests.length})</h2>

        {sentRequests.length === 0 ? (
          <p>You haven't sent any requests yet.</p>
        ) : (
          sentRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              type="sent"
            />
          ))
        )}
      </section>

      <button onClick={fetchRequests}>Refresh Requests</button>
    </div>
  );
}

export default ExchangesPage;
