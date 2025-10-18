import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Video, X } from "lucide-react";

interface AdminVideoUploadProps {
  onFileSelect: (file: File, duration: string) => void;
  onUploadComplete?: (url: string, fileName: string) => void;
  disabled?: boolean;
  selectedFile?: File | null;
  hideUploadButton?: boolean;
}

const AdminVideoUpload = ({ onFileSelect, onUploadComplete, disabled, selectedFile: externalSelectedFile, hideUploadButton }: AdminVideoUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(externalSelectedFile || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [etaText, setEtaText] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState("");
  const [speedText, setSpeedText] = useState("");

  const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB
  const PAUSE_THRESHOLD = 300 * 1024 * 1024; // 300MB
  const PAUSE_MS = 300; // milliseconds pause

  const formatFileSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Type de fichier incorrect",
        description: "Veuillez sélectionner un fichier vidéo",
        variant: "destructive"
      });
      return;
    }
    setSelectedFile(file);
    setUploadProgress(0);
    setProgressText("");
    setEtaText("");
    setStatusText("");
    setFinalVideoUrl("");
    setSpeedText("");
    onFileSelect(file, "");
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setProgressText("");
    setEtaText("");
    setStatusText("");
    setFinalVideoUrl("");
    setSpeedText("");
    onFileSelect(null as any, "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return setStatusText("Aucun fichier sélectionné");

    setIsUploading(true);
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
    const totalMB = formatFileSize(selectedFile.size);
    setStatusText(`Téléchargement de ${selectedFile.name}...`);

    let times: number[] = [];
    let uploadedBytes = 0;
    let lastLoggedPercent = 0;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(selectedFile.size, start + CHUNK_SIZE);
      const chunk = selectedFile.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("filename", selectedFile.name);
      formData.append("chunkIndex", i.toString());
      formData.append("totalChunks", totalChunks.toString());

      let retryCount = 0;
      const maxRetries = 3;
      let success = false;

      while (!success && retryCount < maxRetries) {
        const startTime = Date.now();
        try {
          const res = await fetch("https://spadadibattaglia.com/mom/api/upload.php", { method: "POST", body: formData });
          const text = await res.text();
          let data: any = {};
          try { data = JSON.parse(text); } catch(e) { throw new Error("Format de réponse invalide"); }

          if (res.ok && data.status !== "error") {
            success = true;
            const duration = (Date.now() - startTime) / 1000;
            times.push(duration);
            uploadedBytes += (end - start);

            const percent = Math.round((uploadedBytes / selectedFile.size) * 100);
            setUploadProgress(percent);
            setProgressText(`${percent}% (${formatFileSize(uploadedBytes)}/${totalMB} MB)`);

            // Show speed in MB/s
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const speedMBs = ((uploadedBytes / 1024 / 1024) / times.reduce((a,b)=>a+b,0)).toFixed(2);
            setSpeedText(`Vitesse: ${speedMBs} MB/s`);

            // ETA calculation
            const remainingBytes = selectedFile.size - uploadedBytes;
            const etaSeconds = Math.round((remainingBytes / 1024 / 1024) / parseFloat(speedMBs));
            const mins = Math.floor(etaSeconds / 60);
            const secs = etaSeconds % 60;
            setEtaText(`Temps restant: ${mins}m ${secs}s`);

            // Log real-time 1% increments in console
            for (let p = lastLoggedPercent + 1; p <= percent; p++) {
              console.log(`📊 Progression: ${p}% | Vitesse: ${speedMBs} MB/s`);
            }
            lastLoggedPercent = percent;

            // Pause after each 300MB
            if (uploadedBytes % PAUSE_THRESHOLD < CHUNK_SIZE && i < totalChunks - 1) {
              console.log(`⏸️ Pause après ${formatFileSize(uploadedBytes)} MB téléchargés`);
              await new Promise(r => setTimeout(r, PAUSE_MS));
            }

            if (data.finalUrl) {
              setFinalVideoUrl(data.finalUrl);
              setIsUploading(false);
              setStatusText("Téléchargement terminé! ✅");
              setProgressText(`Terminé: 100% (${totalMB}/${totalMB} MB)`);
              setEtaText("");
              setSpeedText("");
              onUploadComplete?.(data.finalUrl, selectedFile.name);
              console.log("✅ Téléchargement terminé: " + data.finalUrl);
              return;
            }
          } else throw new Error(data.message || `HTTP ${res.status}`);
        } catch (err) {
          retryCount++;
          console.error(`❌ Échec du téléchargement du segment ${i + 1} (tentative ${retryCount}):`, err);
          if (retryCount < maxRetries) {
            await new Promise(r => setTimeout(r, 1000 * retryCount));
          } else {
            setStatusText(`Échec du téléchargement du segment ${i + 1}`);
            setIsUploading(false);
            toast({
              title: "Erreur de téléchargement",
              description: `Échec du téléchargement de la vidéo.`,
              variant: "destructive"
            });
            return;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-4" dir="ltr">
      <input
        ref={fileInputRef}
        id="video-upload"
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      {!selectedFile ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full h-24 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
        >
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cliquez pour sélectionner un fichier vidéo</p>
            <p className="text-xs text-muted-foreground mt-1">Téléchargement par segments</p>
          </div>
        </Button>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">Taille: {formatFileSize(selectedFile.size)} MB</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={clearFile} disabled={disabled || isUploading}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!isUploading && !hideUploadButton && (
            <Button onClick={handleUpload} disabled={disabled} className="w-full mt-2">
              Télécharger la vidéo
            </Button>
          )}

          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="w-full bg-muted rounded-lg">
                <Progress value={uploadProgress} className="h-5" />
              </div>
              {progressText && <div className="text-sm text-muted-foreground">{progressText}</div>}
              {speedText && <div className="text-sm text-muted-foreground">{speedText}</div>}
              {etaText && <div className="text-sm text-muted-foreground">{etaText}</div>}
              {statusText && <div className="text-sm font-medium">{statusText}</div>}
            </div>
          )}

          {finalVideoUrl && (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-muted-foreground break-all">
                URL de la vidéo: <a href={finalVideoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{finalVideoUrl}</a>
              </div>
              <video src={finalVideoUrl} controls className="w-full max-w-md rounded-lg" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminVideoUpload;