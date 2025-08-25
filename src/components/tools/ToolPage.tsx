'use client'

import * as React from "react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

interface ToolPageProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  panels?: React.ReactNode;
  results?: React.ReactNode;
}

export default function ToolPage({ 
  title, 
  description, 
  children, 
  actions, 
  panels, 
  results 
}: ToolPageProps) {
  return (
    <Section title={title} description={description}>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
      
      {panels && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {panels}
        </div>
      )}
      
      {results && (
        <Card className="p-6">
          {results}
        </Card>
      )}
      
      {children}
    </Section>
  );
}
