import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Key, Zap } from "lucide-react";

type Props = {
  isDemoMode: boolean;
  onEnableDemo: () => void;
};

export function SetupNotice({ isDemoMode, onEnableDemo }: Props) {
  if (isDemoMode) {
    return (
      <Card className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Zap className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Demo Mode Available</h3>
          <p className="text-muted-foreground mt-1">
            You can try the Discover Contacts tool with sample data to see how it works.
            For live data, you'll need to configure external provider API keys.
          </p>
        </div>
        <Button onClick={onEnableDemo} className="mx-auto">
          Try Demo Mode
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Key className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">API Keys Required</h3>
          <p className="text-muted-foreground mt-1">
            To use the Discover Contacts tool, you need to configure at least one of these external providers:
          </p>
        </div>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="p-3 border rounded-lg">
          <div className="font-medium text-sm">Hunter.io</div>
          <div className="text-xs text-muted-foreground mt-1">
            Email verification and finding
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Set <code className="bg-muted px-1 rounded">HUNTER_API_KEY</code>
          </div>
        </div>
        
        <div className="p-3 border rounded-lg">
          <div className="font-medium text-sm">Exa AI</div>
          <div className="text-xs text-muted-foreground mt-1">
            LinkedIn profile discovery
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Set <code className="bg-muted px-1 rounded">EXA_API_KEY</code>
          </div>
        </div>
        
        <div className="p-3 border rounded-lg">
          <div className="font-medium text-sm">Apollo</div>
          <div className="text-xs text-muted-foreground mt-1">
            Contact enrichment and verification
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Set <code className="bg-muted px-1 rounded">APOLLO_API_KEY</code>
          </div>
        </div>
        
        <div className="p-3 border rounded-lg">
          <div className="font-medium text-sm">Demo Mode</div>
          <div className="text-xs text-muted-foreground mt-1">
            Try with sample data
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Set <code className="bg-muted px-1 rounded">NEXT_PUBLIC_CONTACTS_DEMO_MODE=true</code>
          </div>
        </div>
      </div>
      
      <div className="pt-2">
        <Button 
          onClick={onEnableDemo} 
          variant="outline" 
          className="w-full sm:w-auto"
        >
          <Zap className="h-4 w-4 mr-2" />
          Try Demo Mode Instead
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground pt-2 border-t">
        <p>
          <strong>Note:</strong> These are external services that require separate accounts and API keys. 
          Demo mode lets you explore the interface without external dependencies.
        </p>
      </div>
    </Card>
  );
}
