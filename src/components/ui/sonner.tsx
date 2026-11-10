import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !border-slate-200 !bg-white !text-slate-950 shadow-lg",
          title: "!text-slate-950",
          description: "!text-slate-600",
          actionButton: "!bg-primary !text-white hover:!bg-primary/90",
          cancelButton: "!bg-slate-100 !text-slate-700",
          closeButton: "!border-slate-200 !bg-white !text-slate-700",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
