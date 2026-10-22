"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Clock3,
  ImageIcon,
  Info,
  Lightbulb,
  Lock,
  Printer,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import {
  addMonths,
  CATEGORY_TONE,
  formatLearningDate,
  getLearningModule,
  localIsoDate,
  MAX_ATTEMPTS,
  PASS_PERCENT,
  PASS_SCORE,
  QUESTIONS_PER_TEST,
} from "@/lib/learning/catalog";
import type { LearningImage, ModuleContent } from "@/lib/learning/content/types";
import { moduleView, updateRecord, useLearningRecords } from "@/lib/learning/progress";

type Stage = "study" | "assessment" | "result" | "certificate";
type TestStatus = "idle" | "in-progress" | "passed" | "failed";
type PaperQuestion = { prompt: string; options: string[]; answer: number };

const LETTERS = ["A", "B", "C", "D"];

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** A fresh paper for every attempt: question order and answer positions are reshuffled. */
function buildPaper(content: ModuleContent): PaperQuestion[] {
  return shuffle(content.questions)
    .slice(0, QUESTIONS_PER_TEST)
    .map((question) => {
      const options = shuffle([question.correct, ...question.distractors]);
      return { prompt: question.prompt, options, answer: options.indexOf(question.correct) };
    });
}

export function ModuleRunner({ moduleId, content, learnerName }: { moduleId: string; content: ModuleContent; learnerName: string | null }) {
  const learningModule = getLearningModule(moduleId)!;
  const Icon = learningModule.icon;
  const tone = CATEGORY_TONE[learningModule.category];
  const slides = content.slides;
  const lastSlide = slides.length - 1;

  const records = useLearningRecords();
  const record = records[moduleId];
  const attemptsUsed = record?.attemptsUsed ?? 0;
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attemptsUsed);
  const passed = Boolean(record?.passedAt);
  const locked = !passed && attemptsRemaining === 0;
  const furthest = Math.min(record?.furthestSlide ?? 0, lastSlide);
  const view = moduleView(learningModule, record);

  const [stage, setStage] = useState<Stage>("study");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [paper, setPaper] = useState<PaperQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goToSlide = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(lastSlide, index));
      setCurrentSlide(next);
      updateRecord(moduleId, (r) => ({ ...r, slideCount: slides.length, furthestSlide: Math.max(r.furthestSlide, next) }));
    },
    [lastSlide, moduleId, slides.length],
  );

  // Arrow keys move through the deck while studying.
  useEffect(() => {
    if (stage !== "study") return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (event.key === "ArrowRight") goToSlide(currentSlide + 1);
      if (event.key === "ArrowLeft") goToSlide(currentSlide - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, currentSlide, goToSlide]);

  function startAssessment() {
    if (locked) return;
    const nextPaper = buildPaper(content);
    setPaper(nextPaper);
    setAnswers(Array(nextPaper.length).fill(null));
    setCurrentQuestion(0);
    setScore(null);
    setTestStatus("in-progress");
    setStage("assessment");
    scrollTop();
  }

  function submitAssessment() {
    const correct = paper.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
    const didPass = correct >= PASS_SCORE;
    updateRecord(moduleId, (r) => ({
      ...r,
      slideCount: slides.length,
      furthestSlide: Math.max(r.furthestSlide, lastSlide),
      attemptsUsed: r.attemptsUsed + 1,
      lastScore: correct,
      bestScore: Math.max(r.bestScore ?? 0, correct),
      passedAt: didPass ? new Date().toISOString() : r.passedAt,
    }));
    setScore(correct);
    setTestStatus(didPass ? "passed" : "failed");
    setStage("result");
    scrollTop();
  }

  function backToSlides(index = 0) {
    setStage("study");
    setTestStatus("idle");
    setCurrentSlide(index);
    scrollTop();
  }

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const stepIndex = stage === "study" ? 0 : stage === "certificate" || (stage === "result" && testStatus === "passed") ? 2 : 1;

  return (
    <div ref={topRef} className="min-h-full scroll-mt-4 rounded-3xl bg-[#F6F8FC] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-5xl">
        {/* ── Header ── */}
        <Link href="/dashboard/learning" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500! no-underline! hover:text-slate-900! print:hidden">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Learning Portal
        </Link>

        <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
          <div className="flex min-w-0 items-start gap-3">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${tone.tile}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{learningModule.category}</span>
              <h1 className="text-xl! font-semibold! leading-tight! tracking-tight text-slate-900! sm:text-2xl!">{learningModule.title}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-600">
                <Chip icon={Clock3}>{learningModule.duration}</Chip>
                <Chip icon={BookOpen}>{slides.length} slides</Chip>
                <Chip icon={ClipboardCheck}>{QUESTIONS_PER_TEST} questions · pass {PASS_PERCENT}%</Chip>
                <Chip icon={RotateCcw} tone={attemptsRemaining <= 1 && !passed ? "text-rose-700 bg-rose-50 border-rose-100" : undefined}>
                  {attemptsRemaining} of {MAX_ATTEMPTS} attempts left
                </Chip>
              </div>
            </div>
          </div>
          <Stepper current={stepIndex} />
        </header>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 print:hidden">
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Demonstration training content, pending clinical review. Progress is saved in this browser only.
        </div>

        {/* ── Standing banners ── */}
        {stage === "study" && passed && record?.passedAt && (
          <Banner tone="emerald" icon={CircleCheck} title={`Passed on ${formatLearningDate(localIsoDate(record.passedAt))} with ${record.bestScore}/${QUESTIONS_PER_TEST}`}>
            Your certificate is valid until {formatLearningDate(addMonths(localIsoDate(record.passedAt), learningModule.validityMonths))}.
            <button type="button" onClick={() => setStage("certificate")} className="ml-2 font-semibold text-emerald-800 underline underline-offset-2">
              View certificate
            </button>
          </Banner>
        )}
        {stage === "study" && !passed && view.status === "Completed" && (
          <Banner tone="sky" icon={Info} title={`Current certificate valid until ${formatLearningDate(view.date)}`}>
            You can complete this module again as a refresher at any time.
          </Banner>
        )}
        {stage === "study" && locked && (
          <Banner tone="rose" icon={Lock} title="Assessment locked">
            Maximum attempts reached. You can still review the slides. Contact Clinical Governance to arrange remediation.
          </Banner>
        )}
        {stage === "study" && !locked && currentSlide === 0 && furthest > 0 && (
          <Banner tone="sky" icon={BookOpen} title={`You stopped at slide ${furthest + 1} of ${slides.length}`}>
            <button type="button" onClick={() => goToSlide(furthest)} className="font-semibold text-sky-800 underline underline-offset-2">
              Resume where you left off
            </button>
          </Banner>
        )}

        {/* ── Stage content ── */}
        <div className="mt-5">
          {stage === "study" && (
            <SlideViewer
              content={content}
              currentSlide={currentSlide}
              furthest={Math.max(furthest, currentSlide)}
              onGo={goToSlide}
              toneSoft={tone.soft}
              toneText={tone.text}
              moduleTitle={learningModule.title}
              locked={locked}
              onStartAssessment={startAssessment}
            />
          )}

          {stage === "assessment" && testStatus === "in-progress" && paper.length > 0 && (
            <Assessment
              paper={paper}
              answers={answers}
              currentQuestion={currentQuestion}
              attemptNumber={attemptsUsed + 1}
              answeredCount={answeredCount}
              onAnswer={(choice) => setAnswers((prev) => prev.map((value, index) => (index === currentQuestion ? choice : value)))}
              onGo={(index) => setCurrentQuestion(Math.max(0, Math.min(paper.length - 1, index)))}
              onSubmit={submitAssessment}
              onExit={() => backToSlides(lastSlide)}
            />
          )}

          {stage === "result" && score !== null && (
            <Result
              status={testStatus}
              score={score}
              attemptsRemaining={attemptsRemaining}
              onCertificate={() => {
                setStage("certificate");
                scrollTop();
              }}
              onRetake={startAssessment}
              onReview={() => backToSlides(0)}
            />
          )}

          {stage === "certificate" && record?.passedAt && (
            <Certificate
              learnerName={learnerName}
              moduleTitle={learningModule.title}
              moduleId={moduleId}
              score={record.bestScore ?? score ?? 0}
              passedAt={record.passedAt}
              validUntil={addMonths(localIsoDate(record.passedAt), learningModule.validityMonths)}
              onBack={() => backToSlides(0)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Header pieces ───────────────────────── */

function Chip({ icon: Icon, tone, children }: { icon: typeof Clock3; tone?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${tone ?? "border-slate-200 bg-white"}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {children}
    </span>
  );
}

function Stepper({ current }: { current: number }) {
  const steps = ["Study", "Assessment", "Certificate"];
  return (
    <ol className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold" aria-label="Module progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex items-center gap-1.5" aria-current={active ? "step" : undefined}>
            <span
              className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
                done ? "bg-emerald-500 text-white" : active ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {done ? <Check className="h-3 w-3" aria-hidden="true" /> : index + 1}
            </span>
            <span className={active ? "text-slate-900" : "text-slate-400"}>{step}</span>
            {index < steps.length - 1 && <span className="mx-0.5 h-px w-4 bg-slate-300" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

const BANNER_TONE = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  sky: "border-sky-200 bg-sky-50 text-sky-900",
  rose: "border-rose-200 bg-rose-50 text-rose-900",
} as const;

function Banner({ tone, icon: Icon, title, children }: { tone: keyof typeof BANNER_TONE; icon: typeof Info; title: string; children: React.ReactNode }) {
  return (
    <div className={`mt-4 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] print:hidden ${BANNER_TONE[tone]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        <span className="font-semibold">{title}.</span> <span className="opacity-90">{children}</span>
      </div>
    </div>
  );
}

/* ───────────────────────── Study mode ───────────────────────── */

function SlideViewer({
  content,
  currentSlide,
  furthest,
  onGo,
  toneSoft,
  toneText,
  moduleTitle,
  locked,
  onStartAssessment,
}: {
  content: ModuleContent;
  currentSlide: number;
  furthest: number;
  onGo: (index: number) => void;
  toneSoft: string;
  toneText: string;
  moduleTitle: string;
  locked: boolean;
  onStartAssessment: () => void;
}) {
  const slides = content.slides;
  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  return (
    <section aria-roledescription="slide deck" aria-label={`${moduleTitle} slides`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Progress strip */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 sm:px-6">
        <span className="text-xs font-semibold text-slate-700" aria-live="polite">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 sm:w-48" aria-hidden="true">
          <div className="h-full rounded-full bg-sky-500 transition-[width] duration-300" style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} />
        </div>
      </div>

      {/* Slide body */}
      <div key={currentSlide} className="grid gap-5 p-4 sm:p-6 md:min-h-[380px] md:grid-cols-5 md:gap-7 lg:p-8">
        <div className="md:col-span-3">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${toneText}`}>
            {currentSlide === 0 ? "Introduction" : isLast ? "Summary" : `Part ${currentSlide + 1}`}
          </span>
          <h2 className="mt-1 text-lg! font-semibold! leading-snug! text-slate-900! sm:text-xl!">{slide.title}</h2>
          <ul className="mt-4 space-y-2.5">
            {slide.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2.5 text-sm! leading-relaxed!">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {slide.keyPoint && (
            <div className="mt-5 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-900">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <span className="font-medium">{slide.keyPoint}</span>
            </div>
          )}
        </div>

        {slide.image ? <SlideImage key={slide.image.src} image={slide.image} /> : <figure className={`flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center md:col-span-2 ${toneSoft}`}>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/80 shadow-sm">
            <ImageIcon className={`h-5 w-5 ${toneText}`} aria-hidden="true" />
          </span>
          <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Clinical illustration</span>
          <figcaption className="mt-1 max-w-[16rem] text-xs! leading-snug! text-slate-600!">{slide.visual}</figcaption>
        </figure>}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="order-2 flex flex-wrap justify-center gap-1 sm:order-none" aria-label="Jump to slide">
          {slides.map((s, index) => {
            const reachable = index <= furthest + 1;
            return (
              <button
                key={s.title}
                type="button"
                disabled={!reachable}
                onClick={() => onGo(index)}
                aria-label={`Slide ${index + 1}: ${s.title}`}
                aria-current={index === currentSlide ? "step" : undefined}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? "w-5 bg-slate-900" : index <= furthest ? "w-2 bg-sky-400 hover:bg-sky-500" : "w-2 bg-slate-200"
                } disabled:cursor-not-allowed`}
              />
            );
          })}
        </div>

        <div className="order-1 flex items-center justify-between gap-2 sm:order-none">
          <button
            type="button"
            onClick={() => onGo(currentSlide - 1)}
            disabled={currentSlide === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          {!isLast ? (
            <button
              type="button"
              onClick={() => onGo(currentSlide + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : locked ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3.5 py-2 text-[13px] font-semibold text-rose-700 ring-1 ring-rose-200">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Assessment locked
            </span>
          ) : (
            <button
              type="button"
              onClick={onStartAssessment}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              Start Final Assessment ({QUESTIONS_PER_TEST} Questions)
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Test mode ───────────────────────── */

function Assessment({
  paper,
  answers,
  currentQuestion,
  attemptNumber,
  answeredCount,
  onAnswer,
  onGo,
  onSubmit,
  onExit,
}: {
  paper: PaperQuestion[];
  answers: (number | null)[];
  currentQuestion: number;
  attemptNumber: number;
  answeredCount: number;
  onAnswer: (choice: number) => void;
  onGo: (index: number) => void;
  onSubmit: () => void;
  onExit: () => void;
}) {
  const question = paper[currentQuestion];
  const selected = answers[currentQuestion];
  const isLast = currentQuestion === paper.length - 1;
  const allAnswered = answeredCount === paper.length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Assessment question">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 sm:px-6">
          <span className="text-xs font-semibold text-slate-700" aria-live="polite">
            Question {currentQuestion + 1} of {paper.length}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            Attempt {attemptNumber} of {MAX_ATTEMPTS}
          </span>
        </div>
        <div className="h-1 bg-slate-100" aria-hidden="true">
          <div className="h-full bg-sky-500 transition-[width] duration-300" style={{ width: `${(answeredCount / paper.length) * 100}%` }} />
        </div>

        <div className="p-4 sm:p-6">
          <h2 id="question-prompt" className="text-base! font-semibold! leading-snug! text-slate-900! sm:text-lg!">
            {question.prompt}
          </h2>
          <div role="radiogroup" aria-labelledby="question-prompt" className="mt-4 space-y-2">
            {question.options.map((option, index) => {
              const isSelected = selected === index;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onAnswer(index)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                    isSelected ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold ${
                      isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {LETTERS[index]}
                  </span>
                  <span className={`pt-0.5 leading-snug ${isSelected ? "font-medium text-slate-900" : "text-slate-700"}`}>{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => onGo(currentQuestion - 1)}
            disabled={currentQuestion === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!allAnswered}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Submit assessment
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onGo(currentQuestion + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Question navigator">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900">Answered</span>
          <span className="tabular-nums text-slate-500">
            {answeredCount}/{paper.length}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-10 gap-1.5 lg:grid-cols-5">
          {paper.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onGo(index)}
              aria-label={`Question ${index + 1}${answers[index] !== null ? ", answered" : ""}`}
              aria-current={index === currentQuestion ? "step" : undefined}
              className={`grid aspect-square place-items-center rounded-md text-[11px] font-semibold tabular-nums transition ${
                index === currentQuestion
                  ? "bg-slate-900 text-white"
                  : answers[index] !== null
                    ? "bg-sky-100 text-sky-800 hover:bg-sky-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allAnswered}
          className="mt-4 w-full rounded-lg bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {allAnswered ? "Submit assessment" : `${paper.length - answeredCount} unanswered`}
        </button>
        <div className="mt-2 text-center text-[11px] leading-snug text-slate-500">
          Pass mark {PASS_SCORE}/{paper.length}. An attempt counts when you submit.
        </div>
        <button type="button" onClick={onExit} className="mt-3 w-full text-center text-[11px] font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">
          Exit and return to slides
        </button>
      </aside>
    </div>
  );
}

/* ───────────────────────── Outcomes ───────────────────────── */

function SlideImage({ image }: { image: LearningImage }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="m-0! min-w-0 self-start overflow-hidden rounded-xl border border-slate-200 bg-slate-50 md:col-span-2">
      <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="block bg-white p-3" aria-label={`Open full image and source: ${image.alt}`}>
        {failed ? (
          <span role="status" className="flex min-h-48 items-center justify-center p-5 text-center text-sm text-slate-700">Image unavailable. Open the original source.</span>
        ) : (
          <Image src={image.src} alt={image.alt} width={800} height={600} unoptimized onError={() => setFailed(true)} className="h-auto max-h-[420px] w-full object-contain" />
        )}
      </a>
      <figcaption className="space-y-2 border-t border-slate-200 p-3 text-xs! leading-relaxed! text-slate-700!">
        <p className="m-0!">{image.caption}</p>
        <p className="m-0! text-[10px]! text-slate-600!">
          {image.credit} · <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{image.license}</a>
          {" · "}<a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Source / full image</a>
        </p>
      </figcaption>
    </figure>
  );
}

function Result({
  status,
  score,
  attemptsRemaining,
  onCertificate,
  onRetake,
  onReview,
}: {
  status: TestStatus;
  score: number;
  attemptsRemaining: number;
  onCertificate: () => void;
  onRetake: () => void;
  onReview: () => void;
}) {
  const percent = Math.round((score / QUESTIONS_PER_TEST) * 100);
  const didPass = status === "passed";
  const lockedOut = !didPass && attemptsRemaining === 0;
  const Icon = didPass ? CircleCheck : lockedOut ? ShieldAlert : CircleX;
  const accent = didPass ? "text-emerald-600 bg-emerald-50 ring-emerald-100" : lockedOut ? "text-rose-600 bg-rose-50 ring-rose-100" : "text-amber-600 bg-amber-50 ring-amber-100";

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8" aria-live="polite">
      <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ring-8 ${accent}`}>
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl! font-semibold! text-slate-900!">
        {didPass ? "Assessment passed" : lockedOut ? "Maximum attempts reached" : "Not passed this time"}
      </h2>

      <div className="mt-4 flex items-baseline justify-center gap-2">
        <span className="text-4xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {score}/{QUESTIONS_PER_TEST}
        </span>
        <span className={`text-sm font-semibold ${didPass ? "text-emerald-600" : "text-rose-600"}`}>{percent}%</span>
      </div>
      <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className={`h-full rounded-full ${didPass ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-1.5 text-[11px] text-slate-500">
        Pass mark {PASS_SCORE}/{QUESTIONS_PER_TEST} ({PASS_PERCENT}%)
      </div>

      <div className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-slate-600">
        {didPass && "Well done. Your result has been recorded and your certificate is ready."}
        {!didPass && !lockedOut && (
          <>
            Review the slides, then try again. You have{" "}
            <strong className="text-slate-900">
              {attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"}
            </strong>{" "}
            remaining.
          </>
        )}
        {lockedOut && (
          <>
            The assessment is now locked. Please contact <strong className="text-slate-900">Clinical Governance</strong> to arrange remediation training before
            another attempt is allowed.
          </>
        )}
      </div>

      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        {didPass && (
          <>
            <button type="button" onClick={onCertificate} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
              <Award className="h-4 w-4" aria-hidden="true" />
              Generate Certificate
            </button>
            <Link href="/dashboard/learning" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700! no-underline! shadow-sm hover:bg-slate-50">
              Back to Learning Portal
            </Link>
          </>
        )}
        {!didPass && !lockedOut && (
          <>
            <button type="button" onClick={onRetake} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Retake Assessment
            </button>
            <button type="button" onClick={onReview} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Review slides
            </button>
          </>
        )}
        {lockedOut && (
          <>
            <Link href="/dashboard/governance" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white! no-underline! shadow-sm hover:bg-slate-800">
              Contact Clinical Governance
            </Link>
            <Link href="/dashboard/learning" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700! no-underline! shadow-sm hover:bg-slate-50">
              Back to Learning Portal
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

function Certificate({
  learnerName,
  moduleTitle,
  moduleId,
  score,
  passedAt,
  validUntil,
  onBack,
}: {
  learnerName: string | null;
  moduleTitle: string;
  moduleId: string;
  score: number;
  passedAt: string;
  validUntil: string;
  onBack: () => void;
}) {
  const certificateId = useMemo(() => {
    const initials = moduleId.split("-").map((part) => part[0]).join("").toUpperCase();
    const at = new Date(passedAt);
    const time = [at.getHours(), at.getMinutes(), at.getSeconds()].map((n) => String(n).padStart(2, "0")).join("");
    return `MRF-${initials}-${localIsoDate(passedAt).replaceAll("-", "")}-${time}`;
  }, [moduleId, passedAt]);

  return (
    <div>
      {/* Print only the certificate, not the app around it. */}
      <style>{`@media print { body * { visibility: hidden !important; } .learning-certificate, .learning-certificate * { visibility: visible !important; } .learning-certificate { position: fixed; inset: 0; margin: 0 !important; border: 0 !important; box-shadow: none !important; } }`}</style>

      <div className="learning-certificate mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="relative rounded-xl border-2 border-double border-emerald-200 px-6 py-10 text-center sm:px-12">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
            <Award className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-700">Marifa · Learning &amp; Audit Portal</div>
          <h2 className="mt-2 text-2xl! font-semibold! tracking-tight text-slate-900! sm:text-3xl!">Certificate of Completion</h2>
          <div className="mt-6 text-sm text-slate-500">This certifies that</div>
          <div className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">{learnerName ?? "Marifa learner"}</div>
          <div className="mt-4 text-sm text-slate-500">has successfully completed the mandatory training module</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{moduleTitle}</div>
          <div className="mt-1 text-sm text-slate-600">
            with an assessment score of {score}/{QUESTIONS_PER_TEST} ({Math.round((score / QUESTIONS_PER_TEST) * 100)}%)
          </div>

          <dl className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-3 text-left text-xs sm:grid-cols-3">
            <CertField label="Completed" value={formatLearningDate(localIsoDate(passedAt))} />
            <CertField label="Valid until" value={formatLearningDate(validUntil)} />
            <CertField label="Certificate ID" value={certificateId} mono />
          </dl>
          <div className="mt-8 text-[10px] uppercase tracking-[0.12em] text-slate-400">Demonstration certificate — not valid as accreditation evidence</div>
        </div>
      </div>

      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row print:hidden">
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print or save as PDF
        </button>
        <Link href="/dashboard/learning" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700! no-underline! shadow-sm hover:bg-slate-50">
          Back to Learning Portal
        </Link>
        <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
          Review slides
        </button>
      </div>
    </div>
  );
}

function CertField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</dt>
      <dd className={`mt-0.5 font-semibold text-slate-800 ${mono ? "font-mono text-[11px]" : ""}`}>{value}</dd>
    </div>
  );
}
