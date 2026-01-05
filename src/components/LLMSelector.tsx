import { ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { LLM_MODELS, type LLMModel } from '@/types/research';

interface LLMSelectorProps {
  selectedModel: LLMModel;
  onSelectModel: (model: LLMModel) => void;
}

export function LLMSelector({ selectedModel, onSelectModel }: LLMSelectorProps) {
  const groupedModels = LLM_MODELS.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, LLMModel[]>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="truncate">{selectedModel.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px] bg-popover border-border">
        {Object.entries(groupedModels).map(([provider, models], idx) => (
          <div key={provider}>
            {idx > 0 && <DropdownMenuSeparator className="bg-border" />}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {provider}
            </DropdownMenuLabel>
            {models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onSelectModel(model)}
                className={cn(
                  'flex flex-col items-start gap-0.5 cursor-pointer',
                  selectedModel.id === model.id && 'bg-secondary'
                )}
              >
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
