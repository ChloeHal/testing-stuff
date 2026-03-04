import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import RoleScrubber from "./RoleScrubber";

const ease = [0.19, 1, 0.22, 1] as const;
const ROLES = ["Designer", "Développeur", "Manager", "Marketing", "Autre"];
const DOMAINS = ["gmail.com", "outlook.com", "yahoo.fr", "icloud.com"];

/* ── Hash a string to a hue (0-360) ── */
function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return ((h % 360) + 360) % 360;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

/* ── Confetti ── */
function Particle({ angle, delay }: { angle: number; delay: number }) {
  const rad = (angle * Math.PI) / 180;
  const dist = 50 + Math.random() * 30;
  const size = 3 + Math.random() * 4;
  const colors = ["bg-brand-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-violet-400"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <motion.span
      className={`absolute left-1/2 top-1/2 rounded-full ${color}`}
      style={{ width: size, height: size }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, opacity: 0, scale: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    />
  );
}

/* ════════════════════════════════════════════════════
   Main form
   ════════════════════════════════════════════════════ */

export default function SignUpSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(1);
  const [showDomains, setShowDomains] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(name);
  const hue = nameToHue(name);
  const hasAt = email.includes("@");
  const localPart = email.split("@")[0] ?? "";
  const afterAt = email.split("@")[1] ?? "";

  /* ── Show domain dropdown when @ is typed and domain part is incomplete ── */
  useEffect(() => {
    const matchesDomain = DOMAINS.some((d) => d === afterAt);
    setShowDomains(hasAt && !matchesDomain && afterAt.length < 12);
  }, [email, hasAt, afterAt]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDomains(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pickDomain = useCallback(
    (domain: string) => {
      setEmail(localPart + "@" + domain);
      setShowDomains(false);
      emailRef.current?.focus();
    },
    [localPart]
  );

  const filteredDomains = DOMAINS.filter((d) =>
    afterAt ? d.startsWith(afterAt) : true
  );

  const canSubmit = name.trim().length > 0 && email.includes("@") && email.includes(".");

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSuccess(true);
  }, [canSubmit, submitting]);

  const handleReset = useCallback(() => {
    setName("");
    setEmail("");
    setRole(1);
    setSuccess(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Accès anticipé
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Créez votre compte
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Rejoignez +2 000 équipes qui simplifient leur gestion.
          </p>
        </div>

        <Card>
          <CardContent>
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3, ease }}
                >
                  {/* ── Name + Avatar ── */}
                  <div>
                    <Label className="mb-1.5">Nom complet</Label>
                    <div className="relative flex h-10 items-center overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                      {/* Live avatar */}
                      <div
                        className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white transition-all duration-300"
                        style={{
                          backgroundColor:
                            name.trim().length > 0
                              ? `hsl(${hue}, 60%, 55%)`
                              : "#cbd5e1",
                        }}
                      >
                        {initials || "?"}
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Marie Dupont"
                        className="h-full flex-1 bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* ── Email + Domain Suggest ── */}
                  <div className="relative mt-4" ref={dropdownRef}>
                    <Label className="mb-1.5">E-mail</Label>
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.fr"
                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <AnimatePresence>
                      {showDomains && filteredDomains.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ duration: 0.15, ease }}
                          className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
                        >
                          {filteredDomains.map((domain) => (
                            <button
                              key={domain}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => pickDomain(domain)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-100 hover:bg-slate-50"
                            >
                              <span className="text-slate-400">
                                {localPart}@
                              </span>
                              <span className="font-medium text-slate-700">
                                {domain}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── Role Scrubber ── */}
                  <div className="mt-4">
                    <Label className="mb-1.5">Votre rôle</Label>
                    <RoleScrubber
                      options={ROLES}
                      value={role}
                      onChange={setRole}
                    />
                  </div>

                  {/* ── Submit ── */}
                  <div className="mt-6">
                    <Button
                      className="w-full"
                      disabled={!canSubmit || submitting}
                      onClick={handleSubmit}
                    >
                      <AnimatePresence mode="wait">
                        {submitting ? (
                          <motion.span
                            key="l"
                            className="flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                          >
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            Création du compte…
                          </motion.span>
                        ) : (
                          <motion.span
                            key="c"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                          >
                            Commencer gratuitement
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>

                  <p className="mt-4 text-center text-[11px] text-slate-300">
                    Aucune carte bancaire requise
                  </p>
                </motion.div>
              ) : (
                /* ── Success ── */
                <motion.div
                  key="success"
                  className="relative flex flex-col items-center py-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease }}
                >
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Particle key={i} angle={i * 36} delay={0.03 + i * 0.02} />
                    ))}
                  </div>

                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100"
                  >
                    <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path d="M5 13l4 4L19 7" stroke="currentColor" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease, delay: 0.15 }} />
                    </svg>
                  </motion.div>

                  <motion.p
                    className="mt-5 text-lg font-semibold text-slate-900"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease, delay: 0.2 }}
                  >
                    Bienvenue, {name.split(" ")[0] || "vous"} !
                  </motion.p>
                  <motion.p
                    className="mt-1.5 text-center text-sm text-slate-400"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease, delay: 0.3 }}
                  >
                    Votre espace est prêt. Vérifiez vos e-mails.
                  </motion.p>

                  <motion.div
                    className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease, delay: 0.45 }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white transition-colors duration-300"
                      style={{ backgroundColor: `hsl(${hue}, 60%, 55%)` }}
                    >
                      {initials || "?"}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{name}</p>
                      <p className="text-[11px] text-slate-400">{email}</p>
                    </div>
                  </motion.div>

                  <motion.button
                    className="mt-5 text-xs font-medium text-brand-600 hover:underline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={handleReset}
                  >
                    Recommencer la démo
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
