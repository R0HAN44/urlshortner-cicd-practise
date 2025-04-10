import mongoose, { Document } from 'mongoose';

export interface IUrl extends Document {
  originalUrl: string;
  shortUrl: string;
  urlCode: string;
  createdAt: Date;
  clicks: number;
}

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  urlCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  clicks: {
    type: Number,
    default: 0,
  },
});

export const Url = mongoose.model<IUrl>('Url', urlSchema);