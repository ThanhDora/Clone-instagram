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
import type {
  TLoginRequest,
  TLoginResponse,
  TAuthError,
  TUser,
} from "@/Type/Users";
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
        "/api/auth/login",
        values
      );

      // Kiểm tra response structure
      if (!response.data) {
        console.error("No response data");
        setError("No response from server. Please try again.");
        return;
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
        setError("Invalid response structure from server. Please try again.");
        return;
      }

      // Clear tất cả dữ liệu cũ trước khi lưu dữ liệu mới
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      // Lưu dữ liệu mới
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("token", accessToken);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Reset form và đóng dialog
      form.reset();
      if (onOpenChange) {
        onOpenChange(false);
      }

      // Navigate và reload để cập nhật state
      navigate("/", { replace: true });
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err: unknown) {
      console.error("Login error:", err);
      const axiosError = err as {
        response?: {
          status?: number;
          data?: TAuthError | { message?: string };
        };
        message?: string;
      };

      // Extract error message from different possible structures
      let errorMessage = "An error occurred. Please try again.";

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (typeof errorData === "object" && "message" in errorData) {
          errorMessage = errorData.message || errorMessage;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      // Handle specific HTTP status codes
      if (axiosError.response?.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (axiosError.response?.status === 400) {
        errorMessage = "Invalid request. Please check your input.";
      } else if (axiosError.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      setError(errorMessage);
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
