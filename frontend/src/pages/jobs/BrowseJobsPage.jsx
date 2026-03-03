import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "../../components/JobCard";
import JobFilters from "../../components/JobFilters.jsx";
import ApplyModal from "../../components/modals/ApplyModal";
import {
  SearchIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../../components/ui/Icons.jsx";
import { listOpenJobs } from "../../api/jobApi.js";

const SORT_OPTIONS = [
  { value: "created_at", label: "Most Recent" },
  { value: "salary_max", label: "Highest Salary" },
];

export default function BrowseJobsPage() {
  const navigate = useNavigate();
  const [jobsData, setJobsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyTarget, setApplyTarget] = useState(null);

  // Filter state — mirrors query params of GET /api/jobs/open
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    skills: "",
    salary_min: "",
    salary_max: "",
    sort: "created_at",
    order: "DESC",
    page: 1,
    limit: 12,
  });

  const [searchInput, setSearchInput] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listOpenJobs(filters);
      console.log("Fetched jobs:", data);
      setJobsData(data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setJobsData({
        jobs: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const hello = fetchJobs();
    console.log("Current filters:", hello);
  }, [fetchJobs]);

  const handleFilterChange = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      location: "",
      skills: "",
      salary_min: "",
      salary_max: "",
      sort: "created_at",
      order: "DESC",
      page: 1,
      limit: 12,
    });
    setSearchInput("");
  };

  const handleSearch = () => {
    handleFilterChange({ search: searchInput, page: 1 });
  };

  return (
    <div className="pt-20 px-6 lg:px-20 font-exo min-h-screen bg-background">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Browse Jobs</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Discover opportunities that match your skills and career goals
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-[2] min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <SearchIcon />
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Job title, keyword, or company"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-card-foreground text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="relative flex-1 min-w-[150px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <MapPinIcon />
          </span>
          <input
            value={filters.location}
            onChange={(e) => handleFilterChange({ location: e.target.value })}
            placeholder="Location"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-card-foreground text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        <button
          onClick={handleSearch}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition text-sm flex-shrink-0"
        >
          Search
        </button>
      </div>

      {/* Main layout: sidebar + results */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <JobFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sort & Count */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              <strong className="text-card-foreground">
                {jobsData?.pagination?.total ?? "…"}
              </strong>{" "}
              jobs found
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(e) =>
                  handleFilterChange({ sort: e.target.value, page: 1 })
                }
                className="bg-card border border-border text-card-foreground rounded-md px-3 py-1 text-sm outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-44 bg-card rounded-2xl border border-border animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && jobsData?.jobs?.length === 0 && (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <div className="text-5xl mb-4">🔍</div>
              <div className="text-card-foreground font-bold text-lg mb-2">
                No jobs found
              </div>
              <div className="text-muted-foreground text-sm mb-6">
                Try adjusting your filters or search terms
              </div>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Job Grid */}
          {!loading && jobsData?.jobs?.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobsData.jobs.map((job) => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    onViewDetails={(id) => navigate(`/jobs/${id}`)}
                    onApplyNow={(j) => setApplyTarget(j)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 mt-6">
                <PaginationBtn
                  onClick={() =>
                    handleFilterChange({ page: filters.page - 1 })
                  }
                  disabled={!jobsData.pagination?.hasPreviousPage}
                >
                  <ChevronLeftIcon />
                </PaginationBtn>

                {[...Array(jobsData.pagination?.totalPages || 1)].map(
                  (_, i) => (
                    <PaginationBtn
                      key={i}
                      active={filters.page === i + 1}
                      onClick={() => handleFilterChange({ page: i + 1 })}
                    >
                      {i + 1}
                    </PaginationBtn>
                  )
                )}

                <PaginationBtn
                  onClick={() =>
                    handleFilterChange({ page: filters.page + 1 })
                  }
                  disabled={!jobsData.pagination?.hasNextPage}
                >
                  <ChevronRightIcon />
                </PaginationBtn>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {applyTarget && (
        <ApplyModal job={applyTarget} onClose={() => setApplyTarget(null)} />
      )}
    </div>
  );
}

function PaginationBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center border transition-all
        ${
          active
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}