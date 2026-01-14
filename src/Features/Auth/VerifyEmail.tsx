import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import httpsRequest from "@/utils/httpsRequest";
import type { TVerifyEmailResponse, TAuthError } from "@/Type/Users";
import { Button } from "@/Components/ui/button";
import Footer from "@/Components/Footer";
import { Input } from "@/Components/ui/input";

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const verifyEmail = useCallback(
    async (verificationToken: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await httpsRequest.post<TVerifyEmailResponse>(
          `/api/auth/verify-email/${verificationToken}`
        );

        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: TAuthError } };
        const errorData: TAuthError = axiosError.response?.data || {
          message: "An error occurred. Please try again.",
        };
        setError(errorData.message || "Email verification failed");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setError("Verification token is missing");
    }
  }, [token, verifyEmail]);

  const resendVerificationEmail = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      await httpsRequest.post("/api/auth/resend-verification-email", {
        email,
      });

      setSuccess(true);
      setError(null);
      // Show success message
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: TAuthError } };
      const errorData: TAuthError = axiosError.response?.data || {
        message: "An error occurred. Please try again.",
      };
      setError(errorData.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-4">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
            <h1 className="instagram-logo mb-6 text-center text-4xl text-foreground">
              Instagram
            </h1>

            {isLoading && (
              <div className="text-center">
                <p className="text-muted-foreground">Verifying your email...</p>
              </div>
            )}

            {success && !isLoading && (
              <div className="space-y-4">
                <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                  Email verified successfully! Redirecting to login...
                </div>
                <Button className="w-full" onClick={() => navigate("/login")}>
                  Go to Login
                </Button>
              </div>
            )}

            {error && !isLoading && !success && (
              <div className="space-y-4">
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Enter your email address to resend
                    the verification email.
                  </p>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input/30 text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    className="w-full"
                    onClick={resendVerificationEmail}
                    disabled={isResending}
                  >
                    {isResending ? "Sending..." : "Resend Verification Email"}
                  </Button>
                </div>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-blue-300 hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {!isLoading && !error && !success && (
              <div className="text-center">
                <p className="text-muted-foreground">
                  Processing verification...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
