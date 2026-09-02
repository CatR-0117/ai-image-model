import TextAiTool from "@/components/TextAiTool";

export default function IngredientRecognition() {
  return (
    <TextAiTool
      action="identify-ingredients"
      title="Ingredient recognition"
      description="Describe the food, and AI will identify its likely ingredients."
      resultTitle="Identified Ingredients"
      emptyMessage="First, enter your text to recognize the ingredients."
    />
  );
}
