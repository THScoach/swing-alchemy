import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";

export default function AdminSubscriptions() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      navigate("/feed");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/admin")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
            <p className="text-muted-foreground">Monitor revenue and subscription metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total MRR</p>
                  <p className="text-3xl font-bold">$0</p>
                </div>
                <DollarSign className="h-12 w-12 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">New MRR (Month)</p>
                  <p className="text-3xl font-bold">$0</p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Churned MRR</p>
                  <p className="text-3xl font-bold">$0</p>
                </div>
                <TrendingDown className="h-12 w-12 text-red-500" />
              </div>
            </Card>
          </div>

          <Card className="p-12 text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No subscriptions yet</h2>
            <p className="text-muted-foreground">
              Subscription data will appear here once users upgrade
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
