'use client';

import { ProcessedTier } from "@/lib/tier.types";
import { useState } from "react";

export function useVideoModelCalculator(tier: ProcessedTier) {
  const [videoSeconds, setVideoSeconds] = useState<number>(45);
  const [marginPercentage, setMarginPercentage] = useState<number>(0);
  const [useExpensiveModel, setUseExpensiveModel] = useState(true);

  const getMostExpensiveModel = () => {
    return tier.models
      .filter(model => model.model_type === 'video')
      .reduce((prev, current) => {
        const prevCost = (prev.cost_per_second || 0);
        const currentCost = (current.cost_per_second || 0);
        return prevCost > currentCost ? prev : current;
      }, tier.models[0]);
  };

  const calculateBaseCost = () => {
    const videoModels = tier.models.filter(model => model.model_type === 'video');
    if (videoModels.length === 0) return 0;

    let baseCost = 0;
    if (useExpensiveModel) {
      const model = getMostExpensiveModel();
      const videoCost = model.cost_per_second! * videoSeconds;
      baseCost = videoCost;
    } else {
      const sortedModels = videoModels.sort((a, b) => {
        const aCost = (a.cost_per_second || 0);
        const bCost = (b.cost_per_second || 0);
        return bCost - aCost;
      });
      const remainingModels = sortedModels;
      if (remainingModels.length === 0) {
        const model = sortedModels[0];
        const inputCost = model.cost_per_second! * videoSeconds;
        baseCost = inputCost;
      } else {
        const avgVideoCost = remainingModels.reduce((sum, model) => sum + (model.cost_per_second || 0), 0) / remainingModels.length;
        baseCost = avgVideoCost * videoSeconds;
      }
    }
    return baseCost;
  };

  const calculateProfitValue = (baseCost: number) => {
    return baseCost * (marginPercentage / 100);
  };

  const calculateTotalCost = (baseCost: number, profitValue: number) => {
    return baseCost + profitValue;
  };

  const totalBaseCost = calculateBaseCost();
  const totalProfitValue = calculateProfitValue(totalBaseCost);
  const totalCost = calculateTotalCost(totalBaseCost, totalProfitValue);

  return {
    videoSeconds,
    marginPercentage,
    useExpensiveModel,
    setVideoSeconds,
    setMarginPercentage,
    setUseExpensiveModel,
    totalBaseCost,
    totalProfitValue,
    totalCost,
    getMostExpensiveModel,
    videoMarginPercentage: marginPercentage / 100,
  };
}