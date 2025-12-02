import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    team: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    status: {
      type: String,
      enum: ["active", "archived", "completed"],
      default: "active"
    },
    color: {
      type: String,
      default: "#3b82f6" // رنگ آبی پیش‌فرض
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    tags: [String]
  },
  { timestamps: true }
);

// ایندکس برای جستجوی سریع‌تر
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ name: "text", description: "text" });

export default mongoose.model("Project", projectSchema);
