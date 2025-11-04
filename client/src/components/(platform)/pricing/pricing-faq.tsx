"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences.",
  },
  {
    question: "What happens after the free trial ends?",
    answer:
      "After your 14-day free trial, you can choose to upgrade to a paid plan or continue with our free Starter plan. Your data will be preserved regardless of your choice.",
  },
  {
    question: "Is there a setup fee?",
    answer:
      "No, there are no setup fees or hidden charges. You only pay for the plan you choose, and we provide free onboarding support for all paid plans.",
  },
  {
    question: "How does the employee limit work?",
    answer:
      "The employee limit refers to active employees in your system. If you exceed your plan's limit, you'll be prompted to upgrade. We'll notify you before you reach the limit.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and bank transfers for Enterprise plans. All payments are processed securely.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us within 30 days of your purchase for a full refund.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use bank-level encryption (256-bit SSL), regular security audits, and comply with GDPR and SOC 2 standards. Your data is backed up daily and stored in secure data centers.",
  },
  {
    question: "Do you offer custom solutions for large enterprises?",
    answer:
      "Yes! Our Enterprise plan includes custom features, dedicated infrastructure, white-label options, and personalized support. Contact our sales team to discuss your specific needs.",
  },
];

export const PricingFAQ = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background -z-10" />

      <div className="mx-auto max-w-4xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            <HelpCircle className="mr-2 h-3.5 w-3.5" />
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We've got answers. Can't find what you're looking
            for? Contact our support team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg px-6 bg-card/50 backdrop-blur-sm"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
