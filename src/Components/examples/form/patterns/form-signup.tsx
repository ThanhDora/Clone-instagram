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
import type { TLoginResponse, TAuthError } from "@/Type/Users";
import httpsRequest from "@/utils/httpsRequest";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Facebook } from "lucide-react";

export const title = "Signup Form";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
});

const Example = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      username: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await httpsRequest.post<TLoginResponse>(
        "/auth/register",
        {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          username: values.username,
        }
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

            {/* Facebook Button - First */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1877F2] px-4 py-2 text-base font-semibold text-white hover:bg-[#166FE5] transition-colors"
            >
              <Facebook className="h-5 w-5" />
              <span>Log in with Facebook</span>
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

            {/* Sign up Button */}
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold bg-(--primary-foreground) hover:bg-(--primary-hover) cursor-pointer"
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
            className="font-semibold text-primary hover:underline"
          >
            <span className="text-(--primary) cursor-pointer">Log in</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Example;
