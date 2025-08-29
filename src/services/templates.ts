import { db } from "@/lib/firebase";
import { addDoc, collection, query, getDocs, orderBy, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";

export const templatesCol = collection(db, "emailTemplates");

// CRUD helpers
export const addTemplate = async (userId: string, payload: Omit<any, "id">) => {
    const ref = await addDoc(templatesCol, {
        ...payload,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
    return ref.id;
};

export const fetchTemplatesForUser = async (userId: string) => {
    const q = query(templatesCol, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};

export const updateTemplate = async (userId: string, id: string, payload: Partial<any>) => {
    const ref = doc(templatesCol, id);
    await updateDoc(ref, { ...payload, updatedAt: Date.now() });
};

export const deleteTemplate = async (userId: string, id: string) => {
    const ref = doc(templatesCol, id);
    await deleteDoc(ref);
};

export const getTemplateById = async (userId: string, id: string) => {
    const ref = doc(templatesCol, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) };
};