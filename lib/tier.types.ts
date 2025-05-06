// import { ModelOption } from "./model.types";

import { Model } from "./supabase/model.service";

// Define a type for the join table result
export type TierModelJoin = {
  models_default: Model;
};

// Update the Tier type to match the query structure
export type Tier = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  created_at: string;
  isActive: boolean;
  // Other tier properties
  tiers_models?: TierModelJoin[]; // This matches your query structure
};

// If you want a processed version with direct models array
export type ProcessedTier = Omit<Tier, 'tiers_models'> & {
  models: Model[];
};

// Tier Summary type for storing calculation parameters and results
export type TierSummary = {
  id: string;
  tier_id: string;
  project_id: string;
  user_id: string;
  created_at: string;
  input_tokens: number;
  output_tokens: number;
  image_count: number;
  video_seconds: number;
  text_margin_percentage: number;
  image_margin_percentage: number;
  video_margin_percentage: number;
  text_use_expensive_model: boolean;
  image_use_expensive_model: boolean;
  video_use_expensive_model: boolean;
  operational_overhead_percentage: number;
};

export interface TierQuantity {
  textTokens?: {
    input: number;
    output: number;
  };
  imageCount?: number;
  videoSeconds?: number;
}

export interface TierMargins {
  text?: number;
  image?: number;
  video?: number;
}