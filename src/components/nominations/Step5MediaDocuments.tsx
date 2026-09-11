"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Star,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { uploadNominationFile, deleteNominationFile, getSignedFileUrl } from "@/lib/nominations/actions";
import type { UploadType } from "@/types/database.types";

export interface FileItem {
  id: string;
  application_id: string;
  upload_type: UploadType;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  caption: string | null;
  is_cover: boolean;
  created_at: string;
}

export interface UploadRequirementItem {
  id: string;
  upload_type: UploadType;
  title: string;
  description: string | null;
  is_required: boolean;
  min_count: number;
  max_count: number;
  max_file_size_mb: number;
}

interface Step5MediaDocumentsProps {
  applicationId: string;
  requirements: UploadRequirementItem[];
  initialFiles: FileItem[];
  onNext: () => void;
  onPrev: () => void;
  isSaving: boolean;
}

const UPLOAD_TYPE_LABELS: Record<UploadType, string> = {
  cover_image: "Cover / Hero Image",
  project_photo: "General Project Photo",
  interior_photo: "Interior View Photo",
  exterior_photo: "Exterior / Elevation Photo",
  floor_plan: "Architectural Floor Plan / Drawing",
  rendering_3d: "3D Render / Visualization",
  portfolio_pdf: "Project Portfolio Dossier (PDF)",
  supporting_doc: "Supporting Document / Certificate",
};

