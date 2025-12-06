"use client";

import { useState, useEffect } from "react";
import { platformClientAPI } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Info,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// DNS Configuration from environment variables
const DNS_A_RECORD_IP =
  process.env.NEXT_PUBLIC_DNS_A_RECORD_IP || "35.237.10.52";
const DNS_CNAME_TARGET =
  process.env.NEXT_PUBLIC_DNS_CNAME_TARGET || "tenant.workzone.tech";

// Helper to determine if domain is a subdomain
const isSubdomain = (domain: string): boolean => {
  const parts = domain.split(".");
  // A domain like "example.com" has 2 parts
  // A subdomain like "jobs.example.com" has 3+ parts
  return parts.length > 2;
};

interface CustomDomain {
  domain: string;
  status: "pending" | "verified" | "active";
  addedAt: string;
}

export function CustomDomainManager() {
  const { customDomain } = useAuth();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dnsInstructions, setDnsInstructions] = useState<{
    domain: string;
    isSubdomain: boolean;
    message?: string;
  } | null>(null);

  // Load existing domain from auth state on mount
  useEffect(() => {
    if (customDomain) {
      setDomains([
        {
          domain: customDomain,
          status: "active",
          addedAt: new Date().toISOString(),
        },
      ]);
    }
  }, [customDomain]);

  const validateDomain = (domain: string): boolean => {
    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    if (!validateDomain(newDomain.trim())) {
      toast.error(
        "Please enter a valid domain name (e.g., hr.yourcompany.com)"
      );
      return;
    }

    setIsAdding(true);
    setDnsInstructions(null);

    try {
      await platformClientAPI.linkCustomDomain(newDomain.trim());

      // Add to local state and localStorage
      const newCustomDomain: CustomDomain = {
        domain: newDomain.trim(),
        status: "active",
        addedAt: new Date().toISOString(),
      };
      setDomains([newCustomDomain]); // Replace existing (only one domain allowed)
      localStorage.setItem("custom_domain", newDomain.trim());
      setNewDomain("");
      setShowAddForm(false);

      toast.success("Domain linked successfully!", {
        description: "Your custom domain is now active.",
      });
    } catch (error) {
      console.error("Failed to add domain:", error);
      const err = error as { status?: number; message?: string };
      console.log("Error type:", typeof error);
      console.log("Error status:", err?.status);
      console.log("Error message:", err?.message);

      if (err.status === 400 && err.message) {
        // Backend returns DNS configuration instructions
        // Show structured DNS instructions based on domain type
        const domain = newDomain.trim();
        console.log("Setting DNS instructions for domain:", domain);
        setDnsInstructions({
          domain,
          isSubdomain: isSubdomain(domain),
          message: err.message,
        });
        toast.info("DNS Configuration Required", {
          description: "Please configure your DNS settings first.",
        });
      } else if (err.status === 409) {
        toast.error("Domain already linked", {
          description: "This domain is already linked to another workspace.",
        });
      } else {
        toast.error("Failed to add domain", {
          description: err.message || "Please try again later.",
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveDomain = async (domain: string) => {
    setDeletingDomain(domain);
    try {
      await platformClientAPI.unlinkCustomDomain(domain);
      setDomains((prev) => prev.filter((d) => d.domain !== domain));
      localStorage.removeItem("custom_domain");
      toast.success("Domain removed successfully");
    } catch (error) {
      console.error("Failed to remove domain:", error);
      const err = error as { message?: string };
      toast.error("Failed to remove domain", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setDeletingDomain(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusBadge = (status: CustomDomain["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "verified":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending Verification
          </Badge>
        );
    }
  };

  return (
    <Card className="border-none shadow-xl dark:bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl dark:text-white">
                Custom Domains
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Connect your own domain to your workspace
              </CardDescription>
            </div>
          </div>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Domain
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Domain Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium dark:text-gray-300">
                      Domain Name
                    </Label>
                    <div className="flex gap-3 mt-2">
                      <Input
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        placeholder="hr.yourcompany.com"
                        className="flex-1 dark:bg-gray-800 dark:border-gray-700"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddDomain()
                        }
                      />
                      <Button
                        onClick={handleAddDomain}
                        disabled={isAdding}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      >
                        {isAdding ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewDomain("");
                          setDnsInstructions(null);
                        }}
                        className="dark:border-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Enter your custom domain (e.g., hr.yourcompany.com)
                    </p>
                  </div>

                  {/* DNS Instructions from Backend */}
                  {dnsInstructions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-800 dark:text-amber-200">
                            DNS Configuration Required
                          </h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 mb-3">
                            Configure your DNS before linking{" "}
                            <strong>{dnsInstructions.domain}</strong>:
                          </p>

                          {/* A Record Instructions - Always shown */}
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg font-mono text-sm mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Option 1: A Record{" "}
                                {!dnsInstructions.isSubdomain &&
                                  "(Recommended)"}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  Type
                                </span>
                                <div className="text-gray-900 dark:text-white font-medium">
                                  A
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  Host/Name
                                </span>
                                <div className="text-gray-900 dark:text-white font-medium">
                                  {dnsInstructions.isSubdomain
                                    ? dnsInstructions.domain.split(".")[0]
                                    : "@"}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  Value/Points to
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {DNS_A_RECORD_IP}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() =>
                                      copyToClipboard(
                                        DNS_A_RECORD_IP,
                                        "IP address"
                                      )
                                    }
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* CNAME Record Instructions - Only for subdomains */}
                          {dnsInstructions.isSubdomain && (
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg font-mono text-sm mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Option 2: CNAME Record (Alternative)
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                                    Type
                                  </span>
                                  <div className="text-gray-900 dark:text-white font-medium">
                                    CNAME
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                                    Host/Name
                                  </span>
                                  <div className="text-gray-900 dark:text-white font-medium">
                                    {dnsInstructions.domain.split(".")[0]}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                                    Value/Points to
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-900 dark:text-white font-medium break-all">
                                      {DNS_CNAME_TARGET}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 flex-shrink-0"
                                      onClick={() =>
                                        copyToClipboard(
                                          DNS_CNAME_TARGET,
                                          "CNAME target"
                                        )
                                      }
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Domain vs Subdomain explanation */}
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {dnsInstructions.isSubdomain ? (
                                <>
                                  <strong>Subdomain detected:</strong> You can
                                  use either an A record or a CNAME record.
                                  CNAME is often easier to configure.
                                </>
                              ) : (
                                <>
                                  <strong>Root domain detected:</strong> Root
                                  domains (like example.com) require an A
                                  record. CNAME records cannot be used for root
                                  domains.
                                </>
                              )}
                            </p>
                          </div>

                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              <strong>Steps:</strong>
                            </p>
                            <ol className="text-xs text-blue-600 dark:text-blue-400 mt-1 list-decimal list-inside space-y-1">
                              <li>
                                Go to your domain registrar&apos;s DNS settings
                              </li>
                              <li>
                                Add{" "}
                                {dnsInstructions.isSubdomain
                                  ? "one of the DNS records"
                                  : "the A record"}{" "}
                                shown above
                              </li>
                              <li>
                                Wait for DNS propagation (can take up to 48
                                hours)
                              </li>
                              <li>
                                Click &quot;Add&quot; again to verify and link
                                the domain
                              </li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Domains List */}
        {domains.length > 0 ? (
          <div className="space-y-4">
            {domains.map((domain, index) => (
              <motion.div
                key={domain.domain}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {domain.domain}
                        </span>
                        {getStatusBadge(domain.status)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Added {new Date(domain.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(`https://${domain.domain}`, "_blank")
                      }
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {deletingDomain === domain.domain ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-white">
                            Remove Domain
                          </AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to remove{" "}
                            <strong>{domain.domain}</strong>? This will
                            disconnect the domain from your workspace.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="dark:border-gray-700 dark:text-gray-300">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveDomain(domain.domain)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No custom domains
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Add a custom domain to access your workspace at your own URL
              (e.g., hr.yourcompany.com)
            </p>
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Domain
              </Button>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">How custom domains work</p>
              <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                <li>Add your domain and configure DNS records</li>
                <li>We automatically provision SSL certificates</li>
                <li>Your team can access the workspace at your custom URL</li>
                <li>DNS propagation may take up to 48 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
