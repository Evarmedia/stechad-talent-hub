import { useState } from "react";
import { useRemoteData } from "@/hooks/useRemoteData";
import RecordPagination, {
  type Pagination,
} from "@/components/RecordPagination";
import ServerDataState from "@/components/ServerDataState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
type Logs = {
  logs: {
    audit_log_id: string;
    actor_name?: string;
    actor_user_id?: string;
    action: string;
    target_type: string;
    target_id?: string;
    outcome: string;
    occurred_at: string;
    changes: Record<string, unknown>;
  }[];
  pagination: Pagination;
};
export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    actor_user_id: "",
    target_type: "",
    target_id: "",
    action: "",
    outcome: "",
    start_date: "",
    end_date: "",
  });
  const remote = useRemoteData<Logs>("admin/audit-logs", { page, ...filters });
  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div>
        <h1 className='text-2xl font-bold text-primary'>Audit logs</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Key user activities and system actions. Records are read-only.
        </p>
      </div>
      <Card>
        <CardContent className='pt-6'>
          <div className='mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {(
              [
                // ["actor_user_id", "Actor user ID"],
                // ["action", "Action"],
                // ["target_type", "Target type"],
                // ["target_id", "Target ID"],
                ["start_date", "From"],
                ["end_date", "To"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type={key.endsWith("date") ? "date" : "text"}
                  value={filters[key]}
                  onChange={(event) => {
                    setFilters((previous) => ({
                      ...previous,
                      [key]: event.target.value,
                    }));
                    setPage(1);
                  }}
                />
              </div>
            ))}
            <div>
              <Label htmlFor='outcome'>Outcome</Label>
              <select
                id='outcome'
                className='w-full p-2 text-sm'
                value={filters.outcome}
                onChange={(event) => {
                  setFilters((previous) => ({
                    ...previous,
                    outcome: event.target.value,
                  }));
                  setPage(1);
                }}
              >
                <option value=''>All outcomes</option>
                <option value='success'>Success</option>
                <option value='failure'>Failure</option>
              </select>
            </div>
          </div>
          {remote.loading || remote.error ? (
            <ServerDataState
              title='Audit logs'
              error={remote.error}
              onRetry={remote.reload}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "Time",
                      "Actor",
                      "Action",
                      "Target",
                      "Outcome",
                      "Details",
                    ].map((label) => (
                      <TableHead key={label}>{label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remote.data?.logs.map((log) => (
                    <TableRow key={log.audit_log_id}>
                      <TableCell className='whitespace-nowrap'>
                        {new Date(log.occurred_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <p>{log.actor_name || "System / unauthenticated"}</p>
                        <p className='max-w-44 break-all text-xs text-muted-foreground'>
                          {log.actor_user_id}
                        </p>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <p>{log.target_type}</p>
                        <p className='max-w-44 break-all text-xs text-muted-foreground'>
                          {log.target_id}
                        </p>
                      </TableCell>
                      <TableCell>{log.outcome}</TableCell>
                      <TableCell>
                        {Object.keys(log.changes).length > 0 && (
                          <details>
                            <summary className='cursor-pointer text-primary'>
                              View changes
                            </summary>
                            <pre className='max-w-sm whitespace-pre-wrap break-all text-xs'>
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </details>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!remote.data?.logs.length && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='py-10 text-center text-muted-foreground'
                      >
                        No audit records match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <RecordPagination
                pagination={remote.data?.pagination}
                page={page}
                onChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
