import { Navigate } from "react-router-dom";
import FormSignup from "@/Components/examples/form/patterns/form-signup";
import Footer from "@/Components/Footer";

export default function Register() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background p-4">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <FormSignup />
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
