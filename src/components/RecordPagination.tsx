import { Button } from "@/components/ui/button";
export type Pagination = { currentPage: number; totalPages: number; totalItems: number };
export default function RecordPagination({ pagination, page, onChange }: { pagination?: Pagination; page: number; onChange: (page: number) => void }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm"><span>{pagination?.totalItems ?? 0} records · Page {page} of {Math.max(1, pagination?.totalPages || 1)}</span><div className="flex gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button><Button variant="outline" disabled={!pagination || page >= pagination.totalPages} onClick={() => onChange(page + 1)}>Next</Button></div></div>;
}
