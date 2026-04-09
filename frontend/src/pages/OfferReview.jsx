import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { api } from "../services/api";
import DashboardLayout from "./components/DashboardLayout";

const OfferReview = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { success, error, warning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "", title: "", message: "" });

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await api.applications.get(applicationId);
      setApplication(data);
    } catch (err) {
      console.error(err);
      error("Failed to load offer details");
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (type) => {
    setModalConfig({
      isOpen: true,
      type,
      title: type === "accept" ? "Accept Job Offer?" : "Decline Job Offer?",
      message: type === "accept" 
        ? "Are you sure you want to officially accept this offer? Congratulations!" 
        : "Are you sure you want to decline this offer? This action cannot be undone."
    });
  };

  const handleModalConfirm = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    if (modalConfig.type === "accept") {
      executeAccept();
    } else {
      executeDecline();
    }
  };

  const executeAccept = async () => {
    try {
      setSubmitting(true);
      await api.applications.acceptOffer(applicationId);
      success("You have successfully accepted the offer! Congratulations!");
      navigate("/dashboard");
    } catch (err) {
      error(err.message || "Failed to accept offer");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDecline = async () => {
    try {
      setSubmitting(true);
      await api.applications.rejectOffer(applicationId);
      warning("You have declined the offer.");
      navigate("/dashboard");
    } catch (err) {
      error(err.message || "Failed to decline offer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Review Job Offer">
        <div className="flex items-center justify-center p-12 text-[#9ca3af]">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!application || application.stage !== "offer") {
    return (
      <DashboardLayout title="Review Job Offer">
        <div className="p-12 text-center text-[#9ca3af] bg-[#0f172a] rounded-xl border border-[#334155]">
          <p>No pending offer found for this exact application.</p>
          <button onClick={() => navigate("/dashboard")} className="mt-4 px-4 py-2 bg-[#1e293b] rounded text-[#e5e7eb] hover:bg-[#334155]">Back to Dashboard</button>
        </div>
      </DashboardLayout>
    );
  }

  const { offerDetails } = application;

  return (
    <DashboardLayout
      title="Review Job Offer"
      subtitle="The company is excited to extend you this offer"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-3xl shadow-lg shadow-[#10b981]/20">
                📄
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-[#f8fafc] mb-8">
              Official Offer Letter details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-lg bg-[#0f172a] border border-[#334155]">
                <p className="text-sm text-[#9ca3af] mb-1">Proposed Salary</p>
                <p className="text-xl font-semibold text-[#10b981]">{offerDetails?.salary || "Discussed internally"}</p>
              </div>
              <div className="p-5 rounded-lg bg-[#0f172a] border border-[#334155]">
                <p className="text-sm text-[#9ca3af] mb-1">Start Date</p>
                <p className="text-xl font-semibold text-[#e5e7eb]">{offerDetails?.startDate ? new Date(offerDetails.startDate).toLocaleDateString() : "TBD"}</p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[#0f172a] border border-[#334155] mb-8">
              <p className="text-sm text-[#9ca3af] mb-3">Benefits & Additional Notes</p>
              <p className="text-[#cbd5e1] whitespace-pre-line leading-relaxed">
                {offerDetails?.benefits || "Standard company benefits apply. Please check with your recruiter."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => confirmAction("accept")}
                disabled={submitting}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-[#f8fafc] font-bold rounded-xl hover:shadow-lg hover:shadow-[#10b981]/30 transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                Accept Offer
              </button>
              <button
                onClick={() => confirmAction("decline")}
                disabled={submitting}
                className="px-8 py-4 bg-[#0f172a] border border-[#b91c1c]/40 text-[#ef4444] font-medium rounded-xl hover:bg-[#b91c1c]/10 transition-all disabled:opacity-60"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155]/40 max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#f8fafc] mb-2">{modalConfig.title}</h3>
            <p className="text-[#cbd5e1] mb-6">{modalConfig.message}</p>
            <div className="flex gap-3">
              <button
                onClick={handleModalConfirm}
                className={`flex-1 px-4 py-2 font-medium rounded-lg text-white ${
                  modalConfig.type === "accept" 
                    ? "bg-gradient-to-r from-[#10b981] to-[#059669] hover:shadow-[#10b981]/20" 
                    : "bg-[#b91c1c] hover:bg-[#991b1b]"
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                className="flex-1 px-4 py-2 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] font-medium rounded-lg hover:bg-[#1e293b]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OfferReview;
