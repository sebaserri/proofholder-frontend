// src/pages/login.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLogin } from "../state/session";
import { useToast } from "../ui/toast/ToastProvider";
import { Alert, Badge, Button, Card, Checkbox, Divider, Input } from "../components";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Icons
const MailIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      d="M22 6l-10 7L2 6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const LockIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <rect
      x="4"
      y="10"
      width="16"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M8 10V7a4 4 0 118 0v3"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const ShieldIcon = (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default function LoginPage() {
  const nav = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const searchParams = new URLSearchParams(location.searchStr ?? "");
  const nextParam = searchParams.get("next");

  const { show } = useToast();

  const captchaRef = useRef<HTMLInputElement>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Brute-force guard
  const [failCount, setFailCount] = useState(0);
  const needsCaptcha = failCount >= 3;
  const [captchaOK, setCaptchaOK] = useState(false);
  const [captchaErr, setCaptchaErr] = useState("");

  const { mutateAsync, isPending, error } = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    if (needsCaptcha && !captchaOK) {
      setCaptchaErr("Please confirm you're not a robot.");
      captchaRef.current?.focus();
      return;
    }
    setCaptchaErr("");

    try {
      const result = await mutateAsync(data);
      const role = result.user.role;

      show({
        variant: "success",
        title: "Welcome!",
        description: `Logged in as ${data.email}`,
      });

      let redirectTo = nextParam || "/profile";

      if (!nextParam) {
        const isManagement =
          role === "ACCOUNT_OWNER" ||
          role === "PORTFOLIO_MANAGER" ||
          role === "PROPERTY_MANAGER";
        if (isManagement) {
          redirectTo = "/admin/cois";
        } else if (role === "GUARD") {
          redirectTo = "/guard/check";
        } else if (role === "VENDOR") {
          redirectTo = "/vendor";
        }
      }

      nav({ to: redirectTo, replace: true });
    } catch {
      setFailCount((c) => c + 1);
      setTimeout(() => {
        if (needsCaptcha && !captchaOK) captchaRef.current?.focus();
      }, 0);
    }
  };

  const isDisabled = isPending || (needsCaptcha && !captchaOK);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Login Card */}
        <Card variant="glass" padding="xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-3">
              <span className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Log in to manage your COI compliance
            </p>
          </div>

          {/* Form */}
          <form
            className="space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-busy={isPending}
          >
            {/* Email Field */}
            <Input
              {...register("email")}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              label="Email Address"
              error={errors.email?.message}
              leftIcon={MailIcon}
            />

            {/* Password Field */}
            <Input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              label="Password"
              error={errors.password?.message}
              leftIcon={LockIcon}
            />

            {/* Captcha */}
            {needsCaptcha && (
              <Card tone="info" padding="sm">
                <Checkbox
                  checked={captchaOK}
                  onChange={(e) => {
                    setCaptchaOK(e.currentTarget.checked);
                    if (e.currentTarget.checked) setCaptchaErr("");
                  }}
                  label="I'm not a robot"
                  error={captchaErr}
                />
              </Card>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="danger">
                {(error as any)?.message || "Login failed"}
              </Alert>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <Checkbox label="Remember me" size="sm" />
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold transition-colors hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isDisabled}
              loading={isPending}
              loadingText="Logging in..."
              size="lg"
              fullWidth
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <Divider className="my-6" />

          {/* Register Link */}
          <p className="text-center text-sm text-gray-700 dark:text-gray-300 font-medium">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold transition-colors hover:underline"
            >
              Create Account
            </Link>
          </p>
        </Card>

        {/* Security Badge */}
        <div className="flex justify-center">
          <Badge variant="success" size="md" icon={ShieldIcon}>
            Secured with 256-bit encryption
          </Badge>
        </div>

        {/* Verification Card */}
        <Card hoverable padding="md">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Didn't receive verification email?
            </p>
            <Link
              to="/resend-verification"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold transition-colors whitespace-nowrap hover:underline"
            >
              Resend →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
