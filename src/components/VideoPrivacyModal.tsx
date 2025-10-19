import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Heart, Lock } from "lucide-react";

interface VideoPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoPrivacyModal = ({ isOpen, onClose }: VideoPrivacyModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-pink-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            رسالة مهمة 💝
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <div className="flex items-start gap-3 text-right bg-pink-50/50 p-4 rounded-lg">
              <Lock className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
              <p className="text-foreground font-medium">
                المحتوى الذي ستشاهدينه هو حصري ومخصص لك فقط
              </p>
            </div>
            
            <div className="flex items-start gap-3 text-right bg-rose-50/50 p-4 rounded-lg">
              <Heart className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-foreground">
                نرجو منك عدم مشاركة الفيديوهات أو تسجيلها مع الآخرين
                <br />
                <span className="text-sm text-muted-foreground mt-1 block">
                  نحن نثق بك ونقدر احترامك لحقوق الملكية الفكرية ❤️
                </span>
              </p>
            </div>

            <div className="pt-2">
              <Button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                فهمت، شكراً 🌸
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPrivacyModal;
