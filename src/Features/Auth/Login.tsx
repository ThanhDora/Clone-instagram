import { Navigate } from "react-router-dom";
import FormPattern1 from "@/Components/examples/form/patterns/form-login";
import Footer from "@/Components/Footer";

export default function Login() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background p-4">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <FormPattern1 />
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
