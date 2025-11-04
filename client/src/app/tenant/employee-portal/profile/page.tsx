"use client";

import { EmployeePortalLayout } from "@/components/tenant/employee-portal-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Download,
  Upload,
  Building,
  CreditCard,
} from "lucide-react";
import employeeProfile from "@/data/tenant/employee-profile.json";

export default function ProfilePage() {
  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-xl">
                <AvatarImage
                  src={employeeProfile.profilePhoto}
                  alt={employeeProfile.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-4xl font-bold">
                  {employeeProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {employeeProfile.name}
                </h2>
                <p className="text-xl text-muted-foreground mb-4">
                  {employeeProfile.designation}
                </p>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <User className="h-3 w-3 mr-1" />
                    {employeeProfile.employeeId}
                  </Badge>
                  <Badge className="bg-purple-500 text-white px-3 py-1">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {employeeProfile.department}
                  </Badge>
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {employeeProfile.location}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined{" "}
                    {new Date(employeeProfile.joinDate).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {employeeProfile.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {employeeProfile.phone}
                  </div>
                </div>
              </div>

              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Update Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {new Date(employeeProfile.dateOfBirth).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Gender
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.gender}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Marital Status
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.maritalStatus}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Blood Group
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.bloodGroup}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.phone}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Current Address</h4>
                  <p className="text-muted-foreground">
                    {employeeProfile.currentAddress.street},{" "}
                    {employeeProfile.currentAddress.city},{" "}
                    {employeeProfile.currentAddress.state} -{" "}
                    {employeeProfile.currentAddress.pincode},{" "}
                    {employeeProfile.currentAddress.country}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Permanent Address</h4>
                  <p className="text-muted-foreground">
                    {employeeProfile.permanentAddress.street},{" "}
                    {employeeProfile.permanentAddress.city},{" "}
                    {employeeProfile.permanentAddress.state} -{" "}
                    {employeeProfile.permanentAddress.pincode},{" "}
                    {employeeProfile.permanentAddress.country}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Name
                      </label>
                      <p className="text-lg font-semibold mt-1">
                        {employeeProfile.emergencyContact.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Relationship
                      </label>
                      <p className="text-lg font-semibold mt-1">
                        {employeeProfile.emergencyContact.relationship}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-lg font-semibold mt-1">
                        {employeeProfile.emergencyContact.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Your work-related details and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Employee ID
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.employeeId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Designation
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.designation}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Department
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.department}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Join Date
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {new Date(employeeProfile.joinDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Reporting Manager
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.reportingManager}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Work Location
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.workLocation}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Employment Type
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.employmentType}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <Badge className="bg-green-500 mt-1">
                      {employeeProfile.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {employeeProfile.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Education</h4>
                  {employeeProfile.education.map((edu, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <p className="font-semibold">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.institution} • {edu.year}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score: {edu.percentage}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Upload and manage your important documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Aadhaar Card", status: "Uploaded" },
                    { name: "PAN Card", status: "Uploaded" },
                    { name: "Educational Certificates", status: "Uploaded" },
                    {
                      name: "Previous Employment Documents",
                      status: "Pending",
                    },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {doc.status === "Uploaded" ? (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
                <CardDescription>
                  Your salary account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Bank Name
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.bankDetails.bankName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Account Number
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">
                      {employeeProfile.bankDetails.accountNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      IFSC Code
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">
                      {employeeProfile.bankDetails.ifscCode}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Branch
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {employeeProfile.bankDetails.branch}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EmployeePortalLayout>
  );
}
