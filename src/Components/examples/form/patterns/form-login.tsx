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
import type { TLoginRequest, TLoginResponse, TAuthError } from "@/Type/Users";
import httpsRequest from "@/utils/httpsRequest";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Facebook } from "lucide-react";

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

  async function onSubmit(values: TLoginRequest) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await httpsRequest.post<TLoginResponse>(
        "/auth/login",
        values
      );
      const data = response.data;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: TAuthError } };
      const errorData: TAuthError = axiosError.response?.data || {
        message: "An error occurred. Please try again.",
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
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-bold cursor-pointer bg-(--primary-foreground) hover:bg-(--primary-hover)"
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
              className="flex w-full items-center justify-center gap-2 rounded-md bg-transparent px-4 py-2 text-xl font-bold text-primary hover:bg-accent cursor-pointer"
            >
              <Facebook className="h-5 w-5 text-(--primary-blues)" />
              <span className="text-(--primary-blues)">
                Log in with Facebook
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
            className="font-semibold text-(--primary) hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Example;
