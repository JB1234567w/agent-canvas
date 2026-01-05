import { Zap, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LLMSelector } from './LLMSelector';
import { SettingsDialog } from './SettingsDialog';
import type { LLMModel, Settings } from '@/types/research';

interface TopBarProps {
  selectedModel: LLMModel;
  onSelectModel: (model: LLMModel) => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  showHistory: boolean;
  showCanvas: boolean;
  onToggleHistory: () => void;
  onToggleCanvas: () => void;
}

export function TopBar({
  selectedModel,
  onSelectModel,
  settings,
  onSettingsChange,
  showHistory,
  showCanvas,
  onToggleHistory,
  onToggleCanvas,
}: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/50 px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold gradient-text">DeepResearch</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <LLMSelector selectedModel={selectedModel} onSelectModel={onSelectModel} />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={showHistory ? 'secondary' : 'icon'}
          size="icon"
          onClick={onToggleHistory}
          title="Toggle history panel"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
        <Button
          variant={showCanvas ? 'secondary' : 'icon'}
          size="icon"
          onClick={onToggleCanvas}
          title="Toggle canvas panel"
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <SettingsDialog settings={settings} onSettingsChange={onSettingsChange} />
      </div>
    </header>
  );
}
