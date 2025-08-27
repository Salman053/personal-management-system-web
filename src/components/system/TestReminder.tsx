// src/components/TestReminder.tsx
import { useAuth } from "@/contexts/auth-context";
import { ReminderPollingService } from "@/services/reminder-polling";
import { NotificationService } from "@/services/notification";
import { useState } from "react";
import { Button } from "../ui/button";

export const TestReminder = () => {
  const [isTesting, setIsTesting] = useState(false);
  const auth = useAuth();

  const testNotification = async () => {
    // Test browser notification
    NotificationService.showLocalNotification("Hello", {
      body: "This is a test notification!",
      data: { test: true },
    })
  };

  const testReminderCheck = async () => {
    if (!auth.user) return;

    setIsTesting(true);
    try {
      await ReminderPollingService.checkDueReminders(auth.user.uid).then(() => {
        console.log("hello");
      });
      //   alert("Reminder check completed!");
    } catch (error: any) {
      console.error("Test failed:", error);
      alert("Test failed: " + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <Button onClick={testNotification} style={{ marginRight: "10px" }}>
        Test Browser Notification
      </Button>
      <Button onClick={testReminderCheck} disabled={isTesting}>
        {isTesting ? "Checking..." : "Check Due Reminders"}
      </Button>
    </div>
  );
};
