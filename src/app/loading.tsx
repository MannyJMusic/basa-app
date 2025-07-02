import { BasaLoading } from "@/components/ui/basa-loading"

export default function Loading() {
  return (
    <BasaLoading 
      type="full"
      text="Welcome to BASA"
      showFeatures={true}
      showProgress={true}
      progress={85}
    />
  )
} 