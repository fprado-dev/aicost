'use server';

import { createClient } from '@/utils/supabase/server';
import { ProcessedTier, Tier } from '../tier.types';
import { getActiveProject } from './project.service';


type TGetTiers = {
};
export async function getTiers({ }: TGetTiers) {
  const supabase = await createClient();

  const activeProject = await getActiveProject();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tiers, error } = await supabase.from('tiers')
    .select(`
      *,
      tiers_models(
        models_default(*)
      )
    `)
    .eq('project_id', activeProject?.id)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const processedTiers: ProcessedTier[] = tiers?.map(tier => {
    // Properly type the tier from the database
    const typedTier = tier as Tier;

    return {
      ...typedTier,
      // Each tm.models is a single Model object, not an array
      models: typedTier.tiers_models?.map(tm => tm.models_default) || []
    };
  }) || [];

  return processedTiers;
}


export async function createTier(newTierName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const activeProject = await getActiveProject();

  const { data: tier, error } = await supabase.from('tiers')
    .insert({ name: newTierName, project_id: activeProject?.id, user_id: user?.id })
    .select('*')
    .single();

  if (error) throw error;
  return tier;
}

export async function updateTier(id: string, name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const activeProject = await getActiveProject();

  const { data: tier, error } = await supabase.from('tiers')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user?.id)
    .eq('project_id', activeProject?.id)
    .select('*')
    .single();

  if (error) throw error;
  return tier;
}

export async function deleteTier(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const activeProject = await getActiveProject();

  const { error } = await supabase.from('tiers')
    .delete()
    .eq('id', id)
    .eq('user_id', user?.id)
    .eq('project_id', activeProject?.id);

  if (error) throw error;
  return true;
}

export async function addModelsToTier({
  tierId,
  modelIds
}: {
  tierId: string;
  modelIds: string[];
}): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Check if tier exists
  const { error: tierError } = await supabase
    .from('tiers')
    .select('id')
    .eq('id', tierId)
    .eq('user_id', user?.id)
    .single();

  if (tierError) {
    throw new Error(`Tier not found: ${tierError.message}`);
  }

  // Prepare the associations to insert
  const associations = modelIds.map(modelId => ({
    tier_id: tierId,
    model_id: modelId,
    user_id: user?.id
  }));

  // Insert all associations at once
  const { error } = await supabase
    .from('tiers_models')
    .upsert(associations, {
      ignoreDuplicates: true
    })
    .eq('user_id', user?.id);

  if (error) {
    throw new Error(`Failed to add models to tier: ${error.message}`);
  }
}

export async function removeModelsFromTier({
  tierId,
  modelIds
}: {
  tierId: string;
  modelIds: string[];
}): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('tiers_models')
    .delete()
    .eq('tier_id', tierId)
    .eq('user_id', user?.id)
    .in('model_id', modelIds);

  if (error) {
    throw new Error(`Failed to remove models from tier: ${error.message}`);
  }
}

export async function updateTierActiveStatus(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const activeProject = await getActiveProject();

  if (isActive) {
    // First, set all tiers to inactive
    await supabase.from('tiers')
      .update({ isActive: false })
      .eq('user_id', user?.id)
      .eq('project_id', activeProject?.id);
  }

  // Then update the specified tier
  const { error } = await supabase.from('tiers')
    .update({ isActive: isActive })
    .eq('id', id)
    .eq('user_id', user?.id)
    .eq('project_id', activeProject?.id);

  if (error) throw error;
}