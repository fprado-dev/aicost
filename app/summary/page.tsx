'use client';

import { Button } from '@/components/ui/button';
import { useTiers } from '@/hooks/useTiers';
import { ProcessedTier } from '@/lib/tier.types';
import { useEffect, useState } from 'react';
import { TierSummaryCard } from './components/TierSummaryCard';




export default function SummaryPage() {
  const { tiers, isLoading } = useTiers();
  const [selectedTier, setSelectedTier] = useState<ProcessedTier>();


  useEffect(() => {
    if (tiers?.length > 0) {
      setSelectedTier(tiers[0]);
    }
  }, [tiers]);


  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex flex-col gap-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-2" />
              <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Tier Buttons Skeleton */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-[120px] bg-gray-200 rounded-md animate-pulse" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="flex">
            <div className="w-full bg-gray-200 rounded-lg h-[400px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tier Summaries</h1>
            <p className="text-muted-foreground">Overview of all your tier configurations and costs</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {tiers?.map((tier) => (
            <Button
              key={tier.id}
              variant={selectedTier?.id === tier.id ? 'default' : 'outline'}
              onClick={() => setSelectedTier(tier)}
              className="min-w-[120px]"
            >
              {tier.name}
            </Button>
          ))}
        </div>
        {tiers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No Tiers Created Yet</h3>
              <p className="text-muted-foreground">Create your first tier to see the summary details.</p>
            </div>
          </div>
        ) : selectedTier && (
          <div className="flex">
            <TierSummaryCard tier={selectedTier!} />
          </div>
        )}

      </div>
    </div>
  );
}