'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Mock data for realistic workflow demonstration
const documentTypes = [
  { name: 'Security Policy', type: 'PDF', status: 'parsing' },
  { name: 'SOC 2 Report', type: 'PDF', status: 'indexed' },
  { name: 'Audit Evidence', type: 'DOC', status: 'processing' },
  { name: 'Vendor Assessment', type: 'PDF', status: 'ready' }
];

const sampleQuestion = "How does your organization ensure data encryption at rest and in transit?";
const sampleAnswer = "Our organization implements AES-256 encryption for all data at rest using AWS KMS, and TLS 1.3 for data in transit. This is documented in our Security Policy Section 4.2 and validated in our SOC 2 Type II report.";

const workflowSteps = [
  {
    id: 'ingest',
    title: 'Ingest Evidence',
    subtitle: 'Upload & Index',
    description: 'Drag in policies, audit reports, and security documentation. AI extracts and indexes all content.',
    color: 'rgba(59, 130, 246, 0.15)',
    accentColor: 'var(--vault-blue)'
  },
  {
    id: 'generate',
    title: 'Generate Drafts',
    subtitle: 'AI Analysis',
    description: 'Advanced RAG system matches questions to evidence, drafts accurate responses with citations.',
    color: 'rgba(16, 185, 129, 0.15)',
    accentColor: '#10b981'
  },
  {
    id: 'export',
    title: 'Approve & Export',
    subtitle: 'Review & Ship',
    description: 'Review AI drafts, approve answers, and export completed questionnaires in any format.',
    color: 'rgba(139, 92, 246, 0.15)',
    accentColor: '#8b5cf6'
  }
];

interface WorkflowDemoProps {
  autoPlay?: boolean;
  className?: string;
}

