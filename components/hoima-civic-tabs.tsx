"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MapPin,
  Users,
  Target,
  Heart,
  Building,
  GraduationCap,
  Stethoscope,
  Zap,
  Droplets,
  UserPlus,
  Phone,
  Mail,
  MapIcon,
  ChevronDown,
  ChevronUp,
  Book,
} from "lucide-react"
import { Parish, Promise } from "@prisma/client"
import NewMemberForm from "./Forms/newMemberForm"


export function HoimaCivicTabs({parishes,parishOptions,villageOptions,promises,villages}: {parishes: Parish[],villages:any,parishOptions:any,villageOptions:any, promises: Promise[]}) {

  const [activeTab, setActiveTab] = useState("parishes")
  const [expandedParish, setExpandedParish] = useState<string | null>(null)
  const [registrationData, setRegistrationData] = useState({
    fullName: "",
    phone: "",
    email: "",
    parish: "",
    village: "",
    motivation: "",
  })

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registration submitted:", registrationData)
    alert("Thank you for joining our movement! We will contact you soon.")
    setRegistrationData({
      fullName: "",
      phone: "",
      email: "",
      parish: "",
      village: "",
      motivation: "",
    })
  }

  const getVillagesForParish = (parishId: string) => {
    return villages.filter((village:any) => village.parishId === parishId)
  }

  const toggleParishExpansion = (parishName: string) => {
    setExpandedParish(expandedParish === parishName ? null : parishName)
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-card">
          <TabsTrigger
            value="parishes"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 animate-fade-in"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Parishes
          </TabsTrigger>
          <TabsTrigger
            value="manifesto"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 animate-fade-in"
          >
            <Heart className="w-4 h-4 mr-2" />
            Manifesto
          </TabsTrigger>
          <TabsTrigger
            value="join"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 animate-fade-in"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Join Our Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parishes" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parishes.map((parish, index) => (
              <Card
                key={parish.name}
                className="hover:shadow-lg transition-all duration-300 animate-slide-up border-l-4 border-l-primary"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-5 h-5 text-primary" />
                    {parish.name}
                  </CardTitle>
                  <CardDescription>{parish.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Population: {parish.population}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => toggleParishExpansion(parish.name)}
                    className="w-full bg-yellow-500 hover:bg-accent/90 text-accent-foreground"
                  >
                    {expandedParish === parish.name ? (
                      <ChevronUp className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    )}
                    {expandedParish === parish.id ? "Hide" : "Show"} Villages (
                    {getVillagesForParish(parish.id).length})
                  </Button>

                  {expandedParish === parish.name && (
                   
                    <div className="mt-4 space-y-2 animate-fade-in">
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm text-foreground mb-3">Villages in {parish.name}:</h4>
                        <div className="space-y-2">
                          {getVillagesForParish(parish.id).map((village:any, villageIndex:any) => (
                            <div
                              key={village.id}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded-md animate-slide-up"
                              style={{ animationDelay: `${villageIndex * 50}ms` }}
                            >
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-accent" />
                                <span className="text-sm font-medium text-foreground">{village.name}</span>
                              </div>
                              <Badge variant="outline" className="border-accent text-black text-xs">
                                {village.houseHolds} Households
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manifesto" className="animate-fade-in">
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">My Commitment to Hoima City West</h2>
              <p className="text-lg text-muted-foreground text-pretty max-w-3xl mx-auto">
                Together, we will transform our constituency into a model of development, prosperity, and unity. These
                are my promises to you, the people of Hoima City West.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {promises.map((category, categoryIndex) => {
                const IconComponent = Book
                return (
                  <Card
                    key={category.title}
                    className="hover:shadow-lg transition-all duration-300 animate-slide-up border-l-4 border-l-accent"
                    style={{ animationDelay: `${categoryIndex * 150}ms` }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-foreground">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <IconComponent className="w-6 h-6 text-yellow-600" />
                        </div>
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {category.commitments.map((promise, promiseIndex) => (
                          <li
                            key={promiseIndex}
                            className="flex items-start gap-3 animate-fade-in"
                            style={{ animationDelay: `${categoryIndex * 150 + promiseIndex * 100}ms` }}
                          >
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-foreground text-pretty">{promise}</span>
                          </li>
                        ))}
                      </ul>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                            Learn More About {category.title}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-xl">
                              <div className="p-2 rounded-lg bg-accent/10">
                                <IconComponent className="w-6 h-6 text-yellow-600" />
                              </div>
                              {category.title} Development Plan
                            </DialogTitle>
                            <DialogDescription>
                              Understanding the importance and impact of {category.title.toLowerCase()} in our
                              community
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 mt-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Why This Matters</h4>
                              <p className="text-muted-foreground text-pretty">
                                {category.why}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Current Impact on Our Community</h4>
                              <p className="text-muted-foreground text-pretty">
                                {category.impact}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Our Solution</h4>
                              <p className="text-muted-foreground text-pretty">
                                {category.solution}
                              </p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">My Specific Commitments:</h4>
                              <ul className="space-y-2">
                                {category.commitments.map((promise, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <span className="text-sm text-foreground">{promise}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Together We Build Tomorrow</h3>
                  <p className="text-muted-foreground mb-6 text-pretty">
                    Your voice matters. Your dreams matter. Let's work hand in hand to make Hoima City West a beacon of
                    progress and prosperity for all.
                  </p>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Heart className="w-4 h-4 mr-2" />
                    Join Our Team
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="join" className="animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Join Our Movement</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Be part of the change you want to see in Hoima City West. Together, we can build a better future for our
                community and Country
              </p>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserPlus className="w-6 h-6 text-primary" />
                  </div>
                  Register to join our team
                </CardTitle>
                <CardDescription>
                  Fill out the form below to officially join our team and stay updated on our progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewMemberForm parishOptions={parishOptions} villageOptions={villageOptions}/>

                <div className="mt-8 p-4 bg-accent/5 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">What happens next?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      You'll receive regular updates on our development projects
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      Invitations to community meetings and events
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      Opportunities to volunteer and contribute to community projects
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      Direct communication channel with our leadership team
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
