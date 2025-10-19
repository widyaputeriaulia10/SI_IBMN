// AddItemModal.jsx — drop-in pengganti
import React from "react";
import "./AddItemModal.css";

/** Mini Field component — kalau kamu sudah punya, ganti dengan punyamu */
function Field({ label, required, error, hint, children }) {
  return (
    <label className="af-field">
      <div className="af-label">
        {label}{" "}
        {required && (
          <span className="af-req" aria-hidden="true">
            *
          </span>
        )}
      </div>
      {children}
      {hint && !error && <div className="af-hint">{hint}</div>}
      {error && (
        <div className="af-error" role="alert">
          {error}
        </div>
      )}
    </label>
  );
}

const initialForm = {
  Kode_Barang: "",
  Nama_Barang: "",
  NUP: "",
  Nama_Ruangan: "",
  Merek_Tipe: "",
  Tahun_Perolehan: "",
  Penguasaan: "",
  Jumlah_Barang: 0,
  Keterangan: "BAIK",
};

const currentYear = new Date().getFullYear();

export default function AddItemModalExport({ open, onCancel, onSave }) {
  const [form, setForm] = React.useState(initialForm);
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  // reset on open
  React.useEffect(() => {
    if (open) {
      setForm(initialForm);
      setErrors({});
      // lock background scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const isDirty = React.useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = React.useCallback(
    (draft = form) => {
      const e = {};
      const req = (k, label = k) => {
        if (!String(draft[k] ?? "").trim()) e[k] = "Wajib diisi";
      };

      req("Nama_Barang");
      req("NUP");
      req("Nama_Ruangan");
      req("Penguasaan");

      // Tahun_Perolehan: angka wajar
      if (String(draft.Tahun_Perolehan ?? "").trim() === "") {
        e.Tahun_Perolehan = "Wajib diisi";
      } else if (!/^\d+$/.test(String(draft.Tahun_Perolehan))) {
        e.Tahun_Perolehan = "Harus angka bulat";
      } else {
        const y = Number(draft.Tahun_Perolehan);
        if (y < 1950 || y > currentYear) e.Tahun_Perolehan = `Antara 1950–${currentYear}`;
      }

      // Jumlah_Barang: int ≥ 0
      const jb = String(draft.Jumlah_Barang ?? "").trim();
      if (jb === "") e.Jumlah_Barang = "Wajib diisi (boleh 0)";
      else if (!/^\d+$/.test(jb)) e.Jumlah_Barang = "Harus angka bulat ≥ 0";

      return e;
    },
    [form]
  );

  // keyboard (Esc/Enter) + focus first invalid
  const firstInvalidRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = ev => {
      if (ev.key === "Escape") {
        if (!submitting && (!isDirty || window.confirm("Batalkan perubahan?"))) onCancel?.();
      }
      if (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) {
        // Ctrl/Cmd+Enter → submit cepat
        document.getElementById("btn-save-additem")?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, submitting, isDirty, onCancel]);

  React.useEffect(() => {
    if (!open) return;
    // autofocus ke Nama_Barang saat buka
    firstInvalidRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const submit = async ev => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      // fokus ke field pertama yang error
      const firstKey = Object.keys(e)[0];
      document.querySelector(`[name="${firstKey}"]`)?.focus();
      return;
    }

    const payload = {
      Kode_Barang: String(form.Kode_Barang || "").trim(),
      Nama_Barang: String(form.Nama_Barang).trim(),
      NUP: String(form.NUP).trim(),
      Nama_Ruangan: String(form.Nama_Ruangan).trim(),
      Merek_Tipe: String(form.Merek_Tipe || "").trim(),
      Tahun_Perolehan: parseInt(form.Tahun_Perolehan, 10),
      Penguasaan: String(form.Penguasaan).trim(),
      Jumlah_Barang: parseInt(form.Jumlah_Barang, 10),
      Keterangan: String(form.Keterangan || "BAIK").trim(),
    };

    try {
      setSubmitting(true);
      const maybePromise = onSave?.(payload);
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise; // tunggu bila async
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    if (!isDirty || window.confirm("Batalkan perubahan?")) onCancel?.();
  };

  return (
    <div className="af-overlay" role="dialog" aria-modal="true" aria-labelledby="additem-title" onMouseDown={e => e.target === e.currentTarget && handleCancel()}>
      <form className="af-card" onSubmit={submit} onKeyDown={e => e.key === "Enter" && e.target.tagName === "INPUT" && e.preventDefault()}>
        <div className="af-head">
          <h3 id="additem-title">Tambah Barang</h3>
        </div>

        <div className="af-grid">
          <Field label="Kode Barang" hint="Opsional" error={errors.Kode_Barang}>
            <input name="Kode_Barang" className="af-input" placeholder="3.05.02.01.003" value={form.Kode_Barang} onChange={e => set("Kode_Barang", e.target.value)} inputMode="text" autoComplete="off" />
          </Field>

          <Field label="Nama Barang" required error={errors.Nama_Barang}>
            <input name="Nama_Barang" className="af-input" placeholder="Kursi Direksi" value={form.Nama_Barang} onChange={e => set("Nama_Barang", e.target.value)} ref={firstInvalidRef} autoFocus />
          </Field>

          <Field label="NUP" required error={errors.NUP}>
            <input name="NUP" className="af-input" placeholder="R.1.01" value={form.NUP} onChange={e => set("NUP", e.target.value)} />
          </Field>

          <Field label="Nama Ruangan" required error={errors.Nama_Ruangan}>
            <input name="Nama_Ruangan" className="af-input" placeholder="Aula" value={form.Nama_Ruangan} onChange={e => set("Nama_Ruangan", e.target.value)} />
          </Field>

          <Field label="Merek Tipe" hint="Opsional">
            <input name="Merek_Tipe" className="af-input" placeholder="LG" value={form.Merek_Tipe} onChange={e => set("Merek_Tipe", e.target.value)} />
          </Field>

          <Field label="Tahun Perolehan" required error={errors.Tahun_Perolehan} hint={`1950–${currentYear}`}>
            <input name="Tahun_Perolehan" className="af-input" type="number" inputMode="numeric" min={1950} max={currentYear} placeholder="2021" value={form.Tahun_Perolehan} onChange={e => set("Tahun_Perolehan", e.target.value.replace(/[^\d]/g, ""))} />
          </Field>

          <Field label="Penguasaan" required error={errors.Penguasaan} hint="Contoh: FST">
            <input name="Penguasaan" className="af-input" placeholder="FST" value={form.Penguasaan} onChange={e => set("Penguasaan", e.target.value)} />
          </Field>

          <Field label="Jumlah Barang" required error={errors.Jumlah_Barang} hint="Angka bulat, boleh 0">
            <input name="Jumlah_Barang" className="af-input" type="number" inputMode="numeric" min={0} step={1} placeholder="0" value={form.Jumlah_Barang} onChange={e => set("Jumlah_Barang", e.target.value.replace(/[^\d]/g, ""))} />
          </Field>

          <Field label="Keterangan" hint="Opsional; default BAIK">
            <input name="Keterangan" className="af-input" placeholder="BAIK" value={form.Keterangan} onChange={e => set("Keterangan", e.target.value)} />
          </Field>
        </div>

        <div className="af-actions">
          <button type="button" className="af-btn" onClick={handleCancel} disabled={submitting}>
            Batal
          </button>
          <button id="btn-save-additem" type="submit" className="af-btn af-primary" disabled={submitting || Object.keys(validate(form)).length > 0}>
            {submitting ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
