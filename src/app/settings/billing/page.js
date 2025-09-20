'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CreditCard, ArrowLeft, CheckCircle, XCircle, Download, Calendar, Users, Zap, Crown } from 'lucide-react'

export default function BillingSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [billingData, setBillingData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState('pro')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      fetchBillingData()
    }
  }, [user, loading, router])

  const fetchBillingData = async () => {
    try {
      setIsLoading(true)
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock billing data
      const mockBillingData = {
        currentPlan: 'pro',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage: {
          meetingsThisMonth: 45,
          transcriptionMinutes: 2340,
          storageUsed: '2.3 GB',
          apiCalls: 1250
        },
        billingHistory: [
          {
            id: '1',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            amount: 29.99,
            status: 'paid',
            description: 'Pro Plan - Monthly'
          },
          {
            id: '2',
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            amount: 29.99,
            status: 'paid',
            description: 'Pro Plan - Monthly'
          },
          {
            id: '3',
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            amount: 29.99,
            status: 'paid',
            description: 'Pro Plan - Monthly'
          }
        ],
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: '12',
          expiryYear: '2025'
        }
      }
      
      setBillingData(mockBillingData)
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 meetings per month',
        '2 hours transcription',
        'Basic support',
        'Standard accuracy'
      ],
      limitations: [
        'Limited storage',
        'No API access',
        'Basic integrations'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29.99,
      period: 'month',
      description: 'For individuals and small teams',
      features: [
        'Unlimited meetings',
        'Unlimited transcription',
        'Priority support',
        'High accuracy (99%+)',
        'API access',
        'Advanced integrations',
        'Custom webhooks'
      ],
      limitations: [],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      period: 'month',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom deployment',
        'SSO integration',
        'Advanced analytics',
        'Team management',
        'Custom integrations'
      ],
      limitations: [],
      popular: false
    }
  ]

  const handlePlanChange = async (planId) => {
    try {
      // Simulate plan change
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setBillingData(prev => ({
        ...prev,
        currentPlan: planId,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }))
      
      console.log('Plan changed to:', planId)
    } catch (error) {
      console.error('Error changing plan:', error)
    }
  }

  const handleDownloadInvoice = (invoiceId) => {
    // Simulate invoice download
    console.log('Downloading invoice:', invoiceId)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCardBrandIcon = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      default:
        return '💳'
    }
  }

  if (loading || isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-white text-lg">Loading billing information...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-black text-white">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.back()}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Billing</h1>
                <p className="text-zinc-400 text-sm mt-1">Manage your subscription and payment methods</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Plan & Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Current Plan
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Plan:</span>
                    <span className="text-sm font-medium text-white">
                      {plans.find(p => p.id === billingData.currentPlan)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Status:</span>
                    <span className="text-sm text-green-400 capitalize">{billingData.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Next billing:</span>
                    <span className="text-sm text-zinc-400">{formatDate(billingData.nextBillingDate)}</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Usage This Month
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Meetings:</span>
                    <span className="text-sm text-white">{billingData.usage.meetingsThisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Transcription:</span>
                    <span className="text-sm text-white">{billingData.usage.transcriptionMinutes} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Storage:</span>
                    <span className="text-sm text-white">{billingData.usage.storageUsed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">API Calls:</span>
                    <span className="text-sm text-white">{billingData.usage.apiCalls}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Available Plans */}
            <Card className="bg-zinc-900 border-zinc-800 p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-6">Available Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-lg border-2 transition-colors ${
                      plan.popular 
                        ? 'border-blue-500 bg-blue-500/5' 
                        : billingData.currentPlan === plan.id
                        ? 'border-green-500 bg-green-500/5'
                        : 'border-zinc-700 bg-zinc-800'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                      <div className="text-3xl font-bold text-white mb-1">
                        ${plan.price}
                        <span className="text-sm text-zinc-400">/{plan.period}</span>
                      </div>
                      <p className="text-sm text-zinc-400">{plan.description}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <h5 className="text-sm font-medium text-zinc-300">Features:</h5>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-zinc-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          {feature}
                        </div>
                      ))}
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-zinc-400">
                          <XCircle className="h-4 w-4 text-red-400" />
                          {limitation}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={billingData.currentPlan === plan.id}
                      className={`w-full ${
                        billingData.currentPlan === plan.id
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                      }`}
                    >
                      {billingData.currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="bg-zinc-900 border-zinc-800 p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCardBrandIcon(billingData.paymentMethod.brand)}</span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {billingData.paymentMethod.brand.toUpperCase()} •••• {billingData.paymentMethod.last4}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Expires {billingData.paymentMethod.expiryMonth}/{billingData.paymentMethod.expiryYear}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Update
                </Button>
              </div>
            </Card>

            {/* Billing History */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </h3>
              <div className="space-y-3">
                {billingData.billingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-zinc-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{invoice.description}</p>
                        <p className="text-xs text-zinc-400">{formatDate(invoice.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">${invoice.amount}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'text-green-400 bg-green-400/10' 
                          : 'text-red-400 bg-red-400/10'
                      }`}>
                        {invoice.status}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
