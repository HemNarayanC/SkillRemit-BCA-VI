import React, { useEffect, useState } from "react";
import { getEmployerJobs, createJob, updateJob, closeJob } from "../../../api/jobApi.js";
import { Edit3, X, Plus, CheckCircle, Trash } from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  location: "",
  salary_min: "",
  salary_max: "",
  skills_required: "",
  image: null
};

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getEmployerJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to load jobs" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (job) => {
    setEditing(job);
    setForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      salary_min: job.salary_min || "",
      salary_max: job.salary_max || "",
      skills_required: job.skills_required || "",
      image: null
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((s) => ({ ...s, [name]: files[0] }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // prepare payload: use FormData if image present
      let payload;
      const hasImage = form.image instanceof File;
      if (hasImage) {
        payload = new FormData();
        payload.append("title", form.title);
        payload.append("description", form.description);
        payload.append("location", form.location);
        payload.append("salary_min", form.salary_min);
        payload.append("salary_max", form.salary_max);
        payload.append("skills_required", form.skills_required);
        payload.append("image", form.image);
      } else {
        payload = {
          title: form.title,
          description: form.description,
          location: form.location,
          salary_min: form.salary_min,
          salary_max: form.salary_max,
          skills_required: form.skills_required
        };
      }

      if (editing) {
        await updateJob(editing.job_id || editing.id, payload);
        setMessage({ type: "success", text: "Job updated" });
      } else {
        await createJob(payload);
        setMessage({ type: "success", text: "Job created" });
      }

      setShowModal(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseJob = async (job) => {
    if (!window.confirm("Close this job? This will mark it as closed.")) return;

    const jobId = job.job_id ?? job.id; // normalize ID

    try {
      await closeJob(jobId);

      setJobs((prev) =>
        prev.map((j) => {
          const currentId = j.job_id ?? j.id;
          return currentId === jobId
            ? { ...j, status: "closed" }
            : j;
        })
      );

      setMessage({ type: "success", text: "Job closed" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to close job" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">My Jobs</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      <div className="rounded-xl p-4" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
        {loading ? (
          <p>Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-muted-foreground">No jobs posted yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Location</th>
                <th className="text-left py-2">Salary</th>
                <th className="text-left py-2">Status</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.job_id || job.id} className="border-t">
                  <td className="py-3">{job.title}</td>
                  <td className="py-3">{job.location || "—"}</td>
                  <td className="py-3">{job.salary_min || "—"} - {job.salary_max || "—"}</td>
                  <td className="py-3 capitalize">{job.status || "open"}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(job)}
                        className="px-3 py-1 rounded-md border hover:bg-gray-50"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {job.status !== "closed" && (
                        <button
                          onClick={() => handleCloseJob(job)}
                          className="px-3 py-1 rounded-md border bg-red-50 text-red-600"
                          title="Close job"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editing ? "Edit Job" : "Create Job"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><X /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-sm">Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>

              <div>
                <label className="text-sm">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Location</label>
                  <input name="location" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-sm">Skills (comma separated)</label>
                  <input name="skills_required" value={form.skills_required} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Salary Min</label>
                  <input name="salary_min" value={form.salary_min} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-sm">Salary Max</label>
                  <input name="salary_max" value={form.salary_max} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div>
                <label className="text-sm">Image (optional)</label>
                <input type="file" name="image" accept="image/*" onChange={handleChange} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">
                  {saving ? "Saving..." : (editing ? "Update Job" : "Create Job")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="fixed bottom-6 right-6">
          <div className={`px-4 py-2 rounded ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            {message.text}
            <button className="ml-3 text-xs underline" onClick={() => setMessage(null)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;