'use client';

import { ProcessedTier } from '@/lib/tier.types';
import { useState } from 'react';

export function useImageModelCalculator(tier: ProcessedTier) {
  const [imageCount, setImageCount] = useState<number>(100);
  const [marginPercentage, setMarginPercentage] = useState<number>(0);
  const [useExpensiveModel, setUseExpensiveModel] = useState(true);

  const getMostExpensiveModel = () => {
    return tier.models
      .filter(model => model.model_type === 'image')
      .reduce((prev, current) => {
        const prevCost = (prev.cost_per_image || 0);
        const currentCost = (current.cost_per_image || 0);
        return prevCost > currentCost ? prev : current;
      }, tier.models[0]);
  };

  const calculateBaseCost = () => {
    const imageModels = tier.models.filter(model => model.model_type === 'image');
    if (imageModels.length === 0) return 0;

    let baseCost = 0;
    if (useExpensiveModel) {
      const model = getMostExpensiveModel();
      const imageCost = model.cost_per_image! * imageCount;
      baseCost = imageCost;
    } else {
      const sortedModels = imageModels.sort((a, b) => {
        const aCost = (a.cost_per_image || 0);
        const bCost = (b.cost_per_image || 0);
        return bCost - aCost;
      });
      const remainingModels = sortedModels;
      if (remainingModels.length === 0) {
        const model = sortedModels[0];
        const inputCost = model.cost_per_image! * imageCount;
        baseCost = inputCost;
      } else {
        const avgImageCost = remainingModels.reduce((sum, model) => sum + (model.cost_per_image || 0), 0) / remainingModels.length;
        baseCost = avgImageCost * imageCount;
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
    imageCount,
    marginPercentage,
    useExpensiveModel,
    setImageCount,
    setMarginPercentage,
    setUseExpensiveModel,
    totalBaseCost,
    totalProfitValue,
    totalCost,
    getMostExpensiveModel,
    imageMarginPercent: marginPercentage / 100,
  };
}