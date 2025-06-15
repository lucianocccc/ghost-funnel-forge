
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CompanyPanel: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Carica società dove user è owner o membro
    const load = async () => {
      // Come owner
      const { data: owned } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id);

      // Come membro
      const { data: membershipsRows } = await supabase
        .from("company_memberships")
        .select("company_id, role")
        .eq("user_id", user.id);

      const companyIds = membershipsRows ? membershipsRows.map(m => m.company_id) : [];
      let asMember: any[] = [];
      if (companyIds.length) {
        const { data: companiesRows } = await supabase
          .from("companies")
          .select("*")
          .in("id", companyIds);
        asMember = companiesRows || [];
      }

      setCompanies([...(owned || []), ...asMember]);
      setMemberships(membershipsRows || []);
      setLoading(false);
    };
    load();
  }, [user, creating]);

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) return;
    setCreating(true);
    await supabase.from("companies").insert({
      name: newCompanyName,
      owner_id: user.id
    });
    setNewCompanyName("");
    setCreating(false);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Le tue società</h3>
      {loading && <div>Caricamento...</div>}
      {!loading && !companies.length && (
        <div className="text-gray-500 mb-4">Non fai parte di nessuna società.</div>
      )}
      <div className="space-y-3">
        {companies.map(c => (
          <div key={c.id} className="border rounded px-4 py-2 flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-gray-500">
                {c.owner_id === user.id ? (
                  <Badge className="bg-golden text-black">Owner</Badge>
                ) : (
                  <Badge variant="outline">Membro</Badge>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <h4 className="font-semibold mb-2">Crea una nuova società</h4>
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            handleCreateCompany();
          }}
        >
          <Input
            value={newCompanyName}
            onChange={e => setNewCompanyName(e.target.value)}
            placeholder="Nome della società"
          />
          <Button type="submit" disabled={creating || !newCompanyName.trim()}>
            {creating ? "Creazione..." : "Crea"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompanyPanel;
