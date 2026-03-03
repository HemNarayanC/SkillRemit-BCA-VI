import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AIMatchModal from "../../components/modals/AIMatchModal";
import ApplyModal from "../../components/modals/ApplyModal";
import {
  ArrowLeftIcon,
  MapPinIcon,
  MoneyIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  SendIcon,
  BuildingIcon,
} from "../../components/ui/Icons";
import { fetchJobDetails } from "../../api/jobApi";
import { getJobSeekerProfile } from "../../api/usersApi";
import { formatSalary, timeAgo, parseSkills } from "../../utils/helpers";

export default function JobDetailPage({ onBack }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
//   const jobId = job_id;
  const handleBack = onBack ?? (() => navigate(-1));
  const [data, setData] = useState(null);
  const [jobseekerId, setJobseekerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [showApply, setShowApply] = useState(false);

  console.log("JobDetailPage mounted with jobId:", jobId);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch job details and jobseeker profile in parallel
        const [jobResult, seekerResult] = await Promise.allSettled([
          fetchJobDetails(jobId),
          getJobSeekerProfile(),
        ]);

        console.log("JobSeeker fetch result:", seekerResult);

        if (jobResult.status === "fulfilled") {
          setData(jobResult.value);
        } else {
          setError("Failed to load job details.");
        }

        if (seekerResult.status === "fulfilled") {
          setJobseekerId(seekerResult.value?.jobseeker_id ?? null);
        }
        // Silently ignore seeker fetch failure — AI check will just be unavailable
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  if (loading)
    return (
      <div className="pt-28 text-center text-muted-foreground font-exo animate-pulse">
        Loading job details…
      </div>
    );

  if (error)
    return (
      <div className="pt-28 text-center text-red-400 font-exo">
        {error}
        <button
          onClick={handleBack}
          className="block mx-auto mt-4 text-primary underline text-sm"
        >
          Go back
        </button>
      </div>
    );

  if (!data) return null;

  const { job, stats } = data;
  const skills = parseSkills(job.skills_required);
  const totalApps = stats?.total_applications || 0;
  const pct = (n) => (totalApps > 0 ? ((n / totalApps) * 100).toFixed(1) : 0);

  // Split description into paragraphs for clean rendering
  const descriptionParagraphs = (job.description || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="pt-28 pb-16 px-6 lg:px-20 bg-background min-h-screen font-exo">
      {/* Top Bar */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition"
        >
          <ArrowLeftIcon size={16} />
          Back to Jobs
        </button>

        <div className="flex gap-3">
          {jobseekerId ? (
            <button
              onClick={() => setShowAI(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary transition shadow-md"
            >
              <SparklesIcon size={14} />
              AI Eligibility Check
            </button>
          ) : (
            <button
              disabled
              title="Log in as a job seeker to use AI check"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-secondary/40 text-secondary-foreground/40 cursor-not-allowed"
            >
              <SparklesIcon size={14} />
              AI Eligibility Check
            </button>
          )}

          <button
            onClick={() => setShowApply(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition shadow-lg"
          >
            <SendIcon size={14} />
            Apply Now
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-card border border-border rounded-3xl p-10 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent opacity-10 rounded-full blur-3xl animate-float" />

        <div className="flex gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold font-orbitron shadow-lg flex-shrink-0">
            {job.title.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground font-orbitron">
              {job.title}
            </h1>

            <div className="flex items-center gap-2 text-secondary mt-2">
              <BuildingIcon size={14} />
              {job.Employer?.company_name}
            </div>

            <div className="flex flex-wrap gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPinIcon size={14} />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <MoneyIcon size={14} />
                {formatSalary(job.salary_min, job.salary_max)}
              </div>
              <div className="flex items-center gap-1">
                <UsersIcon size={14} />
                {totalApps} applicant{totalApps !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon size={14} />
                Posted {timeAgo(job.created_at)}
              </div>
              {job.status && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    job.status === "open"
                      ? "bg-green-900/50 text-green-400 border border-green-800"
                      : "bg-red-900/50 text-red-400 border border-red-800"
                  }`}
                >
                  {job.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Section title="Job Description">
            {descriptionParagraphs.length > 0 ? (
              descriptionParagraphs.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">No description provided.</p>
            )}
          </Section>

          {/* Required Skills */}
          <Section title="Required Skills">
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No specific skills listed.
              </p>
            )}
          </Section>

          {/* Experience */}
          {job.years_of_experience != null && (
            <Section title="Experience Required">
              <p className="text-muted-foreground">
                {job.years_of_experience === 0
                  ? "No prior experience required — entry level welcome."
                  : `At least ${job.years_of_experience} year${
                      job.years_of_experience !== 1 ? "s" : ""
                    } of relevant experience.`}
              </p>
            </Section>
          )}

          {/* CTA */}
          <div className="bg-primary text-primary-foreground rounded-3xl p-10 text-center shadow-xl">
            <h2 className="text-2xl font-bold mb-3 font-orbitron">
              Ready to Join {job.Employer?.company_name}?
            </h2>
            <p className="mb-6 opacity-90">
              Don't miss this opportunity. Apply with confidence.
            </p>
            <button
              onClick={() => setShowApply(true)}
              className="px-10 py-3 rounded-xl bg-white text-primary font-bold hover:opacity-90 transition"
            >
              Apply for This Position
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          <SidebarCard title="Company Info">
            <p className="font-semibold">
              {job.Employer?.company_name || "—"}
            </p>
            {job.Employer?.business_type && (
              <p className="text-muted-foreground text-sm capitalize">
                {job.Employer.business_type}
              </p>
            )}
            <p className="text-muted-foreground text-sm">{job.location}</p>
            {job.Employer?.User?.email && (
              <p className="text-muted-foreground text-sm">
                {job.Employer.User.email}
              </p>
            )}
          </SidebarCard>

          <SidebarCard title="Job Overview">
            <OverviewRow label="Status" value={job.status} />
            <OverviewRow
              label="Salary"
              value={formatSalary(job.salary_min, job.salary_max)}
            />
            <OverviewRow label="Location" value={job.location} />
            <OverviewRow label="Posted" value={timeAgo(job.created_at)} />
          </SidebarCard>

          {stats && (
            <SidebarCard title="Application Statistics">
              <OverviewRow
                label="Total Applicants"
                value={stats.total_applications}
              />
              <OverviewRow label="Pending Review" value={stats.pending} />
              <OverviewRow label="Shortlisted" value={stats.shortlisted} />
              <OverviewRow label="Rejected" value={stats.rejected} />
              {stats.hired != null && (
                <OverviewRow label="Hired" value={stats.hired} />
              )}

              {totalApps > 0 && (
                <>
                  <div className="mt-4 h-3 flex rounded-full overflow-hidden bg-muted">
                    <div
                      className="bg-yellow-400 transition-all"
                      style={{ width: `${pct(stats.pending)}%` }}
                    />
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${pct(stats.shortlisted)}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${pct(stats.rejected)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                    <span>Pending</span>
                    <span>Shortlisted</span>
                    <span>Rejected</span>
                  </div>
                </>
              )}
            </SidebarCard>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAI && jobseekerId && (
        <AIMatchModal
          job={job}
          jobseekerId={jobseekerId}
          onClose={() => setShowAI(false)}
          onProceedApply={() => {
            setShowAI(false);
            setShowApply(true);
          }}
        />
      )}

      {showApply && (
        <ApplyModal job={job} onClose={() => setShowApply(false)} />
      )}
    </div>
  );
}

/* ── Reusable components ─────────────────────────────────── */

function Section({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
      <h2 className="text-xl font-bold mb-5 text-foreground font-quantico">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SidebarCard({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-bold mb-4 font-quantico">{title}</h3>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}

function OverviewRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold capitalize">{value ?? "—"}</span>
    </div>
  );
}