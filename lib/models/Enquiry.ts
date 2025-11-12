import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor" },
    service: String,
    channel: String, // e.g., "chatbot"
    status: { type: String, default: "new" }, // new|open|pending|assigned|converted|won|closed_won|lead
    
    // Agent tracking fields
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Agent who added this enquiry
    addedByName: String, // Agent name for quick access
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Currently assigned agent
    agentName: String, // Assigned agent name
    
    // Additional fields for compatibility
    visitorName: String,
    phoneNumber: String,
    email: String,
    enquiryType: String,
    enquiryDetails: String,
    priority: String,
    comments: String,
    amount: Number,
    subservice: String,
    organization: String,
    region: String,
  },
  { timestamps: true, collection: "enquiries", strict: false }
);

// Indexes for performance
EnquirySchema.index({ visitorId: 1 });
EnquirySchema.index({ addedBy: 1 });
EnquirySchema.index({ assignedAgent: 1 });
EnquirySchema.index({ status: 1 });
EnquirySchema.index({ createdAt: -1 });

export default mongoose.models.Enquiry ?? mongoose.model("Enquiry", EnquirySchema);