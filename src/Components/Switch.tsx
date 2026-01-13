import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
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

export const title = "Signin";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

interface SwitchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const Example = ({ open, onOpenChange, trigger }: SwitchProps) => {
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
      window.location.reload();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="text-xs font-semibold text-blue-300 hover:text-blue-400 cursor-pointer hover:underline hover:opacity-100 transition-opacity border-none"
          >
            Switch
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md bg-gray-800 text-foreground">
        <DialogHeader>
          <DialogTitle className="instagram-logo mb-8 text-center text-4xl text-white">
            Instagram
          </DialogTitle>
          <DialogDescription className="sr-only">
            Sign in to your Instagram account
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="bg-muted/50 text-white placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
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
                      className="bg-muted/50 text-white placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
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
            <DialogFooter>
              <Button
                className="w-full bg-blue-500 text-primary-foreground hover:bg-blue-600 text-base font-bold cursor-pointer"
                type="submit"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? "Logging in..." : "Sign In"}
              </Button>
            </DialogFooter>
            <div className="text-center">
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-white hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default Example;
