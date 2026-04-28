import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================
// USER MODEL
// ============================
export interface IUser extends Document {
  name: string;
  email: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// ============================
// HOLDING MODEL
// ============================
export interface IHolding extends Document {
  userId: mongoose.Types.ObjectId;
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  weight: number;
  beta: number;
  sector: string;
}

const HoldingSchema = new Schema<IHolding>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  ticker: { type: String, required: true },
  name: { type: String, required: true },
  shares: { type: Number, required: true },
  avgCost: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  weight: { type: Number, required: true },
  beta: { type: Number, required: true },
  sector: { type: String, required: true },
});

// ============================
// INSIGHT MODEL
// ============================
export interface IInsight extends Document {
  holdingId: mongoose.Types.ObjectId;
  ticker: string;
  headline: string;
  explanation: string;
  literacyCard: {
    title: string;
    content: string;
  };
  generatedAt: Date;
  dataSnapshot: {
    returnPct: number;
    volatility: number;
    beta: number;
    maxDrawdown: number;
  };
}

const InsightSchema = new Schema<IInsight>({
  holdingId: { type: Schema.Types.ObjectId, ref: 'Holding' },
  ticker: { type: String, required: true },
  headline: { type: String, required: true },
  explanation: { type: String, required: true },
  literacyCard: {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  generatedAt: { type: Date, default: Date.now },
  dataSnapshot: {
    returnPct: Number,
    volatility: Number,
    beta: Number,
    maxDrawdown: Number,
  },
});

// Prevent model recompilation in dev (Next.js hot reload)
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export const Holding: Model<IHolding> =
  mongoose.models.Holding || mongoose.model<IHolding>('Holding', HoldingSchema);

export const Insight: Model<IInsight> =
  mongoose.models.Insight || mongoose.model<IInsight>('Insight', InsightSchema);
