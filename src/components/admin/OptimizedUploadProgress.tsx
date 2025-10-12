import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle, Upload, FileVideo } from 'lucide-react';
import { formatFileSize } from '@/utils/fastVideoCompression';

interface OptimizedUploadProgressProps {
  stage: 'upload' | 'complete';
  progress: number;
  uploadInfo?: {
    stage: string;
    speed?: string;
  };
}

export const OptimizedUploadProgress: React.FC<OptimizedUploadProgressProps> = ({
  stage,
  progress,
  uploadInfo
}) => {
  const getStageIcon = () => {
    switch (stage) {
      case 'upload':
        return <Upload className="w-5 h-5 text-green-500 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <FileVideo className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStageName = () => {
    switch (stage) {
      case 'upload':
        return 'رفع الفيديو';
      case 'complete':
        return 'اكتمل';
      default:
        return 'جاري المعالجة';
    }
  };

  const getProgressColor = () => {
    switch (stage) {
      case 'upload':
        return 'bg-green-500';
      case 'complete':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
      <div className="space-y-4">
        {/* Stage Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStageIcon()}
            <span className="font-semibold text-gray-800">{getStageName()}</span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-3 bg-gray-200"
          />
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage Details */}
        {stage === 'upload' && uploadInfo && (
          <div className="space-y-2 bg-white/50 rounded-lg p-3">
            <div className="text-sm text-gray-700">
              <strong>الحالة:</strong> {uploadInfo.stage}
            </div>
            {uploadInfo.speed && (
              <div className="text-sm text-blue-600">
                <strong>سرعة الرفع:</strong> {uploadInfo.speed}
              </div>
            )}
          </div>
        )}

        {stage === 'complete' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">تم رفع الفيديو بنجاح!</span>
            </div>
          </div>
        )}

        {/* Performance Tips */}
        {stage === 'upload' && progress < 100 && (
          <div className="text-xs text-gray-500 bg-white/30 rounded p-2">
            💡 نصيحة: يتم رفع الفيديو مباشرة بجودة أصلية عالية بدون ضغط
          </div>
        )}
      </div>
    </Card>
  );
};