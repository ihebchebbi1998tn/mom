import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar = ({ progress, label, showPercentage = true, className = "" }: ProgressBarProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default ProgressBar;