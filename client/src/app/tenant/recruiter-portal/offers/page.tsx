"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
// import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { RecruiterPortalLayout } from "@/components/tenant/recruiter-portal-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  Send,
  Eye,
} from "lucide-react";
import candidatesData from "@/data/tenant/candidates.json";
import { toast } from "sonner";

function CreateOfferContent() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;

  const candidate = candidatesData.find((c) => c.id === candidateId);

  const [baseSalary, setBaseSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [benefits, setBenefits] = useState([
    "Health Insurance",
    "Remote Work Options",
  ]);
  const [newBenefit, setNewBenefit] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The candidate you&#39;re trying to create an offer for doesn&#39;t exist.
          </p>
          <Button
            onClick={() => router.push("/tenant/recruiter-portal/offers")}
          >
            Back to Offers
          </Button>
        </div>
      </div>
    );
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleGenerateOffer = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 2000);
  };

  const handleSendOffer = () => {
    if (!baseSalary || !joiningDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Offer sent successfully!");
    router.push("/tenant/recruiter-portal/offers");
  };

  const formatSalary = (amount: string) => {
    if (!amount) return "₹0";
    const num = parseInt(amount);
    return `₹${(num / 100000).toFixed(1)}L`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => router.push("/tenant/recruiter-portal/offers")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Offers
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Job Offer
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and send offer letter to {candidate.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Info */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
              <CardDescription>
                Details of the selected candidate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <div className="mt-1 font-semibold">{candidate.name}</div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="mt-1 font-semibold">{candidate.email}</div>
                </div>
                <div>
                  <Label>Position Applied</Label>
                  <div className="mt-1 font-semibold">{candidate.jobTitle}</div>
                </div>
                <div>
                  <Label>AI Score</Label>
                  <div className="mt-1 font-semibold text-green-600 dark:text-green-400">
                    {candidate.aiScore}/100
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Compensation Package</CardTitle>
              <CardDescription>
                Define salary and benefits for this offer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Base Salary (Annual) *</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    placeholder="2500000"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                  />
                  {baseSalary && (
                    <div className="text-sm text-muted-foreground">
                      {formatSalary(baseSalary)} per annum
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonus">Performance Bonus (Annual)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    placeholder="300000"
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                  />
                  {bonus && (
                    <div className="text-sm text-muted-foreground">
                      {formatSalary(bonus)} per annum
                    </div>
                  )}
                </div>
              </div>

              {baseSalary && bonus && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total CTC:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatSalary(
                        (parseInt(baseSalary) + parseInt(bonus)).toString()
                      )}
                    </span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Benefits */}
              <div className="space-y-4">
                <div>
                  <Label>Benefits & Perks</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add benefits included in this offer
                  </p>
                </div>

                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-accent/50"
                    >
                      <span>{benefit}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBenefit(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter benefit..."
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBenefit();
                      }
                    }}
                  />
                  <Button onClick={addBenefit} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joiningDate">Expected Joining Date *</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special conditions or notes for this offer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Offer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Candidate</span>
                <span className="font-semibold">{candidate.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position</span>
                <span className="font-semibold">{candidate.jobTitle}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Salary</span>
                <span className="font-semibold">
                  {baseSalary ? formatSalary(baseSalary) : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bonus</span>
                <span className="font-semibold">
                  {bonus ? formatSalary(bonus) : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total CTC</span>
                <span className="font-bold text-primary">
                  {baseSalary && bonus
                    ? formatSalary(
                        (parseInt(baseSalary) + parseInt(bonus)).toString()
                      )
                    : baseSalary
                    ? formatSalary(baseSalary)
                    : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Benefits</span>
                <span className="font-semibold">{benefits.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={handleGenerateOffer}
                disabled={isGenerating || !baseSalary || !joiningDate}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Offer Letter
                  </>
                )}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={!baseSalary || !joiningDate}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Offer
              </Button>
              <Separator />
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleSendOffer}
                disabled={!baseSalary || !joiningDate}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Offer
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/tenant/recruiter-portal/offers")}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offer Letter Preview</DialogTitle>
            <DialogDescription>
              Review the offer letter before sending
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6 bg-white dark:bg-slate-900 rounded-lg border">
            {/* Letter Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">WorkZone.tech</h2>
              <p className="text-sm text-muted-foreground">
                Modern HR Management Platform
              </p>
            </div>

            <Separator />

            {/* Letter Date */}
            <div className="text-right text-sm text-muted-foreground">
              Date:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            {/* Candidate Address */}
            <div>
              <p className="font-semibold">{candidate.name}</p>
              <p className="text-sm text-muted-foreground">{candidate.email}</p>
            </div>

            {/* Letter Content */}
            <div className="space-y-4">
              <p className="font-semibold">
                Subject: Offer of Employment - {candidate.jobTitle}
              </p>

              <p>Dear {candidate.name},</p>

              <p>
                We are pleased to offer you the position of{" "}
                <strong>{candidate.jobTitle}</strong> at WorkZone.tech. We
                believe your skills and experience will be a valuable asset to
                our team.
              </p>

              <div className="space-y-2">
                <h3 className="font-semibold">Compensation Details:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Base Salary: {baseSalary ? formatSalary(baseSalary) : "—"}{" "}
                    per annum
                  </li>
                  {bonus && (
                    <li>Performance Bonus: {formatSalary(bonus)} per annum</li>
                  )}
                  <li>
                    <strong>
                      Total CTC:{" "}
                      {baseSalary && bonus
                        ? formatSalary(
                            (parseInt(baseSalary) + parseInt(bonus)).toString()
                          )
                        : baseSalary
                        ? formatSalary(baseSalary)
                        : "—"}{" "}
                      per annum
                    </strong>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Benefits & Perks:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>

              <p>
                Your expected joining date is{" "}
                <strong>
                  {joiningDate
                    ? new Date(joiningDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "TBD"}
                </strong>
                .
              </p>

              {notes && (
                <div className="p-4 rounded-lg bg-accent">
                  <p className="font-semibold mb-2">Additional Notes:</p>
                  <p className="text-sm">{notes}</p>
                </div>
              )}

              <p>
                Please confirm your acceptance of this offer by responding to
                this email within 7 days.
              </p>

              <p>
                We look forward to welcoming you to the WorkZone.tech family!
              </p>

              <div className="pt-4">
                <p>Best regards,</p>
                <p className="font-semibold mt-2">HR Team</p>
                <p className="text-sm text-muted-foreground">WorkZone.tech</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={handleSendOffer}>
              <Send className="mr-2 h-4 w-4" />
              Send Offer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CreateOfferPage() {
  return (
    <RecruiterPortalLayout>
      <CreateOfferContent />
    </RecruiterPortalLayout>
  );
}
