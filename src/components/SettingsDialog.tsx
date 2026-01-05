import { Settings as SettingsIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import type { Settings } from '@/types/research';

interface SettingsDialogProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export function SettingsDialog({ settings, onSettingsChange }: SettingsDialogProps) {
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="icon" size="icon">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">General</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="stream">Stream responses</Label>
                <p className="text-xs text-muted-foreground">Show responses as they generate</p>
              </div>
              <Switch
                id="stream"
                checked={settings.streamResponse}
                onCheckedChange={(checked) => updateSetting('streamResponse', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autosave">Auto-save</Label>
                <p className="text-xs text-muted-foreground">Automatically save conversations</p>
              </div>
              <Switch
                id="autosave"
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Model Settings</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Temperature</Label>
                <span className="text-sm text-muted-foreground">{settings.temperature}</span>
              </div>
              <Slider
                value={[settings.temperature]}
                onValueChange={([value]) => updateSetting('temperature', value)}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower values make output more focused, higher values more creative
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Max Tokens</Label>
                <span className="text-sm text-muted-foreground">{settings.maxTokens}</span>
              </div>
              <Slider
                value={[settings.maxTokens]}
                onValueChange={([value]) => updateSetting('maxTokens', value)}
                min={256}
                max={8192}
                step={256}
                className="w-full"
              />
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Appearance</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
              </div>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={12}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
