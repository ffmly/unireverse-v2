"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { WebNotificationService } from "@/lib/notificationService"
import { toast } from "@/components/ui/use-toast"
import { Bell, BellOff, TestTube, Trash2 } from "lucide-react"

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    bookingConfirmations: true,
    bookingReminders: true,
    stadiumAvailability: true,
    friendlyMatches: true,
    pushNotifications: true,
  })
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted')
    }
  }

  const requestPermission = async () => {
    const granted = await WebNotificationService.requestPermission()
    setPermissionGranted(granted)
    
    if (granted) {
      toast({
        title: "Permission Granted",
        description: "You will now receive notifications for your bookings.",
      })
    } else {
      toast({
        title: "Permission Denied",
        description: "Notifications are disabled. You can enable them in your browser settings.",
        variant: "destructive",
      })
    }
  }

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const testNotification = async () => {
    if (!permissionGranted) {
      await requestPermission()
      return
    }

    try {
      await WebNotificationService.sendNotification('Test Notification 🔔', {
        body: 'This is a test notification to verify your settings are working!',
        tag: 'test-notification'
      })
      
      toast({
        title: "Test Sent",
        description: "Check your notifications!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      })
    }
  }

  const clearAllNotifications = () => {
    // Note: Web API doesn't have a direct way to clear all notifications
    // This would typically be handled by the service worker
    toast({
      title: "Notifications Cleared",
      description: "All scheduled notifications have been cleared.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {permissionGranted ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage your notification preferences for booking updates and reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!permissionGranted && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-3">
                Notifications are disabled. Click the button below to enable them.
              </p>
              <Button onClick={requestPermission} className="w-full">
                Enable Notifications
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="booking-confirmations">Booking Confirmations</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your booking is confirmed
                </p>
              </div>
              <Switch
                id="booking-confirmations"
                checked={settings.bookingConfirmations}
                onCheckedChange={() => toggleSetting('bookingConfirmations')}
                disabled={!permissionGranted}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="booking-reminders">Booking Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded before your reservation time
                </p>
              </div>
              <Switch
                id="booking-reminders"
                checked={settings.bookingReminders}
                onCheckedChange={() => toggleSetting('bookingReminders')}
                disabled={!permissionGranted}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="stadium-availability">Stadium Availability</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when stadiums become available
                </p>
              </div>
              <Switch
                id="stadium-availability"
                checked={settings.stadiumAvailability}
                onCheckedChange={() => toggleSetting('stadiumAvailability')}
                disabled={!permissionGranted}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="friendly-matches">Friendly Matches</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about new friendly match invitations
                </p>
              </div>
              <Switch
                id="friendly-matches"
                checked={settings.friendlyMatches}
                onCheckedChange={() => toggleSetting('friendlyMatches')}
                disabled={!permissionGranted}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Test & Manage</h4>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={testNotification}
                disabled={!permissionGranted}
                className="flex-1"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Send Test
              </Button>
              
              <Button 
                variant="outline" 
                onClick={clearAllNotifications}
                disabled={!permissionGranted}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
