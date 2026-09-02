import TextAiTool from "@/components/TextAiTool";

export default function ImageCreator() {
  return (
    <TextAiTool
      action="generate-image"
      title="Food image creator"
      description="What food image do you want? Describe it briefly."
      resultTitle="Result"
      emptyMessage="First, enter your text to generate an image."
    />
  );
}
