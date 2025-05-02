'use client';

import { ProcessedTier } from "@/lib/tier.types";
import { useState } from "react";

export function useTextModelCalculator(tier: ProcessedTier) {
  const [inputTokens, setInputTokens] = useState<number>(1000000);
  const [outputTokens, setOutputTokens] = useState<number>(1000000);
  const [marginPercentage, setMarginPercentage] = useState<number>(0);
  const [useExpensiveModel, setUseExpensiveModel] = useState(true);

  const getMostExpensiveModel = () => {
    return tier.models
      .filter(model => model.model_type === 'text')
      .reduce((prev, current) => {
        const prevCost = (prev.input_cost_per_million || 0) + (prev.output_cost_per_million || 0);
        const currentCost = (current.input_cost_per_million || 0) + (current.output_cost_per_million || 0);
        return prevCost > currentCost ? prev : current;
      }, tier.models[0]);
  };

  const calculateCosts = () => {
    const textModels = tier.models.filter(model => model.model_type === 'text');
    if (textModels.length === 0) return { inputCost: 0, outputCost: 0 };

    if (useExpensiveModel) {
      const model = getMostExpensiveModel();
      const inputCost = ((model.input_cost_per_million || 0) / 1000000) * inputTokens;
      const outputCost = ((model.output_cost_per_million || 0) / 1000000) * outputTokens;
      return { inputCost, outputCost };
    } else {
      const sortedModels = textModels.sort((a, b) => {
        const aCost = (a.input_cost_per_million || 0) + (a.output_cost_per_million || 0);
        const bCost = (b.input_cost_per_million || 0) + (b.output_cost_per_million || 0);
        return bCost - aCost;
      });
      const remainingModels = sortedModels;
      if (remainingModels.length === 0) {
        const model = sortedModels[0];
        const inputCost = ((model.input_cost_per_million || 0) / 1000000) * inputTokens;
        const outputCost = ((model.output_cost_per_million || 0) / 1000000) * outputTokens;
        return { inputCost, outputCost };
      } else {
        const avgInputCost = remainingModels.reduce((sum, model) => sum + (model.input_cost_per_million || 0), 0) / remainingModels.length;
        const avgOutputCost = remainingModels.reduce((sum, model) => sum + (model.output_cost_per_million || 0), 0) / remainingModels.length;
        return {
          inputCost: (avgInputCost / 1000000) * inputTokens,
          outputCost: (avgOutputCost / 1000000) * outputTokens
        };
      }
    }
  };

  const calculateProfitValue = (baseCost: number) => {
    return baseCost * (marginPercentage / 100);
  };

  const calculateTotalCost = (baseCost: number, profitValue: number) => {
    return baseCost + profitValue;
  };

  const { inputCost, outputCost } = calculateCosts();
  const totalBaseCost = inputCost + outputCost;
  const totalProfitValue = calculateProfitValue(totalBaseCost);
  const totalCost = calculateTotalCost(totalBaseCost, totalProfitValue);

  return {
    // State
    inputTokens,
    outputTokens,
    marginPercentage,
    useExpensiveModel,
    // Setters
    setInputTokens,
    setOutputTokens,
    setMarginPercentage,
    setUseExpensiveModel,
    // Calculations
    inputCost,
    outputCost,
    totalBaseCost,
    totalProfitValue,
    totalCost,
    // Helper functions
    getMostExpensiveModel,

    // Text Margin Percer
    textMarginPercentage: marginPercentage / 100,
  };
}