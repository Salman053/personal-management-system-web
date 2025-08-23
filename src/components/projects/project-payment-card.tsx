import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectPayment } from "@/types";

// Define the color constants
// const COLORS = ["#22c55e", "#3b82f6", "#ef4444"];
export default function PaymentStatusCard({
  paymentData,
  onAddPaymentClick,
  onHistoryClick,
  projectPayments,
}: {
  paymentData: any;
  onAddPaymentClick: () => void;
  onHistoryClick: () => void;
  projectPayments: ProjectPayment[];
}) {
  // console.log(pa)
  const remainingAmount =
    Number(paymentData.totalAmount) -
    (Number(paymentData.advanceAmount) +
      projectPayments.reduce((sum, p) => p.amount + sum, 0));

  const data = [
    { name: "Total", value: paymentData.totalAmount },
    { name: "Paid", value: paymentData.advanceAmount },
    { name: "Remaining", value: remainingAmount },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={onHistoryClick}
              variant={"ghost"}
              className="flex items-center w-fit text-sm"
            >
              History
            </Button>
            <Button
              onClick={onAddPaymentClick}
              className="flex items-center w-fit text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="">
          {/* Stats Section */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-medium text-blue-500">
                Rs. {paymentData.totalAmount?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid Amount:</span>
              <span className="font-medium text-green-600 ">
                Rs. {paymentData.advanceAmount?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining Amount:</span>
              <span className="font-medium text-destructive">
                Rs. {remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Chart Section */}
          {/* <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                contentStyle={{
                  fontSize:8,
                  paddingTop:0,
                  paddingBottom:0,
                  animationDelay:"revert-layer",
                  borderRadius:10
                }}
                
                  formatter={(value: number) => `Rs. ${value.toLocaleString()}`}
                />
                <Legend fontSize={5} />
              </PieChart>
            </ResponsiveContainer>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}

{
  /* <Progress value={paymentProgress} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  {paymentProgress.toFixed(1)}% paid
                </div> */
}
