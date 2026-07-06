import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RxUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export function RxUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: RxUploadModalProps) {
  const { t } = useLanguage();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const file = files[0];
    if (file) {
      // In a real app, upload to Supabase here
      setUploading(true);
      setTimeout(() => {
        setFileName(file.name);
        setUploading(false);
        // Auto-close and trigger success
        setTimeout(() => {
          onUploadSuccess();
          setFileName(null);
          onClose();
        }, 1500);
      }, 1000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('checkout.uploadRx')}</DialogTitle>
          <DialogDescription>
            Upload a clear photo or PDF of your prescription to proceed with Rx items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
              dragging
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted/30 hover:border-primary/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Upload className="h-6 w-6" />
            </div>

            <p className="mt-4 text-base font-semibold">
              {uploading
                ? 'Uploading…'
                : fileName
                  ? `✓ ${fileName}`
                  : 'Drop your prescription here'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              PNG, JPG, or PDF · up to 10MB
            </p>

            {!uploading && !fileName && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-all duration-300 hover:scale-105"
              >
                Browse Files
              </button>
            )}
          </label>

          {/* File Status */}
          {fileName && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-900 font-semibold">
              ✓ {t('checkout.prescriptionUploaded')}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted"
            >
              Cancel
            </button>
            {!fileName && (
              <button
                disabled={uploading}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
