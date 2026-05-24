"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    provider: "Dr. Smith",
    clinicalNote: "Patient presents with persistent cough and fever. Diagnosed with acute bronchitis. Prescribed amoxicillin.",
    billingCode: "J0153",
    description: "Injection, amoxicillin",
    amount: "150.00"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Patient
      const patientRes = await fetch("http://localhost:8000/api/v1/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          dob: "1980-01-01"
        })
      });
      const patient = await patientRes.json();

      // 2. Create Visit
      const visitRes = await fetch("http://localhost:8000/api/v1/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          visit_date: new Date().toISOString().split('T')[0],
          provider_name: formData.provider,
          clinical_note_text: formData.clinicalNote
        })
      });
      const visit = await visitRes.json();

      // 3. Create Claim
      const claimRes = await fetch("http://localhost:8000/api/v1/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_id: visit.id,
          total_amount: parseFloat(formData.amount),
          items: [{
            billing_code: formData.billingCode,
            description: formData.description,
            billed_amount: parseFloat(formData.amount)
          }]
        })
      });
      const claim = await claimRes.json();

      // 4. Trigger Audit
      await fetch(`http://localhost:8000/api/v1/claims/${claim.id}/audit`, {
        method: "POST"
      });

      router.push("/");
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Submit New Claim for Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Provider Name</Label>
              <Input value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} required />
            </div>

            <div className="space-y-2">
              <Label>Clinical Note</Label>
              <Textarea 
                className="h-32" 
                value={formData.clinicalNote} 
                onChange={e => setFormData({...formData, clinicalNote: e.target.value})} 
                required 
              />
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-4">
              <div className="space-y-2 col-span-1">
                <Label>Billed Code</Label>
                <Input value={formData.billingCode} onChange={e => setFormData({...formData, billingCode: e.target.value})} required />
              </div>
              <div className="space-y-2 col-span-1">
                <Label>Description</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div className="space-y-2 col-span-1">
                <Label>Amount</Label>
                <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit & Audit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
