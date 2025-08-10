import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, PlusCircle, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const cohorts = [
  { name: "Marketing", members: 180, invites: 2, status: "Open" },
  { name: "Engineering", members: 220, invites: 1, status: "Open" },
  { name: "Campus — Freshman", members: 350, invites: 3, status: "Open" },
  { name: "Team — Women’s Soccer", members: 28, invites: 0, status: "Closed" },
];

export default function CohortManagementPreview() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignInAction = (action: string) => {
    toast({ title: "Sign in required", description: `${action} is available to organization admins.` });
    navigate('/auth#signup');
  };

  const copySampleInvite = (cohort: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join?cohort=${encodeURIComponent(cohort)}&token=PREVIEW1234`);
    toast({ title: "Copied example invite", description: `Invite link for ${cohort}. Sign in to manage real invites.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Cohort Management</CardTitle>
        <CardDescription>Organize members by group, class, or team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Preview mode. Actions are disabled.
          </div>
          <Button variant="secondary" onClick={() => handleSignInAction('Create cohort')}>
            <PlusCircle className="h-4 w-4 mr-2" /> Create Cohort
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cohort</TableHead>
              <TableHead className="text-right">Members</TableHead>
              <TableHead className="text-right">Active Invites</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.map((c) => (
              <TableRow key={c.name}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-right">{c.members}</TableCell>
                <TableCell className="text-right">{c.invites}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={c.status === 'Open' ? 'default' : 'secondary'}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" onClick={() => handleSignInAction('Manage members')}>Manage</Button>
                  <Button size="sm" variant="outline" onClick={() => copySampleInvite(c.name)}>
                    <Copy className="h-4 w-4 mr-2" /> Invite
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
