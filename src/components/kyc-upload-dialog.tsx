import { useRef, useState } from "react";
import { CheckCircle2, Circle, CloudUpload, X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { validateKycFile } from "@/lib/kyc-validation";
import { submitKyc } from "@/lib/kyc.functions";

export function KycUploadDialog({ open, onOpenChange, onSubmitted }: { open: boolean; onOpenChange: (open: boolean) => void; onSubmitted: () => Promise<void> }) {
  const [files, setFiles] = useState<(File | null)[]>([null, null]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const identityInput = useRef<HTMLInputElement>(null);
  const addressInput = useRef<HTMLInputElement>(null);
  const count = files.filter(Boolean).length;
  function choose(index: number, file?: File) {
    if (!file) return;
    const message = validateKycFile(file);
    setError(message);
    if (!message) setFiles(current => current.map((old, i) => i === index ? file : old));
  }
  async function submit() {
    const [identity, address] = files;
    if (!identity || !address || busy) return;
    setBusy(true); setError("");
    const uploaded: string[] = [];
    let saved = false;
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) throw new Error("Please sign in again.");
      for (const file of [identity, address]) {
        const validation = validateKycFile(file);
        if (validation) throw new Error(validation);
        const path = `${data.user.id}/${crypto.randomUUID()}.${file.name.split(".").pop()?.toLowerCase()}`;
        const { error: uploadError } = await supabase.storage.from("kyc-documents").upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error("Document upload failed. Please try again.");
        uploaded.push(path);
      }
      const [identityPath, addressPath] = uploaded;
      if (!identityPath || !addressPath) throw new Error("Both documents are required.");
      await submitKyc({ data: { identityPath, addressPath } });
      saved = true;
      await onSubmitted();
      setFiles([null, null]); onOpenChange(false);
    } catch (e) {
      if (!saved && uploaded.length) await supabase.storage.from("kyc-documents").remove(uploaded);
      setError(e instanceof Error ? e.message : "Unable to submit documents.");
    } finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={value => { if (!busy) onOpenChange(value); }}><DialogContent className="w-[calc(100%-32px)] max-w-[440px] max-h-[90dvh] overflow-y-auto rounded-2xl gap-0 p-0 [&>button]:disabled:pointer-events-none" onInteractOutside={event => { if (busy) event.preventDefault(); }} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}>
    <DialogHeader className="border-b border-border px-5 py-5 text-left"><DialogTitle className="text-base tracking-normal">Upload Documents</DialogTitle><DialogDescription className="sr-only">Upload proof of identity and proof of address.</DialogDescription></DialogHeader>
    <div className="px-5 py-5 text-xs leading-[1.55]">
      <h3 className="text-sm font-bold">Important Notes</h3>
      <p className="mt-2">Credit card statements, utility bills (water, electricity, gas, internet) must be from the past three months. Mainland China customers can provide only the front and back sides of their National ID as sufficient proof for both identity and address.</p>
      <div className="my-4 border-y border-dashed border-border py-4"><div className="flex justify-between"><h3 className="text-sm font-bold">Checklist</h3><span>{count} / 2</span></div><div className="my-2 flex h-1 overflow-hidden bg-muted">{files.map((file, index) => <span key={index} className={`w-1/2 ${file ? "bg-primary" : "bg-muted"}`} />)}</div>{["Upload Proof of Identity", "Upload Proof of Address"].map((label, index) => <p key={label} className="mt-2 flex items-center gap-2 font-semibold">{files[index] ? <CheckCircle2 className="size-4 text-primary" /> : <Circle className="size-4 text-muted-foreground" />}{label}</p>)}</div>
      {["Proof of Identity (Passport, National ID)", "Proof of Address (Credit Card Statement, Bill)"].map((label, index) => <section key={label} className={index === 0 ? "border-b border-dashed border-border pb-4" : "pt-4"}>
        <h3 className="font-bold">{label}</h3><p className="mt-2">Upload images in JPG, JPEG, PNG, or PDF format. Max size: 10MB.</p>
        <input ref={index === 0 ? identityInput : addressInput} type="file" accept=".jpg,.jpeg,.png,.pdf" aria-label={index === 0 ? "Proof of identity file" : "Proof of address file"} className="hidden" disabled={busy} onChange={event => { choose(index, event.target.files?.[0]); event.target.value = ""; }} />
        {files[index] ? <div className="mt-3 flex min-w-0 items-center gap-2 rounded-md border border-border p-2"><FileText className="size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1 break-all">{files[index]?.name}</span><Button variant="ghost" size="icon" aria-label={`Remove ${index === 0 ? "identity" : "address"} document`} disabled={busy} onClick={() => setFiles(current => current.map((file, i) => i === index ? null : file))}><X /></Button></div> : <Button variant="outline" className={`mt-3 h-[72px] w-[72px] flex-col gap-1 text-xs ${index === 0 ? "border-primary" : "border-muted-foreground"}`} disabled={busy} onClick={() => (index === 0 ? identityInput : addressInput).current?.click()} aria-label={index === 0 ? "Upload proof of identity" : "Upload proof of address"}><CloudUpload className="size-4" />Upload</Button>}
      </section>)}
      {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
      <Button className="mt-4 h-11 w-full rounded-full font-bold" disabled={count !== 2 || busy} onClick={submit}>{busy ? "Submitting…" : "Submit"}</Button>
    </div>
  </DialogContent></Dialog>;
}