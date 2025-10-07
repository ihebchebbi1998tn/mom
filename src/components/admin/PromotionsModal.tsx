import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Percent, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Pack {
  id: number;
  title: string;
}

interface PromotionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PromotionsModal = ({ open, onOpenChange }: PromotionsModalProps) => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPackIds, setSelectedPackIds] = useState<number[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState<Date>();
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPacks();
    }
  }, [open]);

  const fetchPacks = async () => {
    try {
      const response = await fetch("https://spadadibattaglia.com/mom/api/course_packs.php");
      const data = await response.json();
      if (data.success) {
        setPacks(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching packs:", error);
      toast.error("Échec du chargement des packs");
    }
  };

  const togglePackSelection = (packId: number) => {
    setSelectedPackIds(prev =>
      prev.includes(packId)
        ? prev.filter(id => id !== packId)
        : [...prev, packId]
    );
  };

  const handleSubmit = async () => {
    if (selectedPackIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un pack");
      return;
    }
    if (!discountPercentage || parseFloat(discountPercentage) <= 0 || parseFloat(discountPercentage) > 100) {
      toast.error("Veuillez entrer un pourcentage de réduction valide (1-100)");
      return;
    }
    if (!endDate) {
      toast.error("Veuillez sélectionner une date de fin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://spadadibattaglia.com/mom/api/promotions.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack_ids: selectedPackIds,
          discount_percentage: parseFloat(discountPercentage),
          description,
          end_date: format(endDate, "yyyy-MM-dd HH:mm:ss"),
          is_active: isActive ? 1 : 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Promotion créée avec succès!");
        resetForm();
        onOpenChange(false);
      } else {
        toast.error(data.message || "Échec de la création de la promotion");
      }
    } catch (error) {
      console.error("Error creating promotion:", error);
      toast.error("Échec de la création de la promotion");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPackIds([]);
    setDiscountPercentage("");
    setDescription("");
    setEndDate(undefined);
    setIsActive(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="ltr">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left" dir="ltr">
            <Percent className="w-5 h-5 text-primary" />
            Créer une Promotion
          </DialogTitle>
          <DialogDescription className="text-left">
            Sélectionnez les packs, définissez la réduction et la période de validité
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4" dir="ltr">
          {/* Select Packs */}
          <div className="space-y-3">
            <Label className="text-left block">Sélectionner les Packs *</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2 text-right" dir="rtl">
              {packs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-left" dir="ltr">Aucun pack disponible</p>
              ) : (
                packs.map((pack) => (
                  <div
                    key={pack.id}
                    onClick={() => togglePackSelection(pack.id)}
                    className={cn(
                      "flex flex-row-reverse items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                      selectedPackIds.includes(pack.id)
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-accent hover:bg-accent/80 border-2 border-transparent"
                    )}
                    dir="rtl"
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      selectedPackIds.includes(pack.id)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    )}>
                      {selectedPackIds.includes(pack.id) && (
                        <div className="w-3 h-3 bg-primary-foreground rounded-sm" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-right" dir="rtl" lang="ar" style={{ unicodeBidi: "plaintext" }}>{pack.title}</span>
                  </div>
                ))
              )}
            </div>
            {selectedPackIds.length > 0 && (
              <div className="flex flex-wrap gap-2" dir="rtl">
                {selectedPackIds.map((id) => {
                  const pack = packs.find(p => p.id === id);
                  return pack ? (
                    <div
                      key={id}
                      className="inline-flex flex-row-reverse items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-sm"
                      dir="rtl"
                    >
                      <span lang="ar" style={{ unicodeBidi: "plaintext" }}>{pack.title}</span>
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => togglePackSelection(id)}
                      />
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Discount Percentage */}
          <div className="space-y-2">
            <Label htmlFor="discount" className="text-left block">Pourcentage de Réduction * (1-100)</Label>
            <div className="relative">
              <Input
                id="discount"
                type="number"
                min="1"
                max="100"
                step="0.01"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="ex: 20"
                className="pr-8"
                dir="ltr"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label className="text-left block">Date de Fin de Promotion *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  dir="ltr"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-left block">Description (Optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter une description pour cette promotion..."
              rows={3}
              dir="ltr"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="text-left">
              <Label htmlFor="active" className="text-base">Statut Actif</Label>
              <p className="text-sm text-muted-foreground">
                Activer ou désactiver cette promotion
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={loading}
          >
            {loading ? "Création..." : "Créer la Promotion"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionsModal;
