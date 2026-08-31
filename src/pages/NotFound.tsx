import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-neo-yellow border-2 border-foreground flex items-center justify-center">
            <Leaf className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-6xl font-black mb-4">404</h1>
        <p className="text-lg font-bold mb-2">Page Not Found</p>
        <p className="text-sm text-muted-foreground mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="neo-btn bg-foreground text-background font-bold px-6 py-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
