import { TechStackDemo } from '@/components/examples/tech-stack-demo'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technology Stack Demo | BASA',
  description: 'Explore the complete technology stack powering the BASA application including Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, React Hook Form, Zod, and Zustand.',
  keywords: 'Next.js, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, React Hook Form, Zod, Zustand, BASA, technology stack',
}

export default function TechDemoPage() {
  return <TechStackDemo />
} 