export default function Step5MediaDocuments({
  applicationId,
  requirements,
  initialFiles,
  onNext,
  onPrev,
  isSaving,
}: Step5MediaDocumentsProps) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Upload Form Inputs
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<UploadType>("project_photo");
  const [caption, setCaption] = useState("");
  const [isCover, setIsCover] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validateAndSetFile = (f: File) => {
    if (f.size > 15 * 1024 * 1024) {
      setErrorMsg("Selected file exceeds the 15MB limit.");
      setSelectedFile(null);
      return;
    }
    const validMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const isNamedValid = /\.(jpe?g|png|webp|pdf)$/i.test(f.name);
    if (!validMimes.includes(f.type) && !isNamedValid) {
      setErrorMsg("File format not supported. Please upload high-res JPG, PNG, WEBP, or PDF drawings.");
      setSelectedFile(null);
      return;
    }
    // Auto-adjust default category for PDFs
    if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
      if (uploadType === "project_photo" || uploadType === "interior_photo" || uploadType === "exterior_photo" || uploadType === "cover_image") {
        setUploadType("floor_plan");
      }
    }
    setSelectedFile(f);
    setErrorMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("applicationId", applicationId);
      formData.append("file", selectedFile);
      formData.append("uploadType", uploadType);
      if (caption.trim()) formData.append("caption", caption.trim());
      formData.append("isCover", isCover ? "true" : "false");

      const res = await uploadNominationFile(formData);

      if (res.success && res.file) {
        const newFile = res.file as any;
        setFiles((prev) => {
          let updated = isCover
            ? prev.map((item) => ({ ...item, is_cover: false }))
            : [...prev];
          return [
            ...updated,
            {
              id: newFile.id,
              application_id: applicationId,
              upload_type: uploadType,
              original_filename: selectedFile.name,
              storage_path: newFile.storage_path,
              mime_type: selectedFile.type || "application/octet-stream",
              file_size_bytes: selectedFile.size,
              caption: caption.trim() || null,
              is_cover: isCover,
              created_at: new Date().toISOString(),
            },
          ];
        });

        // Reset form
        setSelectedFile(null);
        setCaption("");
        setIsCover(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setErrorMsg(res.error || "Upload failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    const fileId = fileToDelete.id;
    setDeletingId(fileId);
    setErrorMsg(null);

    try {
      const res = await deleteNominationFile(applicationId, fileId);
      if (res.success) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        setFileToDelete(null);
      } else {
        setErrorMsg(res.error || "Failed to delete file.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete file.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreviewFile = async (storagePath: string) => {
    try {
      const res = await getSignedFileUrl(storagePath);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        setErrorMsg("Failed to generate preview link. The file may be restricted or unavailable.");
      }
    } catch (err: any) {
      setErrorMsg("Error generating preview link: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Guidance Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-800 bg-gold-500/15 px-2.5 py-0.5 border border-gold-500/30 font-semibold inline-block">
            Step 05 of 07
          </span>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
            Media & Drawings
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-navy-900 font-medium tracking-tight">
          Media & Architectural Documentation
        </h2>
        <p className="text-sm text-[#4A4F5C] leading-relaxed max-w-2xl">
          Upload project photography, architectural drawings, floor plans, and presentation dossiers for jury assessment.
        </p>
      </div>

      {/* Advisory Notice */}
      <div className="p-4 bg-white border border-navy-900/10 shadow-2xs flex items-start gap-3.5">
        <div className="p-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-700 flex-shrink-0 mt-0.5">
          <Info size={16} />
        </div>
        <div className="text-xs text-[#4A4F5C] space-y-1 leading-relaxed">
          <p className="font-medium text-navy-900">
            Confidential Jury Dossier & Isolated Private Storage
          </p>
          <p>
            All submitted files are stored in an encrypted private bucket accessible only by authorized verifiers and the category jury panel.
            Supported formats: <span className="font-mono font-semibold text-navy-900">JPG, PNG, WEBP, PDF</span> (Maximum 15MB per file).
          </p>
          {requirements.length === 0 && (
            <p className="text-[11px] font-mono text-amber-900 pt-1">
              Notice: Category-specific quota limits and mandatory sheets will be enforced upon formal committee ratification. Files uploaded today remain securely attached to your draft.
            </p>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2 shadow-2xs">
          <AlertCircle size={14} className="text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* UPLOAD BOX */}
      <form onSubmit={handleUpload} className="bg-[#FBFAF7] border border-navy-900/15 p-6 sm:p-8 shadow-card space-y-5">
        <div className="border-b border-navy-900/10 pb-3 flex items-center justify-between">
          <h3 className="font-display text-lg text-navy-900 font-semibold flex items-center gap-2">
            <Upload size={16} className="text-gold-600" />
            <span>Upload New Project Asset</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Max 15MB / file</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* File Picker Styled Container */}
          <div className="sm:col-span-2">
            <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-2">
              Select Document or Photography *
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-gold-500 bg-gold-500/10 ring-2 ring-gold-500/30 scale-[1.005]"
                  : "border-navy-900/20 hover:border-gold-500/60 bg-white"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-navy-900/5 text-navy-900 flex items-center justify-center">
                  <Upload size={18} className={isDragging ? "text-gold-700 animate-bounce" : "text-slate-500"} />
                </div>
                <div>
                  <p className="text-xs font-medium text-navy-900">
                    <span className="text-gold-700 underline underline-offset-2 font-semibold">Click to select file</span> or drag and drop here
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    High-Res JPG · PNG · WEBP · PDF Architectural Drawings (Max 15MB)
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3.5 inline-flex items-center justify-between gap-3 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono max-w-full text-left"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <CheckCircle2 size={14} className="text-emerald-700 flex-shrink-0" />
                    <span className="truncate">{selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-slate-400 hover:text-rose-600 font-sans text-xs underline flex-shrink-0"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upload Classification */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-1.5">
              Asset Category / Classification *
            </label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as UploadType)}
              className="w-full px-3.5 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-xs transition-colors shadow-2xs"
            >
              {Object.entries(UPLOAD_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Caption Input */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-1.5">
              Asset Caption or Drawing Reference <span className="text-slate-400 font-normal tracking-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Ground Floor Plan, South Elevation"
              className="w-full px-3.5 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-xs transition-colors shadow-2xs"
            />
          </div>

          {/* Cover Toggle (if image) */}
          {uploadType !== "portfolio_pdf" && uploadType !== "supporting_doc" && (
            <div className="sm:col-span-2 flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="isCoverCheckbox"
                checked={isCover}
                onChange={(e) => setIsCover(e.target.checked)}
                className="accent-navy-900 rounded cursor-pointer"
              />
              <label htmlFor="isCoverCheckbox" className="text-xs text-navy-900 font-medium cursor-pointer">
                Designate as Primary Hero / Cover Photograph for this nomination dossier
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-navy-900/10">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!selectedFile || isUploading}
            icon={isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          >
            {isUploading ? "Uploading Securely..." : "Upload Project Asset"}
          </Button>
        </div>
      </form>

      {/* UPLOADED ASSETS GALLERY / LIST */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-navy-900/10 pb-2">
          <h3 className="font-display text-lg text-navy-900 font-semibold">
            Uploaded Nomination Files ({files.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {files.length === 0 ? "No files attached yet" : `${files.length} attached`}
          </span>
        </div>

        {files.length === 0 ? (
          <div className="bg-[#FBFAF7] border border-dashed border-navy-900/15 p-8 text-center space-y-2">
            <div className="inline-flex p-2.5 rounded-full bg-navy-900/5 text-slate-400">
              <ImageIcon size={22} />
            </div>
            <p className="text-xs text-[#4A4F5C] font-medium">
              No media or architectural drawings uploaded yet.
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Use the upload panel above to attach drawings, high-resolution photography, or project dossiers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((file) => {
              const isPdf = file.mime_type.includes("pdf") || file.original_filename.endsWith(".pdf");
              const isDeleting = deletingId === file.id;

              return (
                <div
                  key={file.id}
                  className="bg-[#FBFAF7] border border-navy-900/10 p-4 shadow-card flex flex-col justify-between gap-3 hover:border-gold-500/30 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gold-700 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20 font-semibold">
                        {UPLOAD_TYPE_LABELS[file.upload_type] || file.upload_type}
                      </span>
                      {file.is_cover && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 border border-amber-300 font-bold">
                          <Star size={10} className="fill-amber-600 text-amber-600" /> Cover
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      {isPdf ? (
                        <FileText size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ImageIcon size={18} className="text-navy-900 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-navy-900 truncate" title={file.original_filename}>
                          {file.original_filename}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {formatFileSize(file.file_size_bytes)}
                        </p>
                      </div>
                    </div>

                    {file.caption && (
                      <p className="text-[11px] text-[#4A4F5C] italic pt-0.5">
                        "{file.caption}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-navy-900/10 text-xs">
                    <button
                      type="button"
                      onClick={() => handlePreviewFile(file.storage_path)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-navy-900 hover:text-gold-700 transition-colors"
                    >
                      <ExternalLink size={12} />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFileToDelete(file)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Trash2 size={11} />
                      )}
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-navy-900/10">
        <Button
          type="button"
          onClick={onPrev}
          variant="outline-dark"
          size="md"
          icon={<ArrowLeft size={14} />}
        >
          Previous: Questionnaire
        </Button>
        <Button
          type="button"
          onClick={onNext}
          variant="primary"
          size="md"
          icon={<ArrowRight size={14} />}
          disabled={isSaving}
        >
          Proceed to Review Dossier
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FBFAF7] border border-navy-900/20 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-navy-900/10 pb-3">
              <div className="flex items-center gap-2.5 text-rose-700">
                <div className="p-2 bg-rose-50 border border-rose-200">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="font-display text-lg text-navy-900 font-bold">
                  Remove Project Asset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="text-slate-400 hover:text-navy-900 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#4A4F5C]">
              <p>
                Are you sure you want to remove <strong className="text-navy-900 font-semibold">{fileToDelete.original_filename}</strong> from your nomination dossier?
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                Classification: {UPLOAD_TYPE_LABELS[fileToDelete.upload_type] || fileToDelete.upload_type} ({formatFileSize(fileToDelete.file_size_bytes)})
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-navy-900/10">
              <Button
                type="button"
                variant="outline-dark"
                size="sm"
                onClick={() => setFileToDelete(null)}
                disabled={deletingId !== null}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={confirmDelete}
                disabled={deletingId !== null}
                icon={deletingId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                className="!bg-rose-700 hover:!bg-rose-800 !text-white !border-rose-700"
              >
                {deletingId ? "Removing..." : "Confirm Removal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
