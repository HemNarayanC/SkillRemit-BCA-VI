import { useState } from "react";
import { createJob } from "../../../api/jobApi.js";
import { 
  Briefcase, MapPin, DollarSign, FileText, Tag, 
  Image as ImageIcon, Upload, CheckCircle, AlertCircle 
} from "lucide-react";

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary_min: "",
    salary_max: "",
    skills_required: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const jobFormData = new FormData();
      jobFormData.append("title", formData.title);
      jobFormData.append("description", formData.description);
      jobFormData.append("location", formData.location);
      jobFormData.append("salary_min", formData.salary_min);
      jobFormData.append("salary_max", formData.salary_max);
      jobFormData.append("skills_required", formData.skills_required);
      
      if (imageFile) {
        jobFormData.append("image", imageFile);
      }

      await createJob(jobFormData);
      
      setMessage({ type: "success", text: "Job posted successfully!" });
      
      setFormData({
        title: "",
        description: "",
        location: "",
        salary_min: "",
        salary_max: "",
        skills_required: "",
      });
      setImageFile(null);
      setImagePreview(null);
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Post job error:", error);
      setMessage({ 
        type: "error", 
        text: error.message || "Failed to post job. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-foreground)" }}>
          Post a New Job
        </h2>
        <p style={{ color: "var(--color-muted-foreground)" }}>
          Create a job posting to attract talented candidates
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div 
          className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{ 
            background: message.type === "error" ? "rgba(220,38,38,0.08)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${message.type === "error" ? "rgba(220,38,38,0.2)" : "rgba(16,185,129,0.2)"}`,
            color: message.type === "error" ? "rgb(220,38,38)" : "rgb(16,185,129)"
          }}
        >
          {message.type === "error" ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          {/* Job Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <Briefcase className="w-4 h-4" /> Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Senior Software Engineer"
              required
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ 
                background: "rgba(15,23,42,0.03)", 
                color: "var(--color-foreground)", 
                border: "1px solid var(--color-border)" 
              }}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <FileText className="w-4 h-4" /> Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              required
              rows={6}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ 
                background: "rgba(15,23,42,0.03)", 
                color: "var(--color-foreground)", 
                border: "1px solid var(--color-border)" 
              }}
            />
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <MapPin className="w-4 h-4" /> Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. San Francisco, CA (Remote available)"
              required
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ 
                background: "rgba(15,23,42,0.03)", 
                color: "var(--color-foreground)", 
                border: "1px solid var(--color-border)" 
              }}
            />
          </div>

          {/* Salary Range */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <DollarSign className="w-4 h-4" /> Salary Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleInputChange}
                  placeholder="Min (e.g. 80000)"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ 
                    background: "rgba(15,23,42,0.03)", 
                    color: "var(--color-foreground)", 
                    border: "1px solid var(--color-border)" 
                  }}
                />
              </div>
              <div>
                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleInputChange}
                  placeholder="Max (e.g. 120000)"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ 
                    background: "rgba(15,23,42,0.03)", 
                    color: "var(--color-foreground)", 
                    border: "1px solid var(--color-border)" 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Skills Required */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <Tag className="w-4 h-4" /> Required Skills
            </label>
            <input
              type="text"
              name="skills_required"
              value={formData.skills_required}
              onChange={handleInputChange}
              placeholder="e.g. React, Node.js, PostgreSQL (comma-separated)"
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ 
                background: "rgba(15,23,42,0.03)", 
                color: "var(--color-foreground)", 
                border: "1px solid var(--color-border)" 
              }}
            />
            <p className="text-xs mt-2" style={{ color: "var(--color-muted-foreground)" }}>
              Separate multiple skills with commas
            </p>
          </div>

          {/* Job Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <ImageIcon className="w-4 h-4" /> Job Image (Optional)
            </label>
            
            {!imagePreview ? (
              <label 
                className="flex flex-col items-center justify-center w-full h-48 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                style={{ 
                  background: "rgba(15,23,42,0.03)", 
                  border: "2px dashed var(--color-border)" 
                }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3" style={{ color: "var(--color-muted-foreground)" }} />
                  <p className="mb-2 text-sm" style={{ color: "var(--color-foreground)" }}>
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    PNG, JPG or WEBP (MAX. 5MB)
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
                <img 
                  src={imagePreview} 
                  alt="Job preview" 
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                location: "",
                salary_min: "",
                salary_max: "",
                skills_required: "",
              });
              setImageFile(null);
              setImagePreview(null);
              setMessage(null);
            }}
            className="px-6 py-3 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ 
              background: "rgba(15,23,42,0.05)", 
              color: "var(--color-foreground)" 
            }}
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ 
              background: loading ? "rgba(3,105,161,0.5)" : "var(--color-primary)", 
              color: "var(--color-primary-foreground)" 
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Posting...
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                Post Job
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Card */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: "rgba(3,105,161,0.08)", border: "1px solid rgba(3,105,161,0.2)" }}>
        <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
          <CheckCircle className="w-5 h-5" /> Tips for a Great Job Post
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: "var(--color-foreground)" }}>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Write a clear and specific job title that accurately describes the role</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Include detailed responsibilities and qualifications in the description</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Be transparent about salary range to attract the right candidates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>List specific skills and technologies to help job seekers assess fit</span>
          </li>
        </ul>
      </div>
    </>
  );
};

export default PostJob;