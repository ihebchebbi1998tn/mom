import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <div dir="ltr">
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <Toast key={id} {...props}>
              <div className="grid gap-1" dir="ltr">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              {action}
              <ToastClose />
            </Toast>
          );
        })}
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
