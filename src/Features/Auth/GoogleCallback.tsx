import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import httpsRequest from "@/utils/httpsRequest";
import type { TLoginResponse, TUser, TAuthError } from "@/Type/Users";
import Loading from "@/Components/Loading";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Google authentication was cancelled or failed.");
        setIsLoading(false);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received from Google.");
        setIsLoading(false);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
        return;
      }

      try {
        const response = await httpsRequest.post<TLoginResponse>(
          "/api/auth/google/callback",
          { code }
        );

        if (!response.data) {
          throw new Error("No response from server");
        }

        if (response.data.success === false) {
          const errorMsg =
            response.data.message || "Google authentication failed";
          setError(errorMsg);
          setIsLoading(false);
          setTimeout(() => {
            navigate("/login");
          }, 3000);
          return;
        }

        const responseData = response.data;
        const data = responseData.data;
        let accessToken: string | undefined;
        let refreshToken: string | undefined;
        let user: TUser | undefined;

        if (data && typeof data === "object" && "accessToken" in data) {
          accessToken = data.accessToken;
          refreshToken = data.refreshToken;
          user = data.user;
        } else if ("accessToken" in responseData) {
          const directData = responseData as unknown as {
            accessToken?: string;
            refreshToken?: string;
            user?: TUser;
          };
          accessToken = directData.accessToken;
          refreshToken = directData.refreshToken;
          user = directData.user;
        } else if (data && typeof data === "object") {
          const altData = data as Record<string, unknown>;

          if (altData.tokens && typeof altData.tokens === "object") {
            const tokens = altData.tokens as Record<string, unknown>;
            accessToken = (tokens.accessToken ||
              tokens.access_token ||
              tokens.token) as string | undefined;
            refreshToken = (tokens.refreshToken || tokens.refresh_token) as
              | string
              | undefined;
          }

          if (!accessToken) {
            accessToken = (altData.accessToken ||
              altData.access_token ||
              altData.token) as string | undefined;
            refreshToken = (altData.refreshToken || altData.refresh_token) as
              | string
              | undefined;
          }

          user = altData.user as TUser | undefined;
        }

        if (!accessToken) {
          throw new Error("Invalid response structure: no accessToken found");
        }

        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        localStorage.setItem("token", accessToken);
        localStorage.setItem("access_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        navigate("/", { replace: true });
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (err: unknown) {
        console.error("Google callback error:", err);
        const axiosError = err as {
          response?: {
            status?: number;
            data?: TAuthError;
          };
          message?: string;
        };

        const errorData: TAuthError = axiosError.response?.data || {
          message: axiosError.message || "An error occurred. Please try again.",
        };
        setError(errorData.message || "Google authentication failed");
        setIsLoading(false);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-muted-foreground">
            Completing Google authentication...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
