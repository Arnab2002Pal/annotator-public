'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import InvitationStep from "@/components/invitationStep"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Combobox from "@/components/ui/combobox"
import { domains, languages, locations } from "@/lib/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Building2, CheckCircle2, DollarSign, Clock, Database, FileSpreadsheet, Globe, MapPin, Mail } from "lucide-react"
import MultiCombobox from "@/components/ui/multi-combobox"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Option {
  value: string
  label: string
}

type Step = 'role' | 'invitation' | 'details'

export default function AuthPageComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>('role')
  const [invitationMode, setInvitationMode] = useState<'enter' | 'request'>('enter')
  const [isRequestSubmitted, setIsRequestSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    name: "",
    phone: "",
    domain: [] as string[], 
    lang: [] as string[],
    location: "",
    invitationCode: "",
  })

  const domainOptions: Option[] = domains.map(domain => ({ value: domain.toLowerCase(), label: domain }))
  const languageOptions: Option[] = languages.map(lang => ({ value: lang.toLowerCase(), label: lang }))
  const locationOptions: Option[] = locations.map(location => ({ value: location.toLowerCase(), label: location }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleRoleSelect = (selectedRole: 'annotator' | 'project manager') => {
    setFormData({ ...formData, role: selectedRole })
    setStep(selectedRole === 'project manager' ? 'invitation' : 'details')
  }

  const handleInvitationRequest = async () => {
    try {
      const res = await fetch('/api/auth/request-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      if (res.ok) {
        setIsRequestSubmitted(true)
        toast({
          title: "Request submitted",
          description: "We'll review your request and send an invitation code to your email if approved.",
        })
      } else {
        const data = await res.json()
        toast({
          variant: "destructive",
          title: "Request failed",
          description: data.error,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  const verifyInvitationCode = async () => {
    try {
      const res = await fetch('/api/auth/verify-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: formData.invitationCode }),
      })

      if (res.ok) {
        setStep('details')
      } else {
        const data = await res.json()
        toast({
          variant: "destructive",
          title: "Invalid code",
          description: data.error || "The invitation code is invalid or expired.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.role === "annotator") {
      if (formData.domain.length === 0 || formData.lang.length === 0 || formData.location === "") {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Please fill in all the fields.",
        })
        return
      }
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: formData.role === "annotator" 
        ? JSON.stringify(formData) 
        : JSON.stringify({ 
            email: formData.email, 
            password: formData.password, 
            role: formData.role, 
            name: formData.name,
            invitationCode: formData.invitationCode 
          }),
    })

    if (res.ok) {
      toast({
        title: "Account created.",
        description: "You can now log in with your new account.",
      })
      router.push('/auth/login')
    } else {
      const data = await res.json()
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data.error,
      })
    }
  }

  if (step === 'role') {
    return (
      <div className="h-screen flex justify-center items-center">
        <div>
          <h1 className="text-4xl font-bold text-left mb-8">Choose your role</h1>
          <p className="text-left mb-8 text-muted-foreground">You can&apos;t switch roles with the same account</p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:border-primary" onClick={() => handleRoleSelect('annotator')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pencil className="mr-2 h-6 w-6" />
                  Annotator
                </CardTitle>
                <CardDescription>I&apos;m ready to earn money</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Complete simple tasks and get paid
                  </li>
                  <li className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                    Earn money whenever you want
                  </li>
                  <li className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-green-500" />
                    Work on your own schedule
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary" onClick={() => handleRoleSelect('project manager')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-6 w-6" />
                  Project Manager
                </CardTitle>
                <CardDescription>I need data for my projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <Database className="mr-2 h-4 w-4 text-blue-500" />
                    Get data labeled
                  </li>
                  <li className="flex items-center">
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-500" />
                    Run surveys
                  </li>
                  <li className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-blue-500" />
                    Collect online data
                  </li>
                  <li className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                    Gather field data
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'invitation') {
    return (
      <InvitationStep
        formData={formData}
        handleChange={handleChange}
        verifyInvitationCode={verifyInvitationCode}
        handleInvitationRequest={handleInvitationRequest}
        isRequestSubmitted={isRequestSubmitted}
        invitationMode={invitationMode}
        setInvitationMode={setInvitationMode}
        onBack={() => setStep('role')}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`bg-white p-8 ${formData.role === "annotator" ? "max-w-xl" : "max-w-md"} w-full`}>
        <h2 className="text-4xl font-bold text-center mb-6">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className={`grid ${formData.role === "annotator" ? "grid-cols-2" : "grid-cols-1"} gap-6`}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Enter your email" 
              required 
              disabled={formData.role === "project manager" && invitationMode === "request" && isRequestSubmitted}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={formData.password} minLength={6} onChange={handleChange} placeholder="Enter your password" required />
          </div>
          {formData.role === "annotator" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <MultiCombobox
                  options={domainOptions}
                  value={formData.domain}
                  onChange={(value) => setFormData({ ...formData, domain: value })}
                  placeholder="Select domain"
                  allowCustom={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang">Language</Label>
                <MultiCombobox
                  options={languageOptions}
                  value={formData.lang}
                  onChange={(value) => setFormData({ ...formData, lang: value })}
                  placeholder="Select language"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Combobox
                  options={locationOptions}
                  value={formData.location}
                  onChange={(value) => setFormData({ ...formData, location: value })}
                  placeholder="Select location"
                />
              </div>
            </>
          )}
          <div className={formData.role === "annotator" ? "col-span-2" : ""}>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-sm text-gray-600 hover:underline"
            onClick={() => router.push("/auth/login")}
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  )
}