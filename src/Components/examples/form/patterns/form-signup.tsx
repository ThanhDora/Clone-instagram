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
import type { TRegisterResponse, TAuthError } from "@/Type/Users";
import httpsRequest from "@/utils/httpsRequest";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

export const title = "Signup Form";

const formSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    fullName: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    username: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Example = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      username: "",
    },
  });

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const baseURL =
        import.meta.env.VITE_BASE_URL;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const googleAuthUrl = `${baseURL}/api/auth/google?redirect_uri=${encodeURIComponent(
        redirectUri
      )}&action=signup`;
      window.location.href = googleAuthUrl;
    } catch (err: unknown) {
      console.error("Google signup error:", err);
      setError("Failed to initiate Google signup. Please try again.");
      setIsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await httpsRequest.post<TRegisterResponse>(
        "/api/auth/register",
        {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          username: values.username,
        }
      );

      // Register does NOT return tokens - user must verify email first
      setSuccessMessage(
        response.data.message ||
        "User registered successfully. Please check your email to verify your account."
      );

      // Clear form
      form.reset();

      // Redirect to login after a delay or let user click to login
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: TAuthError } };
      const errorData: TAuthError = axiosError.response?.data || {
        message: "An error occurred. Please try again.",
      };
      setError(errorData.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <h1 className="instagram-logo mb-4 text-center text-4xl text-foreground">
              Instagram
            </h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Sign up to see photos and videos from your friends.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1877F2] px-4 py-2 text-base font-semibold text-white hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="h-5 w-5" />
              <span>
                {isLoading ? "Redirecting..." : "Sign up with Google"}
              </span>
            </button>

            {/* OR Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Input Fields */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="text-foreground placeholder:text-muted-foreground"
                      placeholder="Mobile Number or Email"
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
                      className="text-foreground placeholder:text-muted-foreground"
                      placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      className="text-foreground placeholder:text-muted-foreground"
                      placeholder="Confirm Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="text-foreground placeholder:text-muted-foreground"
                      placeholder="Full Name"
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="text-foreground placeholder:text-muted-foreground"
                      placeholder="Username"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information Text */}
            <p className="text-xs text-muted-foreground text-center">
              People who use our service may have uploaded your contact
              information to Instagram.{" "}
              <a href="#" className="text-primary hover:underline">
                <span className="text-(--primary) cursor-pointer">
                  Learn More
                </span>
              </a>
            </p>

            {/* Terms Text */}
            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                <span className="text-(--primary) cursor-pointer">Terms</span>
              </a>
              ,{" "}
              <a href="#" className="text-primary hover:underline">
                <span className="text-(--primary) cursor-pointer">
                  Privacy Policy
                </span>
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                <span className="text-(--primary) cursor-pointer">
                  Cookies Policy
                </span>
              </a>
              .
            </p>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </div>
            )}

            {/* Sign up Button */}
            <Button
              className="w-full bg-blue-500 text-primary-foreground hover:bg-blue-600 text-base font-semibold cursor-pointer"
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </Form>
      </div>
      <div className="mt-4 w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <p className="text-center text-sm text-foreground">
          Have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-300 hover:underline"
          >
            <span className="text-blue-300 cursor-pointer">Log in</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Example;
