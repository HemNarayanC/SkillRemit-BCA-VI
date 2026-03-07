import { useState } from "react";
import { Send } from "lucide-react";
import { applyToJob } from "../../api/jobApi.js";

const ApplyModal = ({ job, onClose }) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  // console.log("ApplyModal rendered with job:", job.job_id);

  const handleSubmit = async () => {
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await applyToJob(job.job_id, coverLetter);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#080f1e] border border-[#1e2d45] rounded-2xl w-full max-w-[480px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0f1f3d] to-[#1a1f35] px-7 py-6 border-b border-[#1e2d45] flex justify-between items-start">
          <div>
            <div className="text-white font-extrabold text-lg mb-1">
              Apply for {job.title}
            </div>
            <div className="text-slate-500 text-sm">
              {job.Employer?.company_name} · {job.location}
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 border border-slate-700 rounded-lg text-slate-400 cursor-pointer px-3 py-1 text-lg leading-none hover:bg-slate-700 transition"
          >
            ×
          </button>
        </div>

        <div className="px-7 py-6">
          {status === "success" ? (
            /* ── SUCCESS ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-950 border-2 border-green-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                ✓
              </div>
              <div className="text-green-400 font-extrabold text-xl mb-2">
                Application Submitted!
              </div>
              <div className="text-slate-400 text-sm leading-7 mb-7">
                Your application for{" "}
                <strong className="text-slate-200">{job.title}</strong> at{" "}
                <strong className="text-slate-200">
                  {job.Employer?.company_name}
                </strong>{" "}
                has been sent successfully.
              </div>
              <button
                onClick={onClose}
                className="px-10 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition border-none cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            /* ── FORM ── */
            <>
              {/* Salary preview */}
              <div className="bg-[#111827] border border-[#1e2d45] rounded-xl px-4 py-3 mb-5 flex justify-between items-center">
                <span className="text-slate-500 text-sm">Salary Range</span>
                <span className="text-blue-400 font-bold text-sm">
                  Rs. {Number(job.salary_min).toLocaleString("en-IN")} –{" "}
                  Rs. {Number(job.salary_max).toLocaleString("en-IN")} / mo
                </span>
              </div>

              {/* Cover Letter */}
              <div className="mb-5">
                <label className="block text-slate-400 text-sm font-semibold mb-2">
                  Cover Letter{" "}
                  <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Briefly describe why you're a great fit for this role…"
                  rows={5}
                  className="w-full bg-[#111827] border border-[#1e2d45] rounded-xl px-4 py-3 text-slate-200 text-sm resize-y outline-none leading-relaxed font-[inherit] focus:border-blue-500 transition-colors box-border"
                />
              </div>

              {/* Error */}
              {status === "error" && (
                <div className="text-red-400 text-sm px-4 py-3 bg-red-950 border border-red-900 rounded-lg mb-4">
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-transparent border border-[#1e2d45] text-slate-500 hover:border-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className={`flex-[2] py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 border-none transition
                    ${status === "loading"
                      ? "bg-blue-900/50 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 cursor-pointer"
                    }`}
                >
                  {status === "loading" ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplyModal;