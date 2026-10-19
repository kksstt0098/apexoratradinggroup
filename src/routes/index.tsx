import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Eye, EyeOff, RefreshCw, ChevronDown, Check } from "lucide-react";
import bg from "@/assets/login-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In — ETO Markets" },
      { name: "description", content: "Sign in to your ETO Markets account and start the adventure." },
      { property: "og:title", content: "Sign In — ETO Markets" },
      { property: "og:description", content: "Sign in to your ETO Markets account and start the adventure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12 sm:h-16 sm:w-16" aria-hidden>
      <defs>
        <linearGradient id="eg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand-yellow)" />
          <stop offset="0.5" stopColor="var(--brand-orange)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <path
        d="M50 18 C42 8 22 8 14 22 C6 36 16 54 32 54 C42 54 50 48 54 40 M18 34 L50 26"
        fill="none"
        stroke="url(#eg)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Index() {
  const [show, setShow] = useState(false);
  const [robot, setRobot] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <img
        src={bg}
        alt=""
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 lg:justify-end lg:px-0 lg:py-0 lg:pr-[6%]">
        <div className="w-full max-w-[612px] rounded-3xl bg-card px-6 py-8 shadow-2xl sm:px-10 sm:py-12 lg:min-h-screen lg:rounded-b-none">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-background shadow-sm sm:h-24 sm:w-24">
            <Logo />
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Welcome to ETO Markets
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground sm:text-base">
            Please sign-in to your account and start the adventure
          </p>

          <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email" className="mb-3 block text-sm font-semibold text-foreground">Email</label>
              <div className="flex h-16 items-center rounded-xl border border-border bg-background px-6">
                <input id="email" type="email" placeholder="Enter your email" className="min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground" />
                <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-3 block text-sm font-semibold text-foreground">Password</label>
              <div className="flex h-16 items-center rounded-xl border border-border bg-background px-6">
                <input id="password" type={show ? "text" : "password"} placeholder="Enter your password" className="min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setShow(!show)} aria-label="Toggle password" className="shrink-0 text-muted-foreground">
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <label className="flex h-16 cursor-pointer items-center gap-4 rounded-xl border border-border bg-background px-6">
              <input type="checkbox" checked={robot} onChange={(e) => setRobot(e.target.checked)} className="h-6 w-6 shrink-0 accent-primary" />
              <span className="flex-1 font-medium text-foreground">I'm not a robot</span>
              <RefreshCw className="h-6 w-6 shrink-0 text-muted-foreground" />
            </label>
            <div className="flex items-center justify-between gap-3 text-sm font-medium">
              <label className="flex cursor-pointer items-center gap-3 text-foreground">
                <input type="checkbox" className="h-6 w-6 accent-primary" />
                Keep login
              </label>
              <a href="#" className="font-semibold text-foreground hover:underline">Reset password</a>
            </div>
            <button type="submit" className="h-14 w-full rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg transition hover:opacity-90 sm:h-[70px]">
              Sign In
            </button>
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground sm:text-base">Don't have an account yet?</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-center text-sm font-semibold text-foreground sm:text-base">
              <button type="button" onClick={() => setCreateOpen(true)} className="hover:underline">Create Live Account</button>
              <a href="#" className="hover:underline">Try Demo Account</a>
            </div>
          </form>
        </div>
      </div>
      {createOpen && <CreateAccountModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

function CreateAccountModal({ onClose }: { onClose: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const labelCls = "mb-2 block text-xs font-semibold text-foreground";
  const inputCls =
    "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-10 sm:py-16"
      onClick={onClose}
    >
      <div
        className="relative mx-auto w-full max-w-[520px] rounded-2xl bg-card px-5 pb-8 pt-10 shadow-2xl sm:px-9"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-6 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-primary shadow-lg">
          <span className="text-xl font-black text-primary-foreground">E</span>
        </div>

        <h2 className="text-center text-2xl font-bold text-foreground">Create account</h2>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Provide your details to begin your trading journey with us.
        </p>

        <div className="mt-8 flex items-end justify-between border-b border-border pb-3">
          <div>
            <span className="text-base font-bold text-foreground">Personal Details</span>
            <div className="mt-2 h-[3px] w-44 rounded-full bg-primary" />
          </div>
          <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5" />
            Step: 1 / 2
          </span>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelCls}>First Name</label>
              <input id="firstName" className={inputCls} placeholder="Enter your first name" />
            </div>
            <div>
              <label htmlFor="middleName" className={labelCls}>Middle Name (Optional)</label>
              <input id="middleName" className={inputCls} placeholder="Enter your middle name" />
            </div>
          </div>
          <div>
            <label htmlFor="lastName" className={labelCls}>Last Name</label>
            <input id="lastName" className={inputCls} placeholder="Enter your last name" />
          </div>
          <div>
            <label htmlFor="regEmail" className={labelCls}>Email</label>
            <div className="relative">
              <input id="regEmail" type="email" className={`${inputCls} pr-24`} placeholder="Enter your email" />
              <button
                type="button"
                className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
              >
                Verify
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="vcode" className={labelCls}>Verification Code</label>
            <input id="vcode" inputMode="numeric" maxLength={6} className={inputCls} placeholder="Enter 6-digit code" />
          </div>
          <div>
            <label htmlFor="regPassword" className={labelCls}>Password</label>
            <div className="relative">
              <input
                id="regPassword"
                type={showPw ? "text" : "password"}
                className={`${inputCls} pr-12`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label="Toggle password"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelCls}>Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className={`${inputCls} pr-12`}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Toggle confirm password"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="phone" className={labelCls}>Phone Number</label>
            <input id="phone" type="tel" className={inputCls} placeholder="+15551234567 (Country Code Required)" />
          </div>
          <div>
            <span className={labelCls}>Country/Region of Residence</span>
            <button
              type="button"
              className="flex h-12 w-full items-center justify-between rounded-lg border border-border bg-background px-4 text-sm text-muted-foreground"
            >
              Please select your country
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label htmlFor="invite" className={labelCls}>Invite Code (Optional)</label>
            <input id="invite" inputMode="numeric" maxLength={6} className={inputCls} placeholder="Enter your 6-digit invite code" />
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg transition hover:opacity-90"
          >
            Continue
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already a customer?{" "}
          <button type="button" onClick={onClose} className="font-semibold text-primary underline">
            Sign in to your account
          </button>
        </p>
      </div>
    </div>
  );
}
