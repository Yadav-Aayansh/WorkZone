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
import { ScrollText, Search, FileText, Calendar, Download } from "lucide-react";
import policiesData from "@/data/tenant/policies.json";
import { useState } from "react";

export default function PoliciesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPolicies = policiesData.filter(
    (policy) =>
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(policiesData.map((p) => p.category)));

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      workplace:
        "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      leave:
        "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      ethics:
        "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      security:
        "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      hr: "bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
      finance:
        "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    };
    return (
      colors[category] ||
      "bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"
    );
  };

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <ScrollText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Company Policies
                </h1>
                <p className="text-muted-foreground mt-1">
                  Access and review all company policies and guidelines
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Policies</CardTitle>
            <CardDescription>
              Find the policy you're looking for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies by title or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card
              key={category}
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${getCategoryColor(
                category
              )}`}
            >
              <CardContent className="pt-6 text-center">
                <p className="font-semibold capitalize">{category}</p>
                <p className="text-sm mt-1">
                  {policiesData.filter((p) => p.category === category).length}{" "}
                  policies
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Policies List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolicies.map((policy) => (
            <Card
              key={policy.id}
              className="border-2 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        getCategoryColor(policy.category).split(" ")[0]
                      } ${getCategoryColor(policy.category).split(" ")[1]}`}
                    >
                      <FileText
                        className={`h-5 w-5 ${
                          getCategoryColor(policy.category).split(" ")[2]
                        } ${getCategoryColor(policy.category).split(" ")[3]}`}
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{policy.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {policy.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={getCategoryColor(policy.category)}
                    variant="outline"
                  >
                    {policy.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {policy.summary}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Effective:{" "}
                      {new Date(policy.effectiveDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                    <span>•</span>
                    <span>Version {policy.version}</span>
                    <span>•</span>
                    <span>
                      Updated:{" "}
                      {new Date(policy.lastUpdated).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPolicies.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ScrollText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No policies found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </EmployeePortalLayout>
  );
}
