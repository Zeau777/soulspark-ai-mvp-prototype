import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Mail, 
  GraduationCap, 
  Building2, 
  Trophy,
  Calendar,
  Users
} from "lucide-react";

interface PartnershipLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_name: string | null;
  role: string | null;
  partnership_type: string;
  wants_demo: boolean;
  created_at: string;
}

const PartnershipLeads = () => {
  const [leads, setLeads] = useState<PartnershipLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    colleges: 0,
    companies: 0,
    sports_teams: 0,
    demo_requests: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('partnership_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const colleges = data?.filter(lead => lead.partnership_type === 'colleges').length || 0;
      const companies = data?.filter(lead => lead.partnership_type === 'companies').length || 0;
      const sports_teams = data?.filter(lead => lead.partnership_type === 'sports_teams').length || 0;
      const demo_requests = data?.filter(lead => lead.wants_demo).length || 0;
      
      setStats({ total, colleges, companies, sports_teams, demo_requests });
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch partnership leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPartnershipIcon = (type: string) => {
    switch (type) {
      case 'colleges': return <GraduationCap className="h-4 w-4" />;
      case 'companies': return <Building2 className="h-4 w-4" />;
      case 'sports_teams': return <Trophy className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getPartnershipLabel = (type: string) => {
    switch (type) {
      case 'colleges': return 'College';
      case 'companies': return 'Company';
      case 'sports_teams': return 'Sports Team';
      default: return type;
    }
  };

  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Organization', 'Role', 'Type', 'Wants Demo', 'Date'],
      ...leads.map(lead => [
        `${lead.first_name} ${lead.last_name}`,
        lead.email,
        lead.organization_name || '',
        lead.role || '',
        getPartnershipLabel(lead.partnership_type),
        lead.wants_demo ? 'Yes' : 'No',
        new Date(lead.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partnership_leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading partnership leads...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Partnership Leads</h1>
          <p className="text-muted-foreground">Manage and track your partnership lead magnets</p>
        </div>
        <Button onClick={exportLeads} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colleges</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.colleges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sports Teams</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sports_teams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demo Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.demo_requests}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Partnership Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Demo</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.first_name} {lead.last_name}
                  </TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.organization_name || '-'}</TableCell>
                  <TableCell>{lead.role || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {getPartnershipIcon(lead.partnership_type)}
                      {getPartnershipLabel(lead.partnership_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.wants_demo ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {leads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No partnership leads yet. Share your lead magnets to start collecting leads!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnershipLeads;