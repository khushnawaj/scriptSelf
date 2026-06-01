const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    salaryRange: String,
    jobType: String,
    platform: String,
    platformColor: String,
    description: String,
    externalApplyLink: String,
    tags: [String],
    requirements: [String],
    responsibilities: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Job", jobSchema);
