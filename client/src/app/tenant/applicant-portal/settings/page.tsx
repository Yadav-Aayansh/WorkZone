export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-border">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium">Account</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Update your account information
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how you receive notifications
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium">Privacy</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your privacy settings
          </p>
        </div>
      </div>
    </div>
  );
}
