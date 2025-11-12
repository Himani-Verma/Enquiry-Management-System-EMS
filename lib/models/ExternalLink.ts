import mongoose, { Document, Schema } from 'mongoose';

export interface IExternalLink extends Document {
  title: string;
  url: string;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const externalLinkSchema = new Schema<IExternalLink>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        try {
          const url = new URL(v);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      message: 'URL must be a valid HTTP or HTTPS URL'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    trim: true,
    maxlength: 120
  }
}, {
  timestamps: true
});

// Indexes
externalLinkSchema.index({ createdAt: -1 });
externalLinkSchema.index({ category: 1 });

// Create and export the model
const ExternalLink = mongoose.models.ExternalLink || mongoose.model<IExternalLink>('ExternalLink', externalLinkSchema);
export default ExternalLink;
