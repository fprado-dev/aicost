'use client';

import { useImageModelCalculator } from '@/app/hooks/useImageModelCalculator';
import { useTextModelCalculator } from '@/app/hooks/useTextModelCalculator';
import { useVideoModelCalculator } from '@/app/hooks/useVideoModelCalculator';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTierSummary } from '@/hooks/useTierSummary';
import { ProcessedTier } from '@/lib/tier.types';
import NumberFlow from '@number-flow/react';
import { InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import HeaderSummaryCard from './HeaderSummaryCard';


const getTypeColor = (type: string) => {
  switch (type) {
    case 'text': return 'bg-blue-100 text-blue-800';
    case 'image': return 'bg-green-100 text-green-800';
    case 'video': return 'bg-purple-100 text-purple-800';
    case 'audio': return 'bg-yellow-100 text-yellow-800';
    case 'hardware': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function TierSummaryCard({ tier }: { tier: ProcessedTier; }) {
  const { summary, isLoading: isSummaryLoading, updateSummary, isUpdating } = useTierSummary(tier.id);
  const [operationalOverheadPercentage, setOperationalOverheadPercentage] = useState<number>(0);

  const {
    inputTokens,
    outputTokens,
    setInputTokens,
    setOutputTokens,
    setMarginPercentage: setTextMarginPercentage,
    setUseExpensiveModel: setTextUseExpensiveModel,
    totalBaseCost: textTotalBaseCost,
    totalProfitValue: textTotalProfitValue,
    totalCost: textTotalCost,
    inputCost,
    outputCost,
    textMarginPercentage
  } = useTextModelCalculator(tier);

  const {
    imageCount,
    setImageCount,
    setMarginPercentage: setImageMarginPercentage,
    setUseExpensiveModel: setImageUseExpensiveModel,
    totalBaseCost: imageTotalBaseCost,
    totalProfitValue: imageTotalProfitValue,
    totalCost: imageTotalCost,
    imageMarginPercent,
  } = useImageModelCalculator(tier);

  const {
    videoSeconds,
    setVideoSeconds,
    setMarginPercentage: setVideoMarginPercentage,
    setUseExpensiveModel: setVideoUseExpensiveModel,
    totalBaseCost: videoTotalBaseCost,
    totalProfitValue: videoTotalProfitValue,
    totalCost: videoTotalCost,
    videoMarginPercentage
  } = useVideoModelCalculator(tier);

  useEffect(() => {
    if (summary) {
      setInputTokens(summary.input_tokens);
      setOutputTokens(summary.output_tokens);
      setImageCount(summary.image_count);
      setVideoSeconds(summary.video_seconds);
      setTextMarginPercentage(summary.text_margin_percentage);
      setImageMarginPercentage(summary.image_margin_percentage);
      setVideoMarginPercentage(summary.video_margin_percentage);
      setTextUseExpensiveModel(summary.text_use_expensive_model);
      setImageUseExpensiveModel(summary.image_use_expensive_model);
      setVideoUseExpensiveModel(summary.video_use_expensive_model);
      setOperationalOverheadPercentage(summary.operational_overhead_percentage);
    }
  }, [summary]);




  return (
    <div className='w-full grid grid-cols-4 gap-4'>
      <div className='w-full col-span-4 bg-sidebar rounded-xl p-6 border overflow-hidden relative'>
        {/* Header section with tier name and badge */}
        <HeaderSummaryCard
          tier={tier}
          isSummaryLoading={isSummaryLoading}
          isUpdating={isUpdating}
          setOperationalOverheadPercentage={setOperationalOverheadPercentage}
          operationalOverheadPercentage={operationalOverheadPercentage}
          updateSummary={updateSummary} />

        {/* Main pricing card */}
        <div className='grid grid-cols-1 gap-4 my-4 '>
          <div className='grid col-span-2 grid-cols-4  gap-6 '>
            {/* SUGGESTED PRICE */}
            <div className="relative min-h-40 flex items-center justify-center border-2 border-primary rounded-md transform scale-105">
              <div className="flex flex-col items-center gap-1">
                <div className='flex items-center justify-center gap-1'>
                  <p className="text-xs font-medium text-muted-foreground ">SUGGESTED PRICE
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="text-xs  text-center">Including {operationalOverheadPercentage}% operational overhead</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <span className="text-2xl font-bold text-primary">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                    value={(textTotalCost + imageTotalCost + videoTotalCost) * (1 + operationalOverheadPercentage / 100)} />
                </span>

              </div>
            </div>
            {/* BASE COST */}
            <div className="min-h-40 flex  items-center justify-center border rounded-md">
              <div className="flex flex-col items-center gap-1">
                <div className='flex items-center justify-center gap-1'>
                  <p className="text-xs font-medium text-muted-foreground ">BASE COST</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs text-center">Raw price of each model</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-2xl font-bold text-primary">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                    value={textTotalBaseCost + imageTotalBaseCost + videoTotalBaseCost} />
                </p>
              </div>
            </div>


            {/* PROFIT TIER MARGIN */}
            <div className="flex flex-col items-center justify-center border bg-sidebar rounded-lg">
              <div className='flex items-center justify-center gap-1'>
                <p className="text-xs font-medium text-muted-foreground ">PROFIT TIER
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Includes Profit over Models plus {operationalOverheadPercentage}% buffer for operational overhead</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold text-green-500">
                <NumberFlow
                  format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                  value={(textTotalProfitValue + imageTotalProfitValue + videoTotalProfitValue) + (textTotalCost + imageTotalCost + videoTotalCost) * (operationalOverheadPercentage / 100)} />

              </p>
            </div>
            {/* PROFIT MARGIN */}
            <div className="flex flex-col items-center justify-center border bg-sidebar rounded-lg">
              <div className='flex items-center justify-center gap-1'>
                <p className="text-xs font-medium text-muted-foreground ">PROFIT MODEL
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Profit over all Models</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold text-green-500">
                <NumberFlow
                  format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                  value={(textTotalProfitValue + imageTotalProfitValue + videoTotalProfitValue)} />

              </p>
            </div>
          </div>
        </div>

        {/* Model breakdown section */}
        <div className='w-full flex items-center justify-start gap-4 my-8'>
          <h3 className='text-lg font-semibold  text-center'>Model Usage Breakdown</h3>
          <Separator className='flex max-w-xs' />
        </div>

        <div className='flex gap-4'>
          {/* Text models */}
          <div className='p-5 w-full bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30'>
            <div className="flex items-center justify-between mb-4">
              <Badge className={getTypeColor('text')}>Text</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Input/Output Tokens</span>
                <span className="font-medium text-xs">{inputTokens.toLocaleString()}/{outputTokens.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cost Input Tokens</span>
                <span className="font-medium text-primary text-xs">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                    value={inputCost} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cost Output Tokens</span>
                <span className="font-medium text-primary text-xs">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                    value={outputCost} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Profit:</span>
                <span className="font-medium text-primary text-xs">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                    value={textTotalProfitValue} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Margin Profit Percent:</span>
                <span className="font-medium text-primary text-xs">
                  <NumberFlow
                    format={{ style: 'percent', trailingZeroDisplay: 'stripIfInteger' }}
                    value={textMarginPercentage} />
                </span>
              </div>
            </div>
          </div>

          {/* Image models */}
          <div className='p-5 w-full bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/30'>
            <div className="flex items-center justify-between mb-4">
              <Badge className={getTypeColor('image')}>Image</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Image Count:</span>
                <span className="font-medium text-xs">{imageCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cost per Image:</span>
                <span className="font-medium text-xs">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', minimumFractionDigits: 4 }}
                    value={imageCount > 0 ? imageTotalBaseCost / imageCount : 0} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cost:</span>
                <span className="font-medium text-xs text-primary">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                    value={imageTotalCost} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Profit:</span>
                <span className="font-medium text-primary text-xs">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                    value={imageTotalProfitValue} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Margin Profit Percent:</span>
                <span className="font-medium text-primary text-xs">
                  <NumberFlow
                    format={{ style: 'percent', trailingZeroDisplay: 'stripIfInteger' }}
                    value={imageMarginPercent} />
                </span>
              </div>
            </div>
          </div>

          {/* Video models */}
          <div className='p-5 w-full bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30'>
            <div className="flex items-center justify-between mb-4">
              <Badge className={getTypeColor('video')}>Video</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Duration:</span>
                <span className="font-medium text-xs">{videoSeconds.toLocaleString()}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cost per Second:</span>
                <span className="font-medium text-xs">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', minimumFractionDigits: 4 }}
                    value={videoSeconds > 0 ? videoTotalBaseCost / videoSeconds : 0} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cost:</span>
                <span className="font-medium text-xs text-primary">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                    value={videoTotalCost} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Profit:</span>
                <span className="font-medium text-primary text-xs">
                  <NumberFlow
                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                    value={videoTotalProfitValue} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Margin Profit Percent:</span>
                <span className="font-medium text-primary text-xs">
                  <NumberFlow
                    format={{ style: 'percent', trailingZeroDisplay: 'stripIfInteger' }}
                    value={videoMarginPercentage} />
                </span>
              </div>
            </div>
          </div>


        </div>

      </div>

    </div>
  );
}