export default function WorkflowDemo({ autoPlay = true, className = '' }: WorkflowDemoProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [documentProgress, setDocumentProgress] = useState(0);
  const [showAIThinking, setShowAIThinking] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Auto-progression logic
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Step-specific animations
  useEffect(() => {
    if (activeStep === 0) {
      setDocumentProgress(0);
      const progressTimer = setInterval(() => {
        setDocumentProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + Math.random() * 12;
        });
      }, 250);
      return () => clearInterval(progressTimer);
    } else if (activeStep === 1) {
      setShowAIThinking(true);
      setConfidence(0);
      const thinkingTimer = setTimeout(() => {
        setShowAIThinking(false);
        const confidenceTimer = setInterval(() => {
          setConfidence((prev) => {
            if (prev >= 94) {
              clearInterval(confidenceTimer);
              return 94;
            }
            return prev + Math.random() * 8;
          });
        }, 100);
        return () => clearInterval(confidenceTimer);
      }, 1800);
      return () => clearTimeout(thinkingTimer);
    }
  }, [activeStep]);

  const handleStepClick = useCallback((stepIndex: number) => {
    setActiveStep(stepIndex);
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const stepVariants = {
    inactive: { opacity: 0.6 },
    active: { opacity: 1 }
  };

  return (
    <motion.div 
      className={`relative overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ 
        duration: shouldReduceMotion ? 0.2 : 0.8,
        ease: "easeOut"
      }}
    >
      <div className="flex flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:gap-16">
        {/* Step Indicators */}
        <div className="flex w-full gap-2 sm:gap-4 lg:w-auto lg:flex-col">
          {workflowSteps.map((step, index) => (
            <motion.button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className="group relative flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-3 backdrop-blur-sm sm:gap-4 sm:rounded-2xl sm:p-6 lg:min-w-[280px] lg:flex-none"
              variants={stepVariants}
              animate={activeStep === index ? 'active' : 'inactive'}
              transition={{ 
                duration: shouldReduceMotion ? 0.1 : 0.4,
                ease: 'easeInOut'
              }}
              style={{
                background: activeStep === index ? step.color : 'var(--card-2)',
                borderColor: activeStep === index ? step.accentColor : 'var(--border)',
                transition: 'background 0.5s ease-in-out, border-color 0.5s ease-in-out'
              }}
              whileHover={shouldReduceMotion ? {} : { 
                opacity: 0.9,
                transition: { duration: 0.15 }
              }}
              whileTap={shouldReduceMotion ? {} : { opacity: 0.8 }}
            >
              <div className="flex items-center gap-2 sm:gap-4">
                <div 
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold sm:h-12 sm:w-12 sm:rounded-xl sm:text-lg"
                  style={{
                    background: activeStep === index ? step.accentColor : 'var(--border)',
                    color: activeStep === index ? 'white' : 'var(--muted)',
                    transition: 'background 0.5s ease-in-out, color 0.5s ease-in-out'
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <h3 className="text-[11px] font-semibold leading-tight text-[var(--fg)] sm:text-sm lg:text-base">
                    {step.title}
                  </h3>
                  <p className="hidden text-xs text-[var(--muted)] sm:block lg:text-sm">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              {activeStep === index && (
                <motion.div
                  className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full"
                  style={{ background: step.accentColor }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0.1 : 0.4, ease: 'easeInOut' }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Demo Visualization — fixed height container */}
        <div className="w-full flex-1 lg:min-h-[500px]">
          <div 
            className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 backdrop-blur-sm sm:rounded-3xl sm:p-8"
            style={{ minHeight: '480px' }}
          >
            {/* Playback Controls */}
            <div className="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-6 sm:top-6">
              <button
                onClick={togglePlayPause}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-2)] text-xs transition-all hover:border-opacity-50"
                style={{ color: 'var(--vault-blue)' }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <div className="text-xs text-[var(--muted)]">
                {Math.floor((activeStep / (workflowSteps.length - 1)) * 100)}%
              </div>
            </div>

            {/* Step Content — crossfade with fixed dimensions */}
            <div className="relative" style={{ minHeight: '340px' }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)', position: 'absolute', top: 0, left: 0, right: 0 }}
                  className="will-change-[opacity,filter]"
                  transition={{ 
                    duration: shouldReduceMotion ? 0.05 : 0.6,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <div style={{ minHeight: '340px' }}>
                    {activeStep === 0 && <IngestVisualization progress={documentProgress} />}
                    {activeStep === 1 && <GenerateVisualization 
                      showThinking={showAIThinking} 
                      confidence={confidence} 
                    />}
                    {activeStep === 2 && <ExportVisualization />}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step Description — smooth text crossfade */}
            <div className="mt-6 border-t border-[var(--border)] pt-6">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={activeStep}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, position: 'absolute' }}
                  transition={{ duration: shouldReduceMotion ? 0.05 : 0.4, ease: 'easeInOut' }}
                  className="text-sm leading-relaxed text-[var(--muted)]"
                >
                  {workflowSteps[activeStep].description}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 w-full overflow-hidden rounded-full bg-[var(--border)]" style={{ height: '2px' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--vault-blue)' }}
          initial={{ width: 0 }}
          animate={{ width: `${((activeStep + 1) / workflowSteps.length) * 100}%` }}
          transition={{ duration: shouldReduceMotion ? 0.1 : 0.7, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}

// ─── Visualization Components (consistent height: 340px min) ───

function IngestVisualization({ progress }: { progress: number }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
          📁
        </div>
        <div>
          <h3 className="font-semibold text-[var(--fg)]">Knowledge Vault</h3>
          <p className="text-sm text-[var(--muted)]">Processing security evidence...</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {documentTypes.map((doc, index) => (
          <motion.div
            key={doc.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              delay: index * 0.1, 
              duration: shouldReduceMotion ? 0.05 : 0.3,
              ease: 'easeOut'
            }}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card-2)] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">📄</div>
              <div>
                <div className="text-sm font-medium text-[var(--fg)]">{doc.name}</div>
                <div className="text-xs text-[var(--muted)]">{doc.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {progress > index * 25 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="text-green-500"
                >
                  ✓
                </motion.div>
              )}
              <div className="text-xs text-[var(--muted)]">{doc.status}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-auto space-y-2">
        <div className="flex justify-between text-xs text-[var(--muted)]">
          <span>Indexing Progress</span>
          <span>{Math.round(Math.min(progress, 100))}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

function GenerateVisualization({ showThinking, confidence }: { showThinking: boolean; confidence: number }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card-2)] px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-orange-400"></div>
          <span className="text-sm font-medium text-[var(--fg)]">Security Question</span>
        </div>
        <p className="text-sm text-[var(--muted)]">{sampleQuestion}</p>
      </div>

      {/* Fixed-height area for thinking/answer — prevents layout shift */}
      <div style={{ minHeight: '200px' }}>
        <AnimatePresence mode="wait">
          {showThinking ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.4, ease: 'easeInOut' }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="h-6 w-6 rounded-full border-2 border-[var(--vault-blue)] border-t-transparent"
                />
                <span className="text-sm text-[var(--muted)]">AI analyzing evidence...</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, ease: 'easeOut' }}
              className="flex flex-col gap-4"
            >
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span className="text-sm font-medium text-[var(--fg)]">Generated Answer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">Confidence:</span>
                    <span className="text-xs font-semibold text-green-400">
                      {Math.round(confidence)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[var(--fg)]">{sampleAnswer}</p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-[var(--fg)]">Source Citations</h4>
                {['Security Policy Section 4.2', 'SOC 2 Type II Report'].map((citation, index) => (
                  <motion.div
                    key={citation}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.12, duration: shouldReduceMotion ? 0.1 : 0.35, ease: 'easeOut' }}
                    className="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--card-2)] px-3 py-2"
                  >
                    <div className="text-xs">🔗</div>
                    <span className="text-xs text-[var(--muted)]">{citation}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExportVisualization() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
          ⚡
        </div>
        <div>
          <h3 className="font-semibold text-[var(--fg)]">Review & Export</h3>
          <p className="text-sm text-[var(--muted)]">Final approval and delivery</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <motion.button
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span className="font-medium text-[var(--fg)]">Approve Answer</span>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">AI-generated response looks good</p>
        </motion.button>

        <motion.button
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          className="rounded-lg border border-[var(--border)] bg-[var(--card-2)] px-4 py-3 text-left transition-colors hover:border-opacity-50"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">✏️</span>
            <span className="font-medium text-[var(--fg)]">Edit Answer</span>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">Make custom adjustments</p>
        </motion.button>
      </div>

      <div className="flex flex-col gap-2.5">
        <h4 className="text-sm font-medium text-[var(--fg)]">Export Options</h4>
        {['SOC 2 Template', 'Custom DDQ Format', 'SIG Lite Standard'].map((format, index) => (
          <motion.div
            key={format}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: shouldReduceMotion ? 0.1 : 0.35, ease: 'easeOut' }}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card-2)] px-4 py-3"
          >
            <span className="text-sm text-[var(--fg)]">{format}</span>
            <button className="text-xs font-medium transition-colors hover:text-[var(--vault-blue)]" style={{ color: 'var(--vault-blue)' }}>
              Export
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: shouldReduceMotion ? 0.1 : 0.5, ease: 'easeOut' }}
        className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-center"
      >
        <div className="text-sm font-semibold text-[var(--fg)]">
          🎉 Questionnaire Complete
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          8 minutes instead of 2 weeks
        </p>
      </motion.div>
    </div>
  );
}
