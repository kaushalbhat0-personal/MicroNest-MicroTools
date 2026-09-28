import { Badge } from "@/components/ui/badge";
import type { FirmMember } from "../types/firm-types";
import { MemberRoleForm } from "./member-role-form";

export function MembersTable({ members, currentUserId }: { members: FirmMember[]; currentUserId: string | null }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Member ID</th>
            <th className="p-3">User ID</th>
            <th className="p-3">Role</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-3 font-mono text-xs">{m.id.slice(0, 8)}…</td>
              <td className="p-3 font-mono text-xs">
                {m.user_id.slice(0, 8)}… {m.user_id === currentUserId && <Badge>you</Badge>}
              </td>
              <td className="p-3">
                <Badge variant="outline">{m.role}</Badge>
              </td>
              <td className="p-3">
                <MemberRoleForm memberId={m.id} currentRole={m.role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
