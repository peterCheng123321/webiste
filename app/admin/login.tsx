"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Terminal, Lock, Info, ArrowRight } from "lucide-react"

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "123456") {
      localStorage.setItem("admin-authenticated", "true")
      onLogin()
    } else {
      setError(true)
      setTimeout(() => setError(false), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background noise-bg p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="matrix-bg"></div>
      </div>

      <Card className="w-full max-w-md glass-card border-primary/20 shadow-code">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div className="flex-1 h-6 ml-2 bg-midnight-900/20 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-mono">admin-login.sh</span>
            </div>
          </div>
          <CardTitle className="text-xl font-mono flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="text-gradient">Admin Authentication</span>
          </CardTitle>
          <CardDescription className="font-mono">Enter your password to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-mono flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono bg-midnight-950/10 border-primary/20"
                    placeholder="Enter password"
                    autoComplete="off"
                  />
                  <div
                    className="absolute right-3 top-2.5 text-muted-foreground cursor-pointer"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Info className="h-4 w-4" />
                  </div>
                </div>
                {showHint && (
                  <p className="text-xs text-muted-foreground font-mono bg-midnight-950/10 p-2 rounded border border-primary/10">
                    Hint: The sequence 1-6
                  </p>
                )}
              </div>
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="font-mono text-sm">
                    Authentication failed. Invalid password.
                  </AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full font-mono shadow-code">
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="font-mono text-xs text-muted-foreground border-t border-primary/10 mt-4 pt-4">
          <div className="flex items-center gap-2 w-full">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <code className="typing-animation">System ready. Awaiting authentication...</code>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
