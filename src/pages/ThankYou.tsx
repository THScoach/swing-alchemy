import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, Calendar, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const [smsSent, setSmsSent] = useState(false);

  const sessionId = searchParams.get("session_id");
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    if (!sessionId || !transactionId) {
      navigate("/");
      return;
    }

    processPaymentSuccess();
  }, [sessionId, transactionId]);

  const processPaymentSuccess = async () => {
    try {
      console.log("Processing payment success:", { sessionId, transactionId });

      // Fetch transaction details
      const { data: txn, error: txnError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (txnError) {
        console.error("Transaction fetch error:", txnError);
        throw txnError;
      }

      setTransaction(txn);

      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ 
          payment_status: "completed",
          stripe_payment_intent_id: sessionId 
        })
        .eq("id", transactionId);

      if (updateError) {
        console.error("Transaction update error:", updateError);
      }

      // Send confirmation SMS
      if (txn.customer_phone && !smsSent) {
        try {
          const { data: smsData, error: smsError } = await supabase.functions.invoke("send-booking-sms", {
            body: {
              transactionId: txn.id,
              recipientPhone: txn.customer_phone,
              recipientEmail: txn.customer_email,
              playerName: txn.customer_name,
              sessionType: txn.session_type,
              scheduledDate: txn.scheduled_date,
              messageType: "confirmation",
            },
          });

          if (smsError) {
            console.error("SMS error:", smsError);
            toast.error("Payment confirmed, but SMS notification failed");
          } else {
            console.log("SMS sent:", smsData);
            setSmsSent(true);
            toast.success("Payment confirmed! Check your phone for details.");
          }
        } catch (smsError) {
          console.error("SMS send error:", smsError);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("There was an issue processing your payment");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for booking with The Hitting Skool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {transaction && (
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-lg">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session Type:</span>
                    <span className="font-medium">{transaction.session_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">{transaction.plan_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-medium text-primary">${transaction.amount}</span>
                  </div>
                  {transaction.scheduled_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scheduled:</span>
                      <span className="font-medium">
                        {new Date(transaction.scheduled_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmation Email:</span>
                    <span className="font-medium">{transaction.customer_email}</span>
                  </div>
                  {smsSent && (
                    <div className="flex justify-between text-green-600">
                      <span>SMS Confirmation:</span>
                      <span className="font-medium">✓ Sent</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Check Your Email</p>
                    <p className="text-sm text-muted-foreground">
                      A confirmation email has been sent to {transaction?.customer_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Upload Your Video</p>
                    <p className="text-sm text-muted-foreground">
                      Get ready for your session by uploading swing footage
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Prepare Your Equipment</p>
                    <p className="text-sm text-muted-foreground">
                      Make sure you have everything ready for your session
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate("/analyze")} className="flex-1 gap-2">
                <Upload className="h-4 w-4" />
                Upload Video
              </Button>
              <Button onClick={() => navigate("/calendar")} variant="outline" className="flex-1 gap-2">
                <Calendar className="h-4 w-4" />
                View Calendar
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground pt-4">
              Questions? Contact us at support@thehittingskool.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
