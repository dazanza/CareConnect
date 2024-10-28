'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Plus, Receipt, CreditCard, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from "react-hot-toast"
import { useSupabase } from '@/app/hooks/useSupabase'
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"

interface Bill {
  id: string
  date: string
  amount: number
  description: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  insurance_claim_id?: string
  payment_method?: string
  payment_date?: string
  patient_id: string
  service_id: string
  service: {
    name: string
    code: string
  }
}

interface BillingManagerProps {
  patientId: string
  initialBills?: Bill[]
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

export function BillingManager({
  patientId,
  initialBills = []
}: BillingManagerProps) {
  const { supabase } = useSupabase()
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [showAddBill, setShowAddBill] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [newBill, setNewBill] = useState({
    amount: '',
    description: '',
    service_id: '',
    insurance_claim_id: '',
    status: 'pending' as const
  })
  const [paymentDetails, setPaymentDetails] = useState({
    method: '',
    amount: '',
    reference: ''
  })

  const handleAddBill = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('bills')
        .insert({
          ...newBill,
          patient_id: patientId,
          amount: parseFloat(newBill.amount),
          date: new Date().toISOString()
        })
        .select('*, service:services(name, code)')
        .single()

      if (error) throw error

      setBills([data, ...bills])
      setShowAddBill(false)
      toast.success('Bill added successfully')
    } catch (error) {
      console.error('Error adding bill:', error)
      toast.error('Failed to add bill')
    }
  }

  const handlePayment = async () => {
    if (!supabase || !selectedBill) return

    try {
      const { error } = await supabase
        .from('bills')
        .update({
          status: 'paid',
          payment_method: paymentDetails.method,
          payment_date: new Date().toISOString()
        })
        .eq('id', selectedBill.id)

      if (error) throw error

      setBills(bills.map(bill =>
        bill.id === selectedBill.id
          ? {
              ...bill,
              status: 'paid',
              payment_method: paymentDetails.method,
              payment_date: new Date().toISOString()
            }
          : bill
      ))
      setShowPayment(false)
      setSelectedBill(null)
      toast.success('Payment recorded successfully')
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('Failed to record payment')
    }
  }

  const getTotalAmount = () => {
    return bills.reduce((total, bill) => total + bill.amount, 0).toFixed(2)
  }

  const getPendingAmount = () => {
    return bills
      .filter(bill => bill.status === 'pending' || bill.status === 'overdue')
      .reduce((total, bill) => total + bill.amount, 0)
      .toFixed(2)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Billing & Payments</CardTitle>
        <Button onClick={() => setShowAddBill(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Total Billed</p>
            <p className="text-2xl font-bold">${getTotalAmount()}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Pending Amount</p>
            <p className="text-2xl font-bold">${getPendingAmount()}</p>
          </div>
        </div>

        <div className="space-y-4">
          {bills.length === 0 ? (
            <p className="text-muted-foreground">No bills recorded.</p>
          ) : (
            bills.map((bill) => (
              <div
                key={bill.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">${bill.amount.toFixed(2)}</h3>
                      <p className="text-sm text-muted-foreground">
                        Service: {bill.service.name} ({bill.service.code})
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={statusColors[bill.status]}>
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{bill.description}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 mr-1" />
                  Date: {format(new Date(bill.date), 'MMM d, yyyy')}
                </div>
                {bill.insurance_claim_id && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Insurance Claim: {bill.insurance_claim_id}
                  </div>
                )}
                {bill.payment_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Paid on {format(new Date(bill.payment_date), 'MMM d, yyyy')} via {bill.payment_method}
                  </div>
                )}
                {bill.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSelectedBill(bill)
                      setShowPayment(true)
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={showAddBill} onOpenChange={setShowAddBill}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="0.01"
                value={newBill.amount}
                onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newBill.description}
                onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
                placeholder="Enter bill description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Service</label>
              <Select
                value={newBill.service_id}
                onValueChange={(value) => setNewBill({ ...newBill, service_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {/* Add service options here */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Insurance Claim ID</label>
              <Input
                value={newBill.insurance_claim_id}
                onChange={(e) => setNewBill({ ...newBill, insurance_claim_id: e.target.value })}
                placeholder="Enter insurance claim ID (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBill(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBill}>
              Add Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select
                value={paymentDetails.method}
                onValueChange={(value) => setPaymentDetails({ ...paymentDetails, method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="0.01"
                value={paymentDetails.amount}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
                placeholder="Enter payment amount"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reference</label>
              <Input
                value={paymentDetails.reference}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, reference: e.target.value })}
                placeholder="Enter payment reference"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPayment(false)
              setSelectedBill(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handlePayment}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
