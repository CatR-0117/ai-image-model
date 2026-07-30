import { FileText, RotateCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function IngredientRecognition() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="size-5" />
              Ingredient recognition
            </h1>
            <p className="text-sm text-gray-500">
              Describe the food, and AI will detect the ingredients.
            </p>
          </div>
          <Button variant="outline" size="icon-lg" aria-label="Reset">
            <RotateCw />
          </Button>
        </div>

        <Textarea className="min-h-32" placeholder="Хоолны тайлбар" />

        <Button size="lg" className="self-end px-6" disabled>
          Generate
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <FileText className="size-5" />
          Identified Ingredients
        </h2>
        <p className="rounded-lg border p-3 text-sm text-gray-500">
          First, enter your text to recognize an ingredients.
        </p>
      </div>
    </div>
  );
}
