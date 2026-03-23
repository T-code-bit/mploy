import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, ShieldCheck, Building2, Briefcase, Filter } from "lucide-react";
import { motion } from "framer-motion";

const jobListings = [
  { id: 1, title: "Frontend Developer", company: "TechCorp SA", location: "Johannesburg", type: "Full-time", salary: "R35,000 – R55,000", posted: "2 days ago", verified: true, tags: ["React", "TypeScript", "Tailwind"] },
  { id: 2, title: "Marketing Coordinator", company: "BrandWave", location: "Cape Town", type: "Full-time", salary: "R18,000 – R25,000", posted: "1 day ago", verified: true, tags: ["Digital Marketing", "SEO", "Content"] },
  { id: 3, title: "Data Analyst", company: "FinInsight", location: "Remote", type: "Contract", salary: "R40,000 – R60,000", posted: "3 days ago", verified: true, tags: ["Python", "SQL", "Power BI"] },
  { id: 4, title: "HR Administrator", company: "PeopleFirst", location: "Durban", type: "Full-time", salary: "R15,000 – R22,000", posted: "5 hours ago", verified: true, tags: ["HR", "Payroll", "Recruitment"] },
  { id: 5, title: "Graphic Designer", company: "CreativeHub", location: "Pretoria", type: "Part-time", salary: "R12,000 – R18,000", posted: "1 week ago", verified: true, tags: ["Figma", "Adobe Suite", "Branding"] },
  { id: 6, title: "Software Engineer", company: "CloudNine Dev", location: "Remote", type: "Full-time", salary: "R50,000 – R80,000", posted: "4 days ago", verified: true, tags: ["Node.js", "AWS", "Docker"] },
];

const Jobs = () => {
  const [search, setSearch] = useState("");
  const filtered = jobListings.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Verified Job Vault
            </h1>
            <p className="text-muted-foreground">
              Every listing authenticated. Zero scams. Real opportunities only.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, or skills..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["All", "Remote", "Full-time", "Part-time", "Contract", "IT", "Marketing", "Finance"].map((f) => (
              <Badge
                key={f}
                variant={f === "All" ? "default" : "outline"}
                className={`cursor-pointer ${f === "All" ? "bg-gradient-primary text-primary-foreground" : ""}`}
              >
                {f}
              </Badge>
            ))}
          </div>

          {/* Listings */}
          <div className="grid gap-4">
            {filtered.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-card-foreground text-lg">{job.title}</h3>
                      {job.verified && (
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.type}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.posted}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-semibold text-foreground">{job.salary}</p>
                    <p className="text-xs text-muted-foreground">per month</p>
                    <Button size="sm" className="mt-3 bg-gradient-primary text-primary-foreground">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No jobs found matching your search.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;
