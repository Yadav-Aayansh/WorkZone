"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  Plus,
  File,
  FileIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudUpload,
  FolderOpen,
  X,
  RefreshCw,
  Shield,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { platformWorkspaceAPI, PolicyDocument } from "@/lib/api";
import { useDropzone } from "react-dropzone";

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FileText className="w-8 h-8 text-red-500" />;
    case "doc":
    case "docx":
      return <FileIcon className="w-8 h-8 text-blue-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
};

const getFileTypeLabel = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return {
        label: "PDF",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };
    case "doc":
      return {
        label: "DOC",
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      };
    case "docx":
      return {
        label: "DOCX",
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      };
    default:
      return {
        label: ext?.toUpperCase() || "FILE",
        color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      };
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function PolicyDocumentsManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // GCS bucket name - should match backend config
  const GCS_BUCKET_NAME =
    process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || "workzone-storage";

  // Helper to extract filename from blob path
  const extractFileName = (blobPath: string): string => {
    // Extract filename from paths like "platform/policies/tenant_id/filename.pdf"
    const parts = blobPath.split("/");
    return parts[parts.length - 1] || blobPath;
  };

  // Helper to construct GCS public URL from blob name
  const getGCSPublicUrl = (blobName: string): string => {
    // Public GCS URL format: https://storage.googleapis.com/{bucket}/{blob_name}
    const encodedBlobName = blobName
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
    return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${encodedBlobName}`;
  };

  // Fetch existing documents
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await platformWorkspaceAPI.getPolicies();

      // Transform backend response (array of blob names) to PolicyDocument format
      const policies = response.policies || [];
      const transformedDocs: PolicyDocument[] = policies.map(
        (blobName: string) => ({
          id: blobName,
          name: extractFileName(blobName),
          url: getGCSPublicUrl(blobName), // Construct proper GCS public URL
          uploaded_at: new Date().toISOString(), // Backend doesn't provide this
        })
      );

      setDocuments(transformedDocs);
    } catch (error: unknown) {
      const apiError = error as { status?: number };
      if (apiError?.status !== 404) {
        toast.error("Failed to load policy documents");
      }
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const isValidType = ["pdf", "doc", "docx"].includes(ext || "");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max

      if (!isValidType) {
        toast.error(
          `${file.name}: Invalid file type. Only PDF, DOC, DOCX allowed.`
        );
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name}: File too large. Maximum 10MB allowed.`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (mode: "replace" | "append") => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    try {
      setIsUploading(true);

      // Initialize uploading state
      setUploadingFiles(
        selectedFiles.map((file) => ({
          file,
          progress: 0,
          status: "uploading",
        }))
      );

      // Simulate progress (since we can't track real progress with fetch)
      const progressInterval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) => ({
            ...f,
            progress: Math.min(f.progress + Math.random() * 20, 90),
          }))
        );
      }, 200);

      if (mode === "replace") {
        await platformWorkspaceAPI.setPolicies(selectedFiles);
      } else {
        await platformWorkspaceAPI.addPolicies(selectedFiles);
      }

      clearInterval(progressInterval);

      // Mark all as success
      setUploadingFiles((prev) =>
        prev.map((f) => ({ ...f, progress: 100, status: "success" }))
      );

      toast.success(
        `${selectedFiles.length} document${
          selectedFiles.length > 1 ? "s" : ""
        } uploaded successfully!`,
        {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        }
      );

      // Refresh documents list
      await fetchDocuments();

      // Clear selected files after short delay
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadingFiles([]);
      }, 1500);
    } catch (error: unknown) {
      setUploadingFiles((prev) => prev.map((f) => ({ ...f, status: "error" })));
      const apiError = error as { message?: string };
      toast.error("Failed to upload documents", {
        description: apiError?.message || "Please try again later.",
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDocId) return;

    try {
      setIsDeleting(true);
      await platformWorkspaceAPI.deletePolicy(deleteDocId);

      toast.success("Document deleted successfully", {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      });

      // Refresh documents
      await fetchDocuments();
    } catch (error: unknown) {
      const apiError = error as { message?: string };
      toast.error("Failed to delete document", {
        description: apiError?.message || "Please try again later.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDocId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading documents...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Documents</p>
                <p className="text-3xl font-bold mt-1">{documents.length}</p>
              </div>
              <FileText className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Policy Status</p>
                <p className="text-lg font-semibold mt-1">
                  {documents.length > 0 ? "Active" : "No Policies"}
                </p>
              </div>
              <Shield className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">AI Assistant</p>
                <p className="text-lg font-semibold mt-1">
                  {documents.length > 0 ? "Trained" : "Awaiting Data"}
                </p>
              </div>
              <BookOpen className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card className="border-none shadow-xl dark:bg-gray-800 overflow-hidden">
        <CardHeader className="border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
              <CloudUpload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-xl dark:text-white">
                Upload Policy Documents
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Upload company policies, handbooks, and guidelines for
                AI-powered employee assistance
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ scale: isDragActive ? 1.05 : 1 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <div
                  className={`p-4 rounded-full ${
                    isDragActive
                      ? "bg-indigo-100 dark:bg-indigo-900/50"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 ${
                      isDragActive ? "text-indigo-600" : "text-gray-400"
                    }`}
                  />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium dark:text-white">
                  {isDragActive ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  or click to browse from your computer
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge variant="secondary" className="dark:bg-gray-700">
                  PDF
                </Badge>
                <Badge variant="secondary" className="dark:bg-gray-700">
                  DOC
                </Badge>
                <Badge variant="secondary" className="dark:bg-gray-700">
                  DOCX
                </Badge>
                <span className="text-xs text-gray-400">
                  • Max 10MB per file
                </span>
              </div>
            </motion.div>
          </div>

          {/* Selected Files Preview */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium dark:text-white">
                    Selected Files ({selectedFiles.length})
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFiles([])}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedFiles.map((file, index) => {
                    const uploadState = uploadingFiles.find(
                      (u) => u.file === file
                    );
                    const typeInfo = getFileTypeLabel(file.name);

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                      >
                        {getFileIcon(file.name)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate dark:text-white text-sm">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${typeInfo.color}`}>
                              {typeInfo.label}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                          {uploadState && (
                            <Progress
                              value={uploadState.progress}
                              className="h-1 mt-2"
                            />
                          )}
                        </div>
                        {!uploadState && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSelectedFile(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        {uploadState?.status === "success" && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {uploadState?.status === "error" && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Upload Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={() => handleUpload("append")}
                    disabled={isUploading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Existing
                      </>
                    )}
                  </Button>

                  {documents.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isUploading}
                          className="flex-1 dark:border-gray-600"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Replace All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-gray-900">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-white">
                            Replace All Documents?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-gray-400">
                            This will delete all existing policy documents and
                            replace them with the new files. This action cannot
                            be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="dark:border-gray-600 dark:hover:bg-gray-800">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUpload("replace")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Replace All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="border-none shadow-xl dark:bg-gray-800">
        <CardHeader className="border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl dark:text-white">
                  Uploaded Documents
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Manage your organization&apos;s policy documents
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocuments}
              className="dark:border-gray-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No documents uploaded</p>
              <p className="text-sm">
                Upload policy documents to enable AI-powered employee assistance
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, index) => {
                const typeInfo = getFileTypeLabel(doc.name);

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:shadow-md transition-shadow"
                  >
                    {getFileIcon(doc.name)}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate dark:text-white">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className={`text-xs ${typeInfo.color}`}>
                          {typeInfo.label}
                        </Badge>
                        {doc.uploaded_at && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Uploaded {formatDate(doc.uploaded_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.url && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              doc.url && window.open(doc.url, "_blank")
                            }
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (doc.url) {
                                const link = document.createElement("a");
                                link.href = doc.url;
                                link.download = doc.name;
                                link.click();
                              }
                            }}
                            className="text-gray-500 hover:text-green-600"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      <AlertDialog
                        open={deleteDocId === doc.id}
                        onOpenChange={(open) => !open && setDeleteDocId(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDocId(doc.id)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:bg-gray-900">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">
                              Delete Document?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                              Are you sure you want to delete &quot;{doc.name}
                              &quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:border-gray-600 dark:hover:bg-gray-800">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-l-amber-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                About Policy Documents
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                These documents are used to train the AI-powered employee
                helpdesk. When employees ask questions about company policies,
                leave rules, or guidelines, the AI will reference these
                documents to provide accurate answers. Keep your documents
                up-to-date for the best assistance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
