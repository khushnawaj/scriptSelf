import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getJobs, reset } from "../features/jobs/jobSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Briefcase, ExternalLink, Calendar, Filter } from "lucide-react";
import toast from "react-hot-toast";

const Jobs = () => {
  const dispatch = useDispatch();
  const { jobs, isLoading, isError, message } = useSelector((state) => state.jobs);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  useEffect(() => {
    dispatch(getJobs());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter((job) => {
    const matchTitle = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = locationTerm === "" || job.location.toLowerCase().includes(locationTerm.toLowerCase());
    return matchTitle && matchLocation;
  });

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 h-[calc(100vh-100px)] flex flex-col">
      {/* Header & Search */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Briefcase className="text-primary" /> Job Board
        </h1>
        <p className="text-muted-foreground mb-6">Discover your next engineering role across multiple platforms.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Job title, company, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all"
            />
          </div>
          <div className="md:col-span-5 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="City, state, or 'Remote'"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <button className="w-full h-full bg-[var(--primary)] text-white rounded-xl font-medium flex items-center justify-center gap-2 py-3 hover:opacity-90 transition-opacity">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading open positions...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-4 bg-muted/30 rounded-full mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredJobs.map((job) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={job._id}
                  className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl hover:border-[var(--primary)]/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold group-hover:text-[var(--primary)] transition-colors">
                        {job.title}
                      </h3>
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: job.platformColor || '#4f46e5' }}
                      >
                        {job.platform || 'Direct'}
                      </span>
                    </div>
                    
                    <div className="text-[15px] font-medium text-foreground/80 mb-4">
                      {job.company}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {job.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" /> {job.jobType}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-500">{job.salaryRange}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-3 shrink-0">
                    <button 
                      onClick={() => toast.success("Application started!")}
                      className="flex-1 md:flex-none px-6 py-2.5 bg-[var(--primary)] text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Quick Apply
                    </button>
                    {job.externalApplyLink && (
                      <a 
                        href={job.externalApplyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-none px-6 py-2.5 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                      >
                        Source <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
