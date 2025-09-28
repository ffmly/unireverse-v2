"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(username, password)
      // Redirect will happen in the Home component based on user role
    } catch (err) {
      console.log("Login error:", err)
      setError(t("login.form.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError(t("register.form.passwordMismatch"))
      setIsLoading(false)
      return
    }

    try {
      await register(email, password, fullName, studentId)
      // Redirect will happen in the Home component
    } catch (err) {
      console.log("Registration error:", err)
      setError(t("register.form.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setUsername("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setFullName("")
    setStudentId("")
    setError("")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {isLogin ? t("login.form.title") : t("register.form.title")}
        </CardTitle>
        <CardDescription className="text-center">
          {isLogin ? t("login.form.description") : t("register.form.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={isLogin ? "login" : "register"} onValueChange={(value) => {
          setIsLogin(value === "login")
          resetForm()
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("login.form.title")}</TabsTrigger>
            <TabsTrigger value="register">{t("register.form.title")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">{t("login.form.username")}</Label>
                <Input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder={t("login.form.username")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t("login.form.password")}</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t("login.form.password")}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    {t("login.form.loading")}
                  </div>
                ) : (
                  t("login.form.submit")
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-fullName">{t("register.form.fullName")}</Label>
                <Input
                  id="register-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder={t("register.form.fullName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-studentId">{t("register.form.studentId")}</Label>
                <Input
                  id="register-studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  placeholder={t("register.form.studentId")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">{t("register.form.email")}</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t("register.form.email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">{t("register.form.password")}</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t("register.form.password")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirmPassword">{t("register.form.confirmPassword")}</Label>
                <Input
                  id="register-confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={t("register.form.confirmPassword")}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    {t("register.form.loading")}
                  </div>
                ) : (
                  t("register.form.submit")
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
