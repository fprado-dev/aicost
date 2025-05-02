import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProcessedTier, TierSummary } from "@/lib/tier.types";
import { InfoIcon } from "lucide-react";


type THeaderSummaryCardProps = {
  tier: ProcessedTier;
  setOperationalOverheadPercentage: (value: number) => void;
  updateSummary: (summaryData: Partial<Omit<TierSummary, 'id' | 'created_at' | "project_id" | "user_id">>) => void;
  operationalOverheadPercentage: number;
  isSummaryLoading: boolean;
  isUpdating: boolean;

};

export default function HeaderSummaryCard({ tier, operationalOverheadPercentage, isSummaryLoading, isUpdating, setOperationalOverheadPercentage, updateSummary }: THeaderSummaryCardProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <Badge variant="outline" className='text-xs px-4 py-2 rounded-md mb-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'>
          {tier.models.length} AI Models
        </Badge>

        <h2 className='text-2xl font-bold tracking-tight mb-2'>{tier.name} Pricing</h2>
        <p className='text-sm text-muted-foreground'>Complete cost breakdown based on your configuration</p>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">Operational Buffer</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="w-16">
          <Input
            type="number"
            value={operationalOverheadPercentage}
            onChange={(e) => setOperationalOverheadPercentage(Number(e.target.value))}
            className="text-sm px-2  bg-background focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="px-2 py-1 min-w-16 text-xs bg-sidebar-foreground text-white"
          onClick={() => {
            updateSummary({
              tier_id: tier.id,
              operational_overhead_percentage: operationalOverheadPercentage,
            });
          }}
          disabled={isSummaryLoading}
        >
          {isSummaryLoading || isUpdating ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}