"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { platformClientAPI, PlatformAPIError } from "@/lib/api";
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

export default function InviteEmployee() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "employee" as "employee" | "manager" | "recruiter",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await platformClientAPI.inviteUser({
        email: formData.email,
        name: formData.name,
        role: formData.role,
      });

      setSuccess(true);
      showToast({
        type: "success",
        title: "Invitation sent!",
        message: `Successfully invited ${formData.email} as ${formData.role}`,
      });

      // Reset form
      setFormData({
        email: "",
        name: "",
        role: "employee",
      });

      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      if (err instanceof PlatformAPIError) {
        setError(err.message);
        showToast({
          type: "error",
          title: "Invitation failed",
          message: err.message,
        });
      } else {
        const errorMessage = "Failed to send invitation. Please try again.";
        setError(errorMessage);
        showToast({
          type: "error",
          title: "Invitation failed",
          message: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Employee</DialogTitle>
          <DialogDescription>
            Send an invitation to a new employee, manager, or recruiter to join
            your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Invitation sent successfully! The user will receive an email
                  with a signup link.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="employee@company.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                disabled={isSubmitting || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isSubmitting || success}
              />
              <p className="text-xs text-muted-foreground">
                Name will be pre-filled in their signup form
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: string) => handleChange("role", value)}
                disabled={isSubmitting || success}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Determines their access level and permissions
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || success}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Sent!
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
