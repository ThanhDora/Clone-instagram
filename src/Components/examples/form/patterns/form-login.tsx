"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/Components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import { PasswordInput } from "@/Components/ui/password-input";
import type {
  TLoginRequest,
  TLoginResponse,
  TAuthError,
  TUser,
} from "@/Type/Users";
import httpsRequest from "@/utils/httpsRequest";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

export const title = "Login Form";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const Example = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TLoginRequest>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const baseURL =
        import.meta.env.VITE_BASE_URL;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const googleAuthUrl = `${baseURL}/api/auth/google?redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;
      window.location.href = googleAuthUrl;
    } catch (err: unknown) {
      console.error("Google login error:", err);
      setError("Failed to initiate Google login. Please try again.");
      setIsLoading(false);
    }
  };

  async function onSubmit(values: TLoginRequest) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await httpsRequest.post<TLoginResponse>(
        "/api/auth/login",
        values
      );

      // Kiểm tra response structure
      if (!response.data) {
        console.error("No response data");
        throw new Error("No response from server");
      }

      // Kiểm tra success flag
      if (response.data.success === false) {
        const errorMsg = response.data.message || "Login failed";
        console.error("Login failed:", errorMsg);
        setError(errorMsg);
        return;
      }

      // Thử nhiều cách để lấy data
      const responseData = response.data;
      const data = responseData.data;
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      let user: TUser | undefined;

      // Case 1: Standard structure { success, message, data: { accessToken, refreshToken, user } }
      if (data && typeof data === "object" && "accessToken" in data) {
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
        user = data.user;
      }
      // Case 2: Direct structure { success, message, accessToken, refreshToken, user }
      else if ("accessToken" in responseData) {
        const directData = responseData as unknown as {
          accessToken?: string;
          refreshToken?: string;
          user?: TUser;
        };
        accessToken = directData.accessToken;
        refreshToken = directData.refreshToken;
        user = directData.user;
      }
      // Case 3: Nested in data but different structure (e.g., data.tokens.accessToken)
      else if (data && typeof data === "object") {
        const altData = data as Record<string, unknown>;

        // Try to get from tokens object
        if (altData.tokens && typeof altData.tokens === "object") {
          const tokens = altData.tokens as Record<string, unknown>;
          accessToken = (tokens.accessToken ||
            tokens.access_token ||
            tokens.token) as string | undefined;
          refreshToken = (tokens.refreshToken || tokens.refresh_token) as
            | string
            | undefined;
        }

        // Try alternative field names directly in data
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
        console.error("No accessToken found in any structure:", {
          responseData: response.data,
          data: data,
          allKeys: Object.keys(response.data || {}),
        });
        throw new Error("Invalid response structure: no accessToken found");
      }

      // Lưu token
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refresh_token", refreshToken || "");

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/");
    } catch (err: unknown) {
      console.error("Login error:", err);
      const axiosError = err as {
        response?: {
          status?: number;
          data?: TAuthError;
        };
        message?: string;
      };

      // Log chi tiết lỗi
      if (axiosError.response) {
        console.error("Error response:", {
          status: axiosError.response.status,
          data: axiosError.response.data,
        });
      }

      const errorData: TAuthError = axiosError.response?.data || {
        message: axiosError.message || "An error occurred. Please try again.",
      };
      setError(errorData.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <h1 className="instagram-logo mb-8 text-center text-4xl text-foreground">
              Instagram
            </h1>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="bg-input/30 text-foreground placeholder:text-muted-foreground"
                      placeholder="Phone number, username, or email"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      className="bg-input/30 text-foreground placeholder:text-muted-foreground"
                      placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              className="w-full bg-blue-500 text-primary-foreground hover:bg-blue-600 text-base font-bold cursor-pointer  hover:bg-primary-hover"
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">OR</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-transparent px-4 py-2 text-xl font-bold text-primary hover:bg-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400">
                {isLoading ? "Redirecting..." : "Log in with Google"}
              </span>
            </button>
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-xs text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </Form>
      </div>
      <div className="mt-4 w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <p className="text-center text-sm text-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-300 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Example;
