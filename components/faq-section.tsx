"use client"

import { useState } from "react"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Shield, HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "How does CyberGuard's vulnerability scanning work?",
    answer: "CyberGuard uses advanced scanning engines that integrate with multiple CVE databases to identify vulnerabilities across your infrastructure. Our AI-powered system continuously monitors your assets and provides real-time threat detection with minimal false positives."
  },
  {
    question: "What compliance standards does CyberGuard support?",
    answer: "We support major compliance frameworks including NIST Cybersecurity Framework, ISO 27001, OWASP Top 10, SOC 2, PCI DSS, and HIPAA. Our automated reporting features help you maintain compliance with detailed audit trails and documentation."
  },
  {
    question: "How quickly can CyberGuard detect new vulnerabilities?",
    answer: "CyberGuard detects vulnerabilities in real-time as they emerge. Our threat intelligence feeds are updated continuously, and our scanning engines can identify new vulnerabilities within minutes of their disclosure in public databases."
  },
  {
    question: "Can CyberGuard integrate with our existing security tools?",
    answer: "Yes, CyberGuard offers extensive integrations with popular security tools including SIEM systems, ticketing platforms (JIRA, ServiceNow), and other security orchestration tools through our comprehensive API and pre-built connectors."
  },
  {
    question: "What types of assets can CyberGuard scan?",
    answer: "CyberGuard can scan a wide range of assets including servers, workstations, network devices, cloud infrastructure (AWS, Azure, GCP), containers, web applications, databases, and IoT devices. Our asset discovery automatically identifies and categorizes all connected devices."
  },
  {
    question: "How does the risk prioritization work?",
    answer: "Our risk prioritization uses CVSS scores combined with business context, asset criticality, and threat intelligence to rank vulnerabilities. This ensures you focus on the most critical security issues that pose the greatest risk to your organization."
  },
  {
    question: "Is CyberGuard suitable for small businesses?",
    answer: "Absolutely! Our Starter plan is designed specifically for small teams and growing businesses. It provides essential vulnerability scanning and reporting capabilities at an affordable price point, with the ability to scale as your organization grows."
  },
  {
    question: "What kind of support does CyberGuard provide?",
    answer: "We offer 24/7 technical support for all paid plans, with priority support for Professional and Enterprise customers. Our support includes email, chat, phone support, and dedicated customer success managers for Enterprise clients."
  },
  {
    question: "How secure is CyberGuard's platform?",
    answer: "CyberGuard follows the highest security standards with SOC 2 Type II certification, end-to-end encryption, zero-trust architecture, and regular third-party security audits. We practice what we preach when it comes to cybersecurity."
  },
  {
    question: "Can we get a custom deployment or on-premise solution?",
    answer: "Yes, our Enterprise plan includes options for custom deployments, including on-premise, private cloud, or hybrid solutions. We work with your IT team to ensure the deployment meets your specific security and compliance requirements."
  }
];

export function FaqSection() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge variant="secondary" className="mb-4 bg-blue-500/20 text-cyan-200 border-blue-500/30">
            <HelpCircle className="w-4 h-4 mr-2" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Got{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Questions?
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about CyberGuard's vulnerability assessment platform
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="animate-fade-in-up stagger-2">
          <Accordion 
            type="multiple" 
            value={openItems} 
            onValueChange={setOpenItems}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-blue-900/30 rounded-lg bg-[#1a1a2e]/40 backdrop-blur-sm hover:bg-[#1a1a2e]/60 transition-all duration-300"
              >
                <AccordionTrigger className="px-6 py-4 text-left text-white hover:text-cyan-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span className="font-semibold">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-gray-300 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-up stagger-4">
          <div className="bg-[#1a1a2e]/60 border border-blue-900/30 rounded-lg p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Our security experts are here to help you understand how CyberGuard can protect your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-700 text-white font-semibold rounded-lg hover:from-cyan-300 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-400/20">
                Contact Support
              </button>
              <button className="px-8 py-3 border border-blue-500/30 text-blue-300 font-semibold rounded-lg hover:bg-blue-500/10 transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}