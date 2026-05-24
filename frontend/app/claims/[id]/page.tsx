"use client";

import { useEffect, useState, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AuditResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [claim, setClaim] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/claims/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => setClaim(data))
      .catch(err => console.error(err));
  }, [resolvedParams.id]);

  if (!claim) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Audit Report</h1>
        <Badge variant={claim.status === 'AUDITED' ? 'default' : 'secondary'} className="text-lg py-1 px-4">
          {claim.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Claim ID:</strong> {claim.id}</p>
            <p><strong>Total Amount:</strong> ${claim.total_amount}</p>
            <h4 className="font-semibold mt-4">Billed Items:</h4>
            <ul className="list-disc pl-5">
              {claim.claim_items.map((item: any) => (
                <li key={item.id}>{item.billing_code} - {item.description} (${item.billed_amount})</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {claim.audit_result ? (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>Confidence Score:</strong> {(claim.audit_result.confidence_score * 100).toFixed(0)}%</p>
              
              <div>
                <h4 className="font-semibold text-red-600 mb-1">Missing Codes (Potential Lost Revenue)</h4>
                {claim.audit_result.missing_codes.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {claim.audit_result.missing_codes.map((c: any, i: number) => (
                      <li key={i}><strong>{c.code}:</strong> {c.reason}</li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">None identified.</p>}
              </div>

              <div>
                <h4 className="font-semibold text-orange-600 mb-1">Unsupported Codes (Compliance Risk)</h4>
                {claim.audit_result.unsupported_codes.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {claim.audit_result.unsupported_codes.map((c: any, i: number) => (
                      <li key={i}><strong>{c.code}:</strong> {c.reason}</li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">None identified.</p>}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-1">Summary</h4>
                <p className="text-sm">{claim.audit_result.audit_summary}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>AI Analysis</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Audit is still pending or encountered an error.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
