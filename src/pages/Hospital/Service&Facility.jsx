import { useEffect, useMemo, useState } from "react";
import {Building2,ChevronLeft,ChevronRight,ImagePlus,MoreVertical,Plus,Search,Sparkles,UploadCloud,X} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import defaultImage from "../../assets/hospital_image.png";
import {createServiceFacility,deleteServiceFacility,getHospitalServicesFacilities,updateServiceFacility} from "../../api/hospitalApi";
import { compressImage } from "../../utils/compressImage";

export const ServiceAndFacility = () => {
  const { setHeaderContent } = useOutletContext();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [menu, setMenu] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({name: "", type: "Service", description: "", status: "active"});
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = () =>
    getHospitalServicesFacilities()
      .then((r) => setItems(r.items || []))
      .catch(() => setItems([]));
   
  
      
  useEffect(() => {
    setHeaderContent({
      title: "Services & Facility",
      subtitle: "Manage the services and facilities available at your hospital",
      action: undefined,
    });
    load();
  }, [setHeaderContent]);

  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (!query ||
            `${item.name} ${item.description}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (category === "All" || item.type === category),
      ),
    [category, items, query],
  );

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      status: item.status,
    });
    setMenu(null);
  };
  
  const save = async () => {
    try {
      await updateServiceFacility(editing._id, form);
      await load();
      setEditing(null);
    } catch (e) {
      setError(e.message || "Unable to update item");
    }
  };

  const add = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      setError("Name and description are required");
      return;
    }
    try {
      setSaving(true);
      const compressedImage = image ? await compressImage(image) : null;
      await createServiceFacility(form, compressedImage);
      await load();
      setAdding(false);
      setImage(null);
      setForm({ name: "", type: "Service", description: "", status: "active" });
    } catch (e) {
      setError(e.message || "Unable to add item");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this service or facility?")) return;
    try {
      await deleteServiceFacility(id);
      await load();
      setMenu(null);
    } catch (e) {
      setError(e.message || "Unable to delete item");
    }
  };

  return (
    <section className="min-h-[calc(100vh-120px)] bg-slate-50 px-3 py-5 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <label className="flex h-10 min-w-[230px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
            <Search className="size-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services or facilities..."
              className="min-w-0 flex-1 text-xs font-semibold outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setError("");
              setAdding(true);
            }}
            className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Add Service/Facility
          </button>
          <div className="flex rounded-lg bg-slate-50 p-1">
            {[
              ["All", `All (${items.length})`],
              [
                "Service",
                `Services (${items.filter((i) => i.type === "Service").length})`,
              ],
              [
                "Facility",
                `Facilities (${items.filter((i) => i.type === "Facility").length})`,
              ],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setCategory(v)}
                className={`cursor-pointer rounded-md px-3 py-2 text-xs font-bold ${category === v ? "bg-blue-50 text-blue-600" : "text-slate-500"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        {visible.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((item) => (
              <article
                key={item._id}
                className="flex h-full flex-col overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={item.imageUrl || defaultImage}
                  alt={item.name}
                  className="h-24 w-full rounded-t-xl object-cover"
                />
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-base font-extrabold text-slate-800">
                    {item.name}
                  </h2>
                  <p className="mt-2 min-h-10 flex-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                  <div className="relative mt-4 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                    >
                      {item.status === "active" ? "Active" : "Inactive"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setMenu(menu === item._id ? null : item._id)
                      }
                      className="cursor-pointer rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === item._id && (
                      <div className="absolute bottom-9 right-0 z-20 w-28 rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold shadow-xl">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="w-full cursor-pointer rounded px-2 py-2 text-left hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item._id)}
                          className="w-full cursor-pointer rounded px-2 py-2 text-left text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Building2 className="mx-auto size-10 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">
              No services or facilities added yet
            </p>
          </div>
        )}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>
            Showing {visible.length} of {items.length} items
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              className="cursor-pointer rounded border bg-white p-1.5"
            >
              <ChevronLeft className="size-3" />
            </button>
            <span className="rounded bg-blue-600 px-2.5 py-1.5 text-white">
              1
            </span>
            <button
              type="button"
              className="cursor-pointer rounded border bg-white p-1.5"
            >
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </div>
      {adding && (
        <div className="fixed inset-0 z-50 grid min-h-full place-items-center overflow-y-auto bg-slate-950/40 p-2 sm:p-4">
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-blue-600 px-5 py-4 text-white"><div><h2 className="text-lg font-extrabold">Add Service / Facility</h2><p className="mt-0.5 text-[11px] text-blue-100">Add an offering to your hospital profile.</p></div><button type="button" onClick={() => setAdding(false)} className="rounded-lg p-1.5 hover:bg-white/15"><X className="size-5" /></button></div>
            <div className="space-y-3 p-5">
              <label className="block text-xs font-bold text-slate-700">Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option value="Service">Service</option><option value="Facility">Facility</option></select></label>
              <label className="block text-xs font-bold text-slate-700">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Radiology" className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label>
              <label className="block text-xs font-bold text-slate-700">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Briefly describe this service or facility" className="mt-1 h-16 w-full resize-none rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500" /></label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 p-3 text-sm font-semibold text-slate-600"><UploadCloud className="size-5 text-blue-600" /><span className="flex-1">{image ? image.name : "Upload image (optional)"}</span><input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" /></label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.status === "active"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "active" : "inactive" })} className="size-4 accent-blue-600" /> Visible to patients</label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3"><button type="button" onClick={() => setAdding(false)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white">Cancel</button><button type="button" onClick={add} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Adding..." : "Add Service"}</button></div>
          </div>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex justify-between">
              <h2 className="text-lg font-extrabold">Edit {editing.type}</h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>
            <label className="mt-5 block text-xs font-bold">
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-lg border px-3"
              />
            </label>
            <label className="mt-4 block text-xs font-bold">
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-1.5 h-20 w-full rounded-lg border p-2"
              />
            </label>
            <label className="mt-4 flex items-center gap-2 text-xs font-bold">
              <input
                type="checkbox"
                checked={form.status === "active"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.checked ? "active" : "inactive",
                  })
                }
              />{" "}
              Active
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
