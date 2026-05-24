"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Dashboard() {
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    // Fetch claims from backend
    fetch("http://localhost:8000/api/v1/claims")
      .then(res => res.json())
      .then(data => setClaims(data))
      .catch(err => console.error("Error fetching claims:", err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Claim Audit Dashboard</h1>
        <Link href="/upload" className={buttonVariants({ variant: "default" })}>New Claim</Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No claims found.</TableCell>
                </TableRow>
              ) : (
                claims.map(claim => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-mono text-sm">{claim.id}</TableCell>
                    <TableCell>
                      <Badge variant={claim.status === 'AUDITED' ? 'default' : claim.status === 'FLAGGED' ? 'destructive' : 'secondary'}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${claim.total_amount}</TableCell>
                    <TableCell>
                      <Link href={`/claims/${claim.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>View Audit</Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